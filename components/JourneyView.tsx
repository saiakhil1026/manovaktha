

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { type ChatMessage, type JourneyPlan, type JourneyDay } from '../types';
import { streamMessageToExpert } from '../services/geminiService';
import { journeyService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import SendIcon from './icons/SendIcon';
import { useLanguage } from '../contexts/LanguageContext';
import JourneyDashboard from './JourneyDashboard';
import JourneySession from './JourneySession';
import SpeakerOnIcon from './icons/SpeakerOnIcon';
import SpeakerOffIcon from './icons/SpeakerOffIcon';

// --- Sound Effects ---
const sendSound = 'data:audio/mpeg;base64,SUQzBAAAAAAAIptEAAAAANDUHJAEBTGl2ZTMuNi45qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//LAME3.98.4UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU...';
const receiveSound = 'data:audio/mpeg;base64,SUQzBAAAAAAAIptEAAAAANDUHJAEBTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-,';
type JourneyState = 'INITIAL' | 'AWAITING_DURATION' | 'AWAITING_CONFIRMATION' | 'JOURNEY_ACTIVE';

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

const JourneyView: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [journeyState, setJourneyState] = useState<JourneyState>('INITIAL');
    const [journeyPlan, setJourneyPlan] = useState<JourneyPlan | null>(null);
    const [pendingPlan, setPendingPlan] = useState<JourneyPlan | null>(null);
    const [activeDay, setActiveDay] = useState<JourneyDay | null>(null);
    const [initialProblem, setInitialProblem] = useState<string>('');
    const [isReadingChat, setIsReadingChatState] = useState(false);

    const { language, t } = useLanguage();
    const { isAuthenticated } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isReadingChatRef = useRef(false);

    const setIsReadingChat = (value: boolean) => {
        isReadingChatRef.current = value;
        setIsReadingChatState(value);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load journey plan from database or localStorage on initial render
    useEffect(() => {
        const loadJourneyPlan = async () => {
            if (isAuthenticated) {
                try {
                    console.log('🔄 Loading current journey from database...');
                    const response = await journeyService.getCurrentJourney();
                    if (response.journeyPlan) {
                        console.log('✅ Found active journey in database:', response.journeyPlan.title);
                        // Convert database format to local format
                        const localPlan: JourneyPlan = {
                            title: response.journeyPlan.title,
                            days: response.journeyPlan.days.map(day => ({
                                day: day.day,
                                topic: day.topic,
                                completed: day.completed
                            })),
                            originalProblem: response.journeyPlan.originalProblem
                        };
                        setJourneyPlan(localPlan);
                        setJourneyState('JOURNEY_ACTIVE');
                        return;
                    }
                } catch (error) {
                    console.error('❌ Failed to load journey from database:', error);
                }
            }
            
            // Fallback to localStorage
            try {
                const savedPlan = localStorage.getItem('journeyPlan');
                if (savedPlan) {
                    const parsedPlan: JourneyPlan = JSON.parse(savedPlan);
                    console.log('💾 Found journey in localStorage:', parsedPlan.title);
                    setJourneyPlan(parsedPlan);
                    setJourneyState('JOURNEY_ACTIVE');
                    
                    // Migrate to database if authenticated
                    if (isAuthenticated) {
                        try {
                            await journeyService.createJourneyPlan(
                                parsedPlan.title,
                                parsedPlan.originalProblem,
                                parsedPlan.days,
                                language
                            );
                            console.log('✅ Migrated journey plan to database');
                            localStorage.removeItem('journeyPlan');
                        } catch (migrationError) {
                            console.error('❌ Failed to migrate journey plan:', migrationError);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load or parse journey plan from localStorage:", error);
                localStorage.removeItem('journeyPlan');
            }
        };
        
        loadJourneyPlan();
    }, [isAuthenticated, language]);

    // Save journey plan to database and localStorage whenever it changes
    useEffect(() => {
        const saveJourneyPlan = async () => {
            if (journeyPlan) {
                // Always save to localStorage as backup
                localStorage.setItem('journeyPlan', JSON.stringify(journeyPlan));
                
                // Save to database if authenticated
                if (isAuthenticated) {
                    try {
                        // Check if this is a new plan that needs to be created
                        const existingResponse = await journeyService.getCurrentJourney();
                        if (!existingResponse.journeyPlan) {
                            await journeyService.createJourneyPlan(
                                journeyPlan.title,
                                journeyPlan.originalProblem,
                                journeyPlan.days,
                                language
                            );
                            console.log('✅ Journey plan saved to database');
                        }
                    } catch (error) {
                        console.error('❌ Failed to save journey plan to database:', error);
                    }
                }
            }
        };
        
        if (journeyPlan) {
            saveJourneyPlan();
        }
    }, [journeyPlan, isAuthenticated, language]);

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
        }
    }, [userInput]);

    useEffect(() => {
        return () => {
            speechSynthesis.cancel();
        };
    }, []);

    // Effect to initialize chat if no journey is active
    useEffect(() => {
        if (journeyState !== 'JOURNEY_ACTIVE' && messages.length === 0) {
            setMessages([
                { role: 'model', content: t('journeyWelcome') }
            ]);
        }
    }, [journeyState, messages.length, t]);


    const handleToggleReadChat = () => {
        if (isReadingChatRef.current) {
            speechSynthesis.cancel();
            setIsReadingChat(false);
            return;
        }

        if (!('speechSynthesis' in window) || messages.length === 0) {
            return;
        }

        speechSynthesis.cancel(); // Clear any previous speech

        const langCodeMap: Record<string, string> = {
            English: 'en-US',
            Hindi: 'hi-IN',
            Telugu: 'te-IN',
        };
        const langCode = langCodeMap[language] || 'en-US';
        const voices = window.speechSynthesis.getVoices();
        
        const modelVoice = voices.find(v => v.lang === langCode && /Google|Microsoft|Apple/.test(v.name)) || voices.find(v => v.lang === langCode);
        const userVoice = voices.find(v => v.lang === langCode && v.voiceURI !== modelVoice?.voiceURI) || voices.find(v => v.lang.startsWith(langCode.split('-')[0]) && v.voiceURI !== modelVoice?.voiceURI);

        const utteranceQueue = messages.flatMap((msg, msgIndex) => {
            const textParts = (msg.content.match(/[^.!?\n]+[.!?\n]*/g) || [msg.content])
                .map(p => p.trim())
                .filter(Boolean);

            return textParts.map((part, partIndex) => {
                let textToSpeak = part;
                // Add a prefix only to the first sentence of the first message by a speaker
                if (partIndex === 0) {
                    textToSpeak = msg.role === 'model' 
                        ? `Mano Vaktha says: ${part}` 
                        : `You said: ${part}`;
                }

                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = langCode;
                if (msg.role === 'model' && modelVoice) utterance.voice = modelVoice;
                if (msg.role === 'user' && userVoice) utterance.voice = userVoice;
                return utterance;
            });
        });

        if (utteranceQueue.length === 0) return;

        let currentIndex = 0;

        const playNext = () => {
            if (!isReadingChatRef.current || currentIndex >= utteranceQueue.length) {
                setIsReadingChat(false);
                return;
            }

            const utterance = utteranceQueue[currentIndex];
            utterance.onend = () => {
                currentIndex++;
                playNext();
            };
            utterance.onerror = (event) => {
                if (event.error !== 'interrupted' && event.error !== 'canceled') {
                    console.error("Speech synthesis error:", event.error);
                }
                setIsReadingChat(false);
            };

            speechSynthesis.speak(utterance);
        };

        setIsReadingChat(true);
        playNext();
    };

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput || isLoading || journeyState === 'JOURNEY_ACTIVE') return;
    
        if (isReadingChat) {
            speechSynthesis.cancel();
            setIsReadingChat(false);
        }
    
        playAudio(sendSound);
        
        const newUserMessage: ChatMessage = { role: 'user', content: trimmedInput };
        const currentJourneyState = journeyState;
        const problemContext = currentJourneyState === 'INITIAL' ? trimmedInput : initialProblem;

        // Create the full history for the API call *before* updating state
        const historyForApi = [...messages, newUserMessage];

        // Update UI optimistically
        setMessages(prev => [...prev, newUserMessage, { role: 'model', content: '' }]);
        setUserInput('');
        setIsLoading(true);
    
        let isPlanReceived = false;
    
        try {
            if (currentJourneyState === 'INITIAL') {
                setInitialProblem(trimmedInput);
            }
            
            const responseStream = streamMessageToExpert(historyForApi, language, currentJourneyState);
            let isFirstChunk = true;
            
            for await (const chunk of responseStream) {
                if (isFirstChunk) {
                    playAudio(receiveSound);
                    isFirstChunk = false;
                }
    
                if (typeof chunk === 'object' && chunk.journeyPlan) {
                    isPlanReceived = true;
                    const newPlan: JourneyPlan = { ...chunk.journeyPlan, originalProblem: problemContext };
                    setPendingPlan(newPlan); // Store the received plan in a temporary state
                    setMessages(prev => {
                        const updatedMessages = [...prev];
                        const lastMsg = updatedMessages[updatedMessages.length - 1];
                        if (lastMsg?.role === 'model') {
                           lastMsg.content = t('hereIsYourRoadmap');
                           lastMsg.journeyPlan = newPlan;
                        }
                        return updatedMessages;
                    });
                } else if (typeof chunk === 'string') {
                    setMessages(prev => {
                        const updatedMessages = [...prev];
                        const lastMessage = updatedMessages[updatedMessages.length - 1];
                        if (lastMessage?.role === 'model') {
                            lastMessage.content = lastMessage.content + chunk;
                        }
                        return updatedMessages;
                    });
                }
            }
             
            // State transitions should happen *after* the async stream is complete
            if (currentJourneyState === 'INITIAL') {
                setJourneyState('AWAITING_DURATION');
            } else if (isPlanReceived) {
                setJourneyState('AWAITING_CONFIRMATION');
            } else if (currentJourneyState === 'AWAITING_CONFIRMATION') {
                const positiveResponses = ['yes', 'yeah', 'ok', 'ready', 'yup', 'sure', 'start', 'begin', 'yes i am', 'i am ready'];
                if (positiveResponses.some(res => trimmedInput.toLowerCase().includes(res))) {
                    if (pendingPlan) {
                        // Save to database first if authenticated
                        if (isAuthenticated) {
                            try {
                                await journeyService.createJourneyPlan(
                                    pendingPlan.title,
                                    pendingPlan.originalProblem,
                                    pendingPlan.days,
                                    language
                                );
                                console.log('✅ Journey plan created in database');
                            } catch (error) {
                                console.error('❌ Failed to create journey in database:', error);
                            }
                        }
                        
                        setJourneyPlan(pendingPlan);
                        setPendingPlan(null);
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
                if(lastMessage && lastMessage.role === 'model') {
                   lastMessage.content = errorMessage;
                }
                return updatedMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartSession = (day: JourneyDay) => {
        setActiveDay(day);
    };

    const handleCompleteSession = async (completedDay: JourneyDay) => {
        // Update local state
        setJourneyPlan(prevPlan => {
            if (!prevPlan) return null;
            const newDays = prevPlan.days.map(day => 
                day.day === completedDay.day ? { ...day, completed: true } : day
            );
            return { ...prevPlan, days: newDays };
        });
        
        // Update in database if authenticated
        if (isAuthenticated) {
            try {
                const currentJourney = await journeyService.getCurrentJourney();
                if (currentJourney.journeyPlan) {
                    await journeyService.markDayComplete(
                        currentJourney.journeyPlan._id, 
                        completedDay.day,
                        'Completed session'
                    );
                    console.log(`✅ Day ${completedDay.day} marked as complete in database`);
                }
            } catch (error) {
                console.error('❌ Failed to mark day complete in database:', error);
            }
        }
        
        setActiveDay(null);
    };

    const handleResetJourney = async () => {
        if (window.confirm(t('confirmResetJourney'))) {
            // Clear from database if authenticated
            if (isAuthenticated) {
                try {
                    const currentJourney = await journeyService.getCurrentJourney();
                    if (currentJourney.journeyPlan) {
                        await journeyService.updateJourneyStatus(currentJourney.journeyPlan._id, 'abandoned');
                        console.log('✅ Journey marked as abandoned in database');
                    }
                } catch (error) {
                    console.error('❌ Failed to reset journey in database:', error);
                }
            }
            
            // Clear localStorage
            localStorage.removeItem('journeyPlan');
            setJourneyPlan(null);
            setActiveDay(null);
            setMessages([]);
            setJourneyState('INITIAL');
            
            // Trigger re-initialization of chat
            setTimeout(() => {
                setMessages([
                    { role: 'model', content: t('journeyWelcome') }
                ]);
            }, 0);
        }
    };

    if (journeyState === 'JOURNEY_ACTIVE' && journeyPlan) {
        if (activeDay) {
            return <JourneySession day={activeDay} plan={journeyPlan} onComplete={handleCompleteSession} />;
        }
        return (
            <div>
                <JourneyDashboard plan={journeyPlan} onStartSession={handleStartSession} />
                <div className="text-center mt-8 p-4">
                    <button
                        onClick={handleResetJourney}
                        className="text-sm font-semibold text-red-700 bg-red-100/70 py-2 px-4 rounded-lg hover:bg-red-200/70 border border-red-500/50 transition-colors"
                    >
                        {t('resetJourney')}
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-[75vh] p-4 sm:p-6 animate-fade-in">
             <div className="relative text-center mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#8C5A2A] font-sanskrit">
                    {t('yourWellnessJourney')}
                </h2>
                 <p className="text-lg text-[#4A2C2A]/80">{t('guidedPathToPeace')}</p>
                 <div className="absolute top-0 right-0 h-full flex items-center">
                    <button
                        onClick={handleToggleReadChat}
                        className="p-2 rounded-full text-[#8C5A2A] hover:bg-[#8C5A2A]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FBF5E9] focus:ring-[#4A2C2A] transition-colors"
                        aria-label={isReadingChat ? t('stopReadingChatAloud') : t('readChatAloud')}
                        aria-pressed={isReadingChat}
                    >
                        {isReadingChat ? <SpeakerOnIcon className="w-7 h-7" /> : <SpeakerOffIcon className="w-7 h-7" />}
                    </button>
                 </div>
            </div>
            <div role="log" aria-live="polite" className="flex-grow overflow-y-auto pr-2 space-y-6">
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