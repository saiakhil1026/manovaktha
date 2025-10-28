
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { type Solution, type SolutionResponse, type Language, type ChatMessage, type JourneyPlan, type JourneyDayContent, type VideoSuggestion, type DoctorProfile } from '../types';

if (!process.env.API_KEY && !import.meta.env?.VITE_API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const apiKey = process.env.API_KEY || import.meta.env?.VITE_API_KEY;
const ai = new GoogleGenAI({ apiKey });

const solutionSchema = {
    type: Type.OBJECT,
    properties: {
        solutions: {
            type: Type.ARRAY,
            description: "An array of 10 solutions from Hindu scriptures.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "A concise title for the solution."
                    },
                    story: {
                        type: Type.STRING,
                        description: "The solution presented as a story or teaching."
                    },
                    reference: {
                        type: Type.STRING,
                        description: "The source reference from the scripture (e.g., 'Bhagavad Gita, Chapter 2, Verse 47')."
                    }
                },
                required: ["title", "story", "reference"]
            }
        }
    },
    required: ["solutions"]
};

const isRateLimitError = (error: unknown): boolean => {
    return error instanceof Error && error.message.includes('RESOURCE_EXHAUSTED');
};


export async function getSolutionsFromPuranas(userProblem: string, language: Language): Promise<Solution[]> {
  try {
    const prompt = `
    You are 'Mano Vaktha' (The Speaker of the Mind), a wise, compassionate, and deeply knowledgeable spiritual guide steeped in the wisdom of the Bhagavad Gita and all Hindu Puranas. A user, who is like a disciple seeking guidance, will present you with a life problem. Your sacred duty is to provide 10 unique, profound, and practical solutions drawn from the timeless teachings and stories of these sacred texts.

    Analyze the user's problem with empathy: "${userProblem}"

    Now, generate 10 distinct solutions. Each solution must be a pearl of wisdom that will illuminate the user's path. Ensure each solution:
    1. Is presented as a short, inspiring story, an allegory, or a teaching from the Bhagavad Gita or a Purana.
    2. Clearly and compassionately relates the moral of the story to the user's specific problem.
    3. Includes a precise reference to the source (e.g., "Bhagavad Gita, Chapter 2, Verse 47" or "Srimad Bhagavatam, Canto 10, Chapter 5").
    4. IMPORTANT: The entire response, from titles to stories to references, MUST be in eloquent and accessible ${language}.
    5. The tone should be comforting, wise, and encouraging, like a true Guru guiding a seeker.

    Return your response in a structured JSON format according to the provided schema.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: solutionSchema,
            temperature: 0.85, 
        },
    });

    const jsonText = response.text.trim();
    const parsedResponse: SolutionResponse = JSON.parse(jsonText);
    
    if (parsedResponse && Array.isArray(parsedResponse.solutions)) {
      return parsedResponse.solutions;
    } else {
      console.warn("Received empty or invalid solutions array:", parsedResponse);
      return [];
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (isRateLimitError(error)) {
        throw new Error("RATE_LIMIT_EXCEEDED");
    }
    throw new Error("Failed to fetch solutions from the divine scriptures.");
  }
}

// --- New Chat Functionality ---

const journeyPlanSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A short, inspiring title for the wellness journey based on the user's problem."
        },
        days: {
            type: Type.ARRAY,
            description: "An array of daily topics for the user's journey.",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.INTEGER },
                    topic: { type: Type.STRING, description: "A concise theme for the day's session." }
                },
                required: ["day", "topic"]
            }
        }
    },
    required: ["title", "days"]
};

export const getChatSystemInstruction = (language: Language) => `You are 'Mano Vaktha', a serene, empathetic, and profoundly wise mental wellness guide. Your wisdom is rooted in the teachings of Sanatana Dharma. You are having a healing conversation.
- Your primary goal is to listen and provide gentle, non-judgmental guidance.
- Use calming and supportive language. Address the user with respect and compassion.
- IMPORTANT: Your entire response must be in ${language}.
- Keep your responses concise and easy to understand.
- You will guide the user to create a structured wellness journey. Follow the user's conversational state.
- Stage 1: The user describes their problem. Your response should be empathetic and then ask them how many days they can commit to a healing journey.
- Stage 2: The user provides a number of days. You will then generate a day-by-day plan for them based on their problem and the number of days. The plan should be returned in the requested JSON format. After generating the plan, you MUST ask the user for confirmation (e.g., 'Are you ready to begin this journey?').
- Stage 3: The user confirms. You will give a final encouraging message to start the journey.`;

export async function* streamMessageToExpert(
    history: ChatMessage[],
    language: Language,
    journeyState: 'INITIAL' | 'AWAITING_DURATION' | 'AWAITING_CONFIRMATION'
): AsyncGenerator<string | { journeyPlan: Omit<JourneyPlan, 'originalProblem'> }> {

    const systemInstruction = getChatSystemInstruction(language);
    
    // Convert our app's message format to the Gemini API's format
    const modelContents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));
    
    try {
        if (journeyState === 'AWAITING_DURATION') {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: modelContents,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: journeyPlanSchema
                }
            });
            const jsonText = response.text.trim();
            try {
                const parsedPlan = JSON.parse(jsonText);
                const journeyPlan: Omit<JourneyPlan, 'originalProblem'> = {
                    title: parsedPlan.title,
                    days: parsedPlan.days.map((d: any) => ({...d, completed: false}))
                };
                yield { journeyPlan };
            } catch (e) {
                 console.error("Failed to parse journey plan:", e);
                 yield "I apologize, I had trouble creating the plan. Could you please try rephrasing your request?";
            }
        } else {
            const responseStream = await ai.models.generateContentStream({
                model: "gemini-2.5-flash",
                contents: modelContents,
                config: {
                    systemInstruction: systemInstruction,
                },
            });

            for await (const chunk of responseStream) {
                yield chunk.text;
            }
        }
    } catch (error) {
        console.error("Chat stream error:", error);
        if (isRateLimitError(error)) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }
        throw error;
    }
}

const journeyDayContentSchema = {
    type: Type.OBJECT,
    properties: {
        introduction: {
            type: Type.STRING,
            description: "A short, insightful, and comforting introduction for the day's session, connecting the user's problem with the session topic."
        },
        stories: {
            type: Type.ARRAY,
            description: "An array of exactly 5 distinct stories, teachings, or allegories from the Puranas or Vedas.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A concise title for the story/teaching." },
                    content: { type: Type.STRING, description: "The story or teaching itself, explaining the moral and linking it to the user's problem." },
                    reference: { type: Type.STRING, description: "The specific scriptural source (e.g., 'Garuda Purana, Chapter 3')." }
                },
                required: ["title", "content", "reference"]
            }
        }
    },
    required: ["introduction", "stories"]
};


export async function getJourneyDayContent(topic: string, originalProblem: string, language: Language): Promise<JourneyDayContent> {
  try {
    const prompt = `
    You are 'Mano Vaktha', a wise and serene spiritual guide. You are conducting a daily wellness session for a user on their healing journey.
    The user's original problem is: "${originalProblem}".
    The topic for today's session is: "${topic}".

    Your task is to generate the content for today's session in a structured JSON format. The content must be deeply rooted in the wisdom of the 18 Puranas or the 4 Vedas.

    The JSON object must contain:
    1.  'introduction': A short, insightful, and comforting intro (2-3 sentences) that connects the user's original problem with today's topic.
    2.  'stories': An array of EXACTLY 5 distinct stories. Each story object in the array must contain:
        a. 'title': A concise, relevant title for the story or teaching.
        b. 'content': The story, teaching, or allegory itself. The moral should be clearly explained and directly linked to the user's problem and the session topic.
        c. 'reference': The precise source from the scripture (e.g., "Vishnu Purana, Book 1, Chapter 9").

    - The tone for all content must be encouraging, peaceful, and wise.
    - IMPORTANT: The entire response, including titles, content, and references, MUST be in ${language}.

    Generate the session content now.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: journeyDayContentSchema,
            temperature: 0.7,
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating journey day content:", error);
    if (isRateLimitError(error)) {
        throw new Error("RATE_LIMIT_EXCEEDED");
    }
    throw new Error("Failed to prepare the day's session content.");
  }
}


export async function* streamSessionChat(
    sessionHistory: ChatMessage[],
    newMessage: string,
    language: Language,
    topic: string,
    originalProblem: string
): AsyncGenerator<string> {
    const systemInstruction = `You are 'Mano Vaktha', a serene and wise guide. You are in a private session with a user, helping them clear their doubts about today's topic.
    - The user's original problem is: "${originalProblem}".
    - Today's session topic is: "${topic}".
    - The user has just read the main teaching for the day (which is the first 'model' message in the history) and is now asking a follow-up question.
    - Your answer should be compassionate, clear, and directly related to the user's question, the session topic, and their original problem.
    - Keep your responses concise and supportive, continuing the healing conversation.
    - IMPORTANT: Your entire response MUST be in ${language}.`;

    const contents = sessionHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));
    contents.push({ role: 'user', parts: [{ text: newMessage }] });
    
    try {
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch(error) {
        console.error("Session chat stream error:", error);
        if (isRateLimitError(error)) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }
        throw error;
    }
}

export async function* streamVedicAnalysis(
    history: ChatMessage[],
    newMessage: string,
    language: Language,
): AsyncGenerator<string> {
    const systemInstruction = `You are 'Mano Vaktha', a personal wellness companion. Your wisdom is rooted in the timeless teachings of the Vedas and Sanatana Dharma. You engage in a supportive, empathetic, and calming conversation.
    - Your primary goal is to help the user understand their feelings and provide gentle, actionable guidance.
    - Analyze the user's input, which may include a topic (like Stress, Anxiety), selected symptoms, and their daily routine.
    - Based on this analysis, provide a thoughtful response that includes:
        1. Empathy and validation of their feelings.
        2. Simple, practical advice based on Vedic principles (e.g., mindfulness, simple yoga poses, breathing exercises, dietary suggestions based on Ayurvedic concepts, connecting with nature).
        3. A short, relevant story or teaching from the scriptures to provide perspective and hope.
    - Your tone should be encouraging and non-clinical. You are a wise friend, not a doctor.
    - Always conclude with a disclaimer: "Mano Vaktha is an AI assistant and not a medical professional. For crises, please contact a healthcare provider."
    - IMPORTANT: Your entire response MUST be in ${language}.`;

    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));
    contents.push({ role: 'user', parts: [{ text: newMessage }] });
    
    try {
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch(error) {
        console.error("Vedic analysis stream error:", error);
        if (isRateLimitError(error)) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }
        throw error;
    }
}

export async function* streamChat(
    history: ChatMessage[],
    newMessage: string,
    language: Language,
): AsyncGenerator<string> {
    const systemInstruction = `You are 'Mano Vaktha', a wise, compassionate, and deeply knowledgeable spiritual guide. Your wisdom comes from the Bhagavad Gita and Hindu Puranas.
    - Engage in a helpful and supportive conversation.
    - Your tone should be comforting, wise, and encouraging.
    - If asked about your identity, describe yourself as a "speaker of the mind" here to offer guidance from ancient scriptures.
    - If the user's query is complex or seems like a deep personal problem, gently suggest they explore the 'Manuscript' section for detailed scriptural solutions or the 'Wellness Journey' for a structured path. For example: "For a deeper exploration of this, the 'Manuscript' section might offer profound stories from the scriptures."
    - Keep responses concise and clear.
    - IMPORTANT: Your entire response MUST be in ${language}.`;

    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));
    contents.push({ role: 'user', parts: [{ text: newMessage }] });
    
    try {
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch(error) {
        console.error("General chat stream error:", error);
        if (isRateLimitError(error)) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }
        throw error;
    }
}


// --- New Media & Doctors Services ---

const videoSuggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        videos: {
            type: Type.ARRAY,
            description: "An array of 6 video suggestions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The compelling title of the video." },
                    description: { type: Type.STRING, description: "A brief, one-sentence summary of the video's content." },
                    youtubeId: { type: Type.STRING, description: "A real, relevant, and existing YouTube video ID (e.g., 'dQw4w9WgXcQ')." },
                    channel: { type: Type.STRING, description: "The name of the YouTube channel." },
                },
                required: ["title", "description", "youtubeId", "channel"]
            }
        }
    },
    required: ["videos"]
};

export async function getVideoSuggestions(problem: string, language: Language): Promise<VideoSuggestion[]> {
    try {
        const prompt = `
        A user is facing the following problem: "${problem}".
        Act as a helpful content curator. Your task is to suggest 6 relevant YouTube videos that could offer guidance, comfort, or a new perspective on this issue.
        The suggestions should be suitable for someone seeking wellness and spiritual balance.
        For each video, provide a title, a brief one-sentence description, a real and relevant YouTube video ID, and the channel name.
        The titles and descriptions MUST be in ${language}.
        Return the response in the specified JSON format.
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: videoSuggestionsSchema,
            }
        });
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return parsed.videos || [];
    } catch (error) {
        console.error("Error getting video suggestions:", error);
        if (isRateLimitError(error)) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }
        throw new Error("Failed to fetch video suggestions.");
    }
}

const doctorListSchema = {
    type: Type.OBJECT,
    properties: {
        doctors: {
            type: Type.ARRAY,
            description: "An array of 8 fictional mental health professionals.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The doctor's full name (e.g., 'Dr. Anjali Sharma')." },
                    specialization: { type: Type.STRING, enum: ['Psychiatrist', 'Therapist', 'Counselor', 'Life Coach'] },
                    experience: { type: Type.INTEGER, description: "Years of professional experience (between 5 and 25)." },
                    rating: { type: Type.NUMBER, description: "A star rating between 4.0 and 5.0, with one decimal place." },
                    bio: { type: Type.STRING, description: "A short, professional bio of 2-3 sentences." }
                },
                required: ["name", "specialization", "experience", "rating", "bio"]
            }
        }
    },
    required: ["doctors"]
};

export async function getDoctorList(language: Language): Promise<DoctorProfile[]> {
    try {
        const prompt = `
        Generate a highly realistic but **strictly fictional** list of 8 mental health professionals based in India for a wellness app. It is crucial that you do not use the names of any real doctors.
        The names, bios, and locations should feel authentic and appropriate for major Indian cities (e.g., Mumbai, Delhi, Bangalore, Chennai). The response must cater to a user who speaks ${language}.

        For each professional, provide:
        1.  **name**: A full name that is common in India (e.g., 'Dr. Priya Sharma', 'Dr. Rohan Kapoor').
        2.  **specialization**: You MUST use one of the following exact values: 'Psychiatrist', 'Therapist', 'Counselor', 'Life Coach'.
        3.  **experience**: An integer between 5 and 25 years.
        4.  **rating**: A number between 4.0 and 5.0 with one decimal point.
        5.  **bio**: A short bio (2-3 sentences) in a professional and empathetic tone. The bio should also be in ${language} and could mention a fictional clinic or area in an Indian city to add realism (e.g., "Practicing in Koramangala, Bangalore...").

        Return the response in the specified JSON format.
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: doctorListSchema,
            }
        });
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return parsed.doctors || [];
    } catch (error) {
        console.error("Error getting doctor list:", error);
        if (isRateLimitError(error)) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }
        throw new Error("Failed to fetch doctor list.");
    }
}
