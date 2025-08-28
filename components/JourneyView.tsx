import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { type ChatMessage, type JourneyPlan, type JourneyDay } from '../types';
import { streamMessageToExpert } from '../services/geminiService';
import SendIcon from './icons/SendIcon';
import { useLanguage } from '../contexts/LanguageContext';
import JourneyDashboard from './JourneyDashboard';
import JourneySession from './JourneySession';

// --- Sound Effects ---
const sendSound = 'data:audio/mpeg;base64,SUQzBAAAAAAAIptEAAAAANDUHJAEBTGl2ZTMuNi45qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//LAME3.98.4UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU...';
const receiveSound = 'data:audio/mpeg;base64,SUQzBAAAAAAAIptEAAAAANDUHJAEBTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-,';
type JourneyState = 'INITIAL' | 'AWAITING_DURATION' | 'AWAITING_CONFIRMATION' | 'JOURNEY_ACTIVE';

interface JourneyViewProps {
    initialProblem?: string;
}

const playAudio = (audioDataUrl: string) => {
  try {
    const audio = new Audio(audioDataUrl);
    audio.volume = 0.4;
    audio.play().catch(error => {
      console.warn("Audio playback was prevented by the browser:", error);
    });
  } catch (error) {
    console.error("Failed to play audio:", error);
  }
};

const JourneyView: React.FC<JourneyViewProps> = ({ initialProblem: initialProblemFromProps = '' }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [journeyState, setJourneyState] = useState<JourneyState>('INITIAL');
    const [journeyPlan, setJourneyPlan] = useState<JourneyPlan | null>(null);
    const [activeDay, setActiveDay] = useState<JourneyDay | null>(null);
    const [initialProblem, setInitialProblem] = useState<string>(initialProblemFromProps);

    const { language, t } = useLanguage();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
        }
    }, [userInput]);

    useEffect(() => {
        if (initialProblemFromProps && journeyState === 'INITIAL') {
            // Fix: Explicitly type the initial message to match ChatMessage['role']
            const initialModelMessage: ChatMessage = { role: 'model', content: `I understand you are facing challenges with: "${initialProblemFromProps}".\n\nTo begin your healing journey, how many days can you dedicate to this path?` };
            setMessages([initialModelMessage]);
            setJourneyState('AWAITING_DURATION');
        } else if (!initialProblemFromProps && journeyState === 'INITIAL' && messages.length === 0) {
            setMessages([
                { role: 'model', content: "Greetings. I am Mano Vaktha. Describe the problem you are facing, and we will create a personalized wellness journey for you." }
            ]);
        }
    }, [initialProblemFromProps, journeyState, messages.length]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput || isLoading || journeyState === 'JOURNEY_ACTIVE') return;

        playAudio(sendSound);
        const newUserMessage: ChatMessage = { role: 'user', content: trimmedInput };
        let currentHistory = [...messages, newUserMessage];
        setMessages(currentHistory);
        setUserInput('');
        setIsLoading(true);
        
        // Add a placeholder for the model's response
        setMessages(prev => [...prev, { role: 'model', content: '' }]);

        try {
            if (journeyState === 'INITIAL') {
                setInitialProblem(trimmedInput);
            }
            
            const problemContext = journeyState === 'INITIAL' ? trimmedInput : initialProblem;
            
            const responseStream = streamMessageToExpert(messages, trimmedInput, language, journeyState);
            let isFirstChunk = true;
            
            for await (const chunk of responseStream) {
                if (isFirstChunk) {
                    playAudio(receiveSound);
                    isFirstChunk = false;
                }

                if (typeof chunk === 'object' && chunk.journeyPlan) {
                    setMessages(prev => {
                        const updatedMessages = [...prev];
                        const lastMsg = updatedMessages[prev.length - 1];
                        if (lastMsg) {
                           lastMsg.content = `Here is the roadmap for your journey. Are you ready to begin?`;
                           lastMsg.journeyPlan = { ...chunk.journeyPlan, originalProblem: problemContext };
                           // Update history for confirmation check
                           currentHistory[currentHistory.length] = lastMsg; 
                        }
                        return updatedMessages;
                    });
                    setJourneyState('AWAITING_CONFIRMATION');
                } else if (typeof chunk === 'string') {
                    setMessages(prev => {
                        const lastMessage = prev[prev.length - 1];
                        if (lastMessage?.role === 'model') {
                            const updatedMessages = [...prev];
                            updatedMessages[prev.length - 1] = { ...lastMessage, content: lastMessage.content + chunk };
                            return updatedMessages;
                        }
                        return prev;
                    });
                }
            }
             
            if (journeyState === 'INITIAL') {
                setJourneyState('AWAITING_DURATION');
            } else if (journeyState === 'AWAITING_CONFIRMATION') {
                const positiveResponses = ['yes', 'yeah', 'ok', 'ready', 'yup', 'sure', 'start', 'begin', 'yes i am', 'i am ready'];
                if (positiveResponses.some(res => trimmedInput.toLowerCase().includes(res))) {
                    const lastMessageWithPlan = [...currentHistory].reverse().find(m => m.journeyPlan);
                    if (lastMessageWithPlan?.journeyPlan) {
                       setJourneyPlan(lastMessageWithPlan.journeyPlan);
                       setJourneyState('JOURNEY_ACTIVE');
                    }
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage = error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED'
                ? t('apiRateLimitError')
                : t('errorOccurred');

            setMessages(prev => {
                 const updatedMessages = [...prev];
                 const lastMessage = updatedMessages[updatedMessages.length - 1];
                 if(lastMessage) {
                    lastMessage.content = errorMessage;
                 }
                 return updatedMessages;
            })
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartSession = (day: JourneyDay) => {
        setActiveDay(day);
    };

    const handleCompleteSession = (completedDay: JourneyDay) => {
        setJourneyPlan(prevPlan => {
            if (!prevPlan) return null;
            const newDays = prevPlan.days.map(day => 
                day.day === completedDay.day ? { ...day, completed: true } : day
            );
            return { ...prevPlan, days: newDays };
        });
        setActiveDay(null);
    };

    if (journeyState === 'JOURNEY_ACTIVE' && journeyPlan) {
        if (activeDay) {
            return <JourneySession day={activeDay} plan={journeyPlan} onComplete={handleCompleteSession} />;
        }
        return <JourneyDashboard plan={journeyPlan} onStartSession={handleStartSession} />;
    }
    
    return (
        <div className="flex flex-col h-[75vh] p-4 sm:p-6 animate-fade-in">
             <div className="relative text-center mb-4">
                <h2 className="text-3xl font-bold text-[#8C5A2A] font-sanskrit">
                    {t('yourWellnessJourney')}
                </h2>
                 <p className="text-lg text-[#4A2C2A]/80">{t('guidedPathToPeace')}</p>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                {messages.map((msg, index) => (
                    <div key={index}>
                        <div className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-[#8C5A2A] flex items-center justify-center text-white font-sanskrit text-sm flex-shrink-0">M</div>
                            )}
                            <div className={`max-w-md lg:max-w-lg p-3 rounded-2xl transition-all ${msg.role === 'user' 
                                ? 'bg-[#EAE0C8] text-[#4A2C2A] rounded-br-none' 
                                : 'bg-[#FBF5E9] border border-[#D4AF37]/50 text-[#4A2C2A] rounded-bl-none'}`
                            }>
                               <p className="text-lg leading-relaxed whitespace-pre-wrap">{msg.content}{msg.role === 'model' && isLoading && index === messages.length - 1 && <span className="inline-block w-2 h-4 bg-[#4A2C2A] ml-1 animate-pulse"></span>}</p>
                            </div>
                        </div>
                        {msg.journeyPlan && journeyState === 'AWAITING_CONFIRMATION' && (
                             <div className="mt-4 p-4 border-2 border-dashed border-[#D4AF37]/60 bg-[#FBF5E9] rounded-lg animate-fade-in">
                                <h3 className="font-bold text-lg text-[#4A2C2A] text-center mb-2">{msg.journeyPlan.title}</h3>
                                <ul className="space-y-2">
                                    {msg.journeyPlan.days.map(d => (
                                        <li key={d.day} className="text-[#4A2C2A]"><span className="font-bold">{t('day')} {d.day}:</span> {d.topic}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-6 border-t-2 border-dashed border-[#D4AF37]/50 pt-4">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                    <textarea
                        ref={textareaRef}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }}}
                        placeholder={
                           journeyState === 'INITIAL' ? t('describeYourProblemChat') : 
                           journeyState === 'AWAITING_DURATION' ? t('howManyDays') : 
                           t('typeYourMessage')
                        }
                        className="flex-grow max-h-40 p-3 border-2 border-[#D4AF37]/50 rounded-lg focus:ring-2 focus:ring-[#8C5A2A] focus:outline-none transition-all duration-300 resize-none text-lg bg-[#FBF5E9] text-[#4A2C2A] placeholder-[#8C5A2A]/70"
                        rows={1}
                        disabled={isLoading}
                        aria-label={t('chatInput')}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !userInput.trim()}
                        className="self-stretch w-14 h-14 flex items-center justify-center bg-[#8C5A2A] text-[#FBF5E9] rounded-lg hover:bg-[#4A2C2A] disabled:bg-[#8C5A2A]/60 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FBF5E9] focus:ring-[#4A2C2A]"
                        aria-label={t('sendMessage')}
                    >
                        {isLoading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <SendIcon className="w-6 h-6" />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JourneyView;