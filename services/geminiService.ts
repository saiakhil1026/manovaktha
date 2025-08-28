import { GoogleGenAI, Type, Chat } from "@google/genai";
import { type Solution, type SolutionResponse, type Language, type ChatMessage, type JourneyPlan, type JourneyDayContent } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
let chat: Chat | null = null;

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
    newMessage: string,
    language: Language,
    journeyState: 'INITIAL' | 'AWAITING_DURATION' | 'AWAITING_CONFIRMATION'
): AsyncGenerator<string | { journeyPlan: Omit<JourneyPlan, 'originalProblem'> }> {

    const systemInstruction = getChatSystemInstruction(language);
    
    // Convert our app's message format to the Gemini API's format
    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));
    contents.push({ role: 'user', parts: [{ text: newMessage }] });

    // Remove the initial system message from the history sent to the model
    const modelContents = contents.slice(1);
    
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

export async function* streamTempChat(
    sessionHistory: ChatMessage[],
    newMessage: string,
    language: Language
): AsyncGenerator<string> {
    const systemInstruction = `You are a specialized mentalist and a wise friend. Your name is 'Chintan' (meaning 'thought' or 'reflection'). You engage in a friendly, conversational, and deeply empathetic manner. The user is coming to you with a life problem. Your goal is to help them think through their problem and provide one clear, actionable solution rooted in the wisdom of the Vedas and Hindu Puranas.
    - Be conversational and friendly, not overly formal like a guru. Use 'you' and 'I'.
    - Listen to their problem carefully. Ask clarifying questions if needed.
    - Guide them to see the problem from a different perspective.
    - When you provide the solution, present it as a story or a teaching from the scriptures, and explicitly state the source (e.g., 'from the Katha Upanishad').
    - Keep the tone supportive and encouraging throughout.
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
        console.error("Temp chat stream error:", error);
        if (isRateLimitError(error)) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }
        throw error;
    }
}