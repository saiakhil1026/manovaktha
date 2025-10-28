
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { type ChatMessage } from '../types';
import { streamVedicAnalysis } from '../services/geminiService';
import SendIcon from './icons/SendIcon';
import { useLanguage } from '../contexts/LanguageContext';
import ManoVakthaIcon from './icons/ManoVakthaIcon';

// --- Data for Analysis Topics ---
const analysisTopics: Record<string, { titleKey: string; descriptionKey: string; symptoms: string[] }> = {
    stress: {
        titleKey: 'understandingStress',
        descriptionKey: 'stressDescription',
        symptoms: ['feelingOverwhelmed', 'difficultyConcentrating', 'muscleTension', 'sleepChanges', 'restlessness', 'digestiveIssues']
    },
    anxiety: {
        titleKey: 'understandingAnxiety',
        descriptionKey: 'anxietyDescription',
        symptoms: ['excessiveWorry', 'feelingAgitated', 'fatigue', 'irritability', 'tenseMuscles', 'troubleSleeping']
    },
    depression: {
        titleKey: 'understandingDepression',
        descriptionKey: 'depressionDescription',
        symptoms: ['persistentSadness', 'lossOfInterest', 'changesInAppetite', 'feelingWorthless', 'difficultyThinking', 'lowEnergy']
    },
    burnout: {
        titleKey: 'understandingBurnout',
        descriptionKey: 'burnoutDescription',
        symptoms: ['exhaustion', 'cynicism', 'reducedEfficacy', 'headaches', 'detachment', 'procrastination']
    }
};

const AnalysisView: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Analysis state
    const [step, setStep] = useState<'welcome' | 'symptoms' | 'done'>('welcome');
    const [currentTopic, setCurrentTopic] = useState<string | null>(null);
    const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
    const [dailyRoutine, setDailyRoutine] = useState('');

    const { language, t } = useLanguage();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const resetAnalysisState = () => {
        setMessages([{ role: 'model', content: t('manoVakthaWelcome') }]);
        setStep('welcome');
        setCurrentTopic(null);
        setSelectedSymptoms(new Set());
        setDailyRoutine('');
        setUserInput('');
    }

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
        }
    }, [userInput]);

    useEffect(() => {
        // Reset state when language changes to avoid mismatches
        resetAnalysisState();
    }, [t, language]);
    
    const handleTopicSelect = (topicKey: string, topicLabel: string) => {
        if (isLoading) return;
        
        setCurrentTopic(topicKey);
        const userMessage: ChatMessage = { role: 'user', content: topicLabel };
        const modelMessage: ChatMessage = { role: 'model', content: '' }; // Placeholder for symptom selector
        setMessages(prev => [...prev, userMessage, modelMessage]);
        setStep('symptoms');
    };

    const handleSymptomToggle = (symptom: string) => {
        setSelectedSymptoms(prev => {
            const newSet = new Set(prev);
            if (newSet.has(symptom)) {
                newSet.delete(symptom);
            } else {
                newSet.add(symptom);
            }
            return newSet;
        });
    };

    const handleGetGuidance = async () => {
        if (!currentTopic) return;
        setIsLoading(true);
        setStep('done');

        const symptomText = Array.from(selectedSymptoms).map(symptomKey => t(symptomKey)).join(', ');
        const routineText = dailyRoutine.trim() ? `My daily routine is: ${dailyRoutine}` : "User did not provide a daily routine.";

        const prompt = `I want to understand more about ${t(analysisTopics[currentTopic].titleKey)}.
I'm experiencing: ${symptomText || 'None of the listed symptoms'}.
${routineText}
Please provide some personalized guidance.`;
        
        const newUserMessage: ChatMessage = { role: 'user', content: prompt };
        
        // Fix for stale state: create new message history here
        const historyForAPI = [...messages.slice(0, -1), newUserMessage];
        setMessages([...historyForAPI, { role: 'model', content: '' }]);

        try {
            // Pass the up-to-date message history
            const responseStream = streamVedicAnalysis(historyForAPI, prompt, language);
            
            for await (const chunk of responseStream) {
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage?.role === 'model') {
                        const updatedMessages = [...prev];
                        // Fix: streamVedicAnalysis yields strings, so direct concatenation is correct.
                        // FIX: Explicitly cast chunk to string to resolve TypeScript error where chunk is inferred as 'unknown'.
                        updatedMessages[prev.length - 1] = { ...lastMessage, content: lastMessage.content + String(chunk) };
                        return updatedMessages;
                    }
                    return prev;
                });
            }
        } catch (error) {
             console.error("Analysis error:", error);
             const errorMessage = error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED'
                ? t('apiRateLimitError')
                : t('errorOccurred');

            setMessages(prev => {
                 const updatedMessages = [...prev];
                 const lastMsg = updatedMessages[prev.length - 1];
                 if (lastMsg) {
                    lastMsg.content = errorMessage;
                 }
                 return updatedMessages;
            })
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRegularSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput || isLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', content: trimmedInput };
        // Fix for stale state: create new message history here
        const historyForAPI = [...messages, newUserMessage];
        setMessages([...historyForAPI, { role: 'model', content: '' }]);
        setUserInput('');
        setIsLoading(true);
        
        try {
            // Pass the up-to-date message history
            const responseStream = streamVedicAnalysis(historyForAPI, trimmedInput, language);
            for await (const chunk of responseStream) {
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage?.role === 'model') {
                        const updatedMessages = [...prev];
                        // FIX: Explicitly cast chunk to string to resolve TypeScript error where chunk is inferred as 'unknown'.
                        updatedMessages[prev.length - 1] = { ...lastMessage, content: lastMessage.content + String(chunk) };
                        return updatedMessages;
                    }
                    return prev;
                });
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

    const renderSymptomSelector = () => {
        if (!currentTopic) return null;
        const topicData = analysisTopics[currentTopic];

        return (
             <div className="bg-white border border-[#D4AF37]/50 text-[#4A2C2A] rounded-2xl rounded-bl-none p-4 animate-fade-in">
                <h3 className="text-xl font-bold mb-1">{t(topicData.titleKey)}</h3>
                <p className="mb-4">{t(topicData.descriptionKey)}</p>

                <h4 className="font-bold mb-2">{t('commonSymptoms')}</h4>
                <div className="space-y-2 mb-4">
                    {topicData.symptoms.map(symptomKey => (
                        <div key={symptomKey} className="flex items-center justify-between p-3 bg-[#FBF5E9]/70 rounded-lg">
                            <span className="text-base">{t(symptomKey)}</span>
                            <button
                                onClick={() => handleSymptomToggle(symptomKey)}
                                aria-pressed={selectedSymptoms.has(symptomKey)}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                                    selectedSymptoms.has(symptomKey)
                                        ? 'bg-[#8C5A2A] text-white'
                                        : 'bg-[#EAE0C8] hover:bg-[#D4AF37]/50'
                                }`}
                            >
                                {selectedSymptoms.has(symptomKey) ? t('selected') : t('select')}
                            </button>
                        </div>
                    ))}
                </div>
                
                 <div className="text-center mb-6">
                    <button onClick={() => setSelectedSymptoms(new Set())} className="text-sm text-[#8C5A2A] hover:underline">
                        {t('noneApply')}
                    </button>
                </div>


                <h4 className="font-bold mb-2">{t('optionalRoutine')}</h4>
                <textarea
                    value={dailyRoutine}
                    onChange={(e) => setDailyRoutine(e.target.value)}
                    placeholder={t('routinePlaceholder')}
                    className="w-full h-24 p-2 border-2 border-[#D4AF37]/50 rounded-lg focus:ring-2 focus:ring-[#8C5A2A] focus:outline-none transition-all duration-300 resize-none text-base bg-[#FBF5E9] text-[#4A2C2A] placeholder-[#8C5A2A]/70"
                />
                
                <button
                    onClick={handleGetGuidance}
                    className="w-full mt-4 bg-[#8C5A2A] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#4A2C2A] transition-all duration-300"
                >
                    {t('getGuidance')}
                </button>
             </div>
        )
    };
    
    return (
        <div className="flex flex-col h-[75vh] p-4 sm:p-6 animate-fade-in">
            <div role="log" aria-live="polite" className="flex-grow overflow-y-auto pr-2 space-y-6">
                {messages.map((msg, index) => (
                    <div key={index}>
                        <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && (
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-[#D4AF37]/50 flex-shrink-0">
                                    <ManoVakthaIcon className="w-6 h-6 text-[#8C5A2A]" />
                                </div>
                            )}
                            <div className={`max-w-md lg:max-w-lg p-3 rounded-2xl transition-all text-lg leading-relaxed whitespace-pre-wrap ${msg.role === 'user' 
                                ? 'bg-[#EAE0C8] text-[#4A2C2A] rounded-br-none' 
                                : 'bg-transparent p-0'}` // Model bubbles have transparent background, content handles styling
                            }>
                               {msg.role === 'user' ? msg.content : ''}
                               {msg.role === 'model' && index === messages.length -1 && step === 'symptoms' 
                                ? renderSymptomSelector()
                                : msg.role === 'model' ? (
                                    <div className="bg-white border border-[#D4AF37]/50 text-[#4A2C2A] rounded-2xl rounded-bl-none p-3">
                                        {msg.content}
                                        {isLoading && index === messages.length - 1 && <span className="inline-block w-2 h-4 bg-[#4A2C2A] ml-1 animate-pulse"></span>}
                                    </div>
                                ) : null
                               }
                            </div>
                        </div>
                    </div>
                ))}
                 {step === 'welcome' && !isLoading && (
                    <div className="flex justify-center flex-wrap gap-2 pt-2">
                        <button onClick={() => handleTopicSelect('stress', t('whatIsStress'))} className="bg-white/70 border border-[#D4AF37]/50 text-[#4A2C2A] font-semibold py-2 px-4 rounded-full hover:bg-white transition-all">{t('whatIsStress')}</button>
                        <button onClick={() => handleTopicSelect('anxiety', t('whatIsAnxiety'))} className="bg-white/70 border border-[#D4AF37]/50 text-[#4A2C2A] font-semibold py-2 px-4 rounded-full hover:bg-white transition-all">{t('whatIsAnxiety')}</button>
                        <button onClick={() => handleTopicSelect('depression', t('whatIsDepression'))} className="bg-white/70 border border-[#D4AF37]/50 text-[#4A2C2A] font-semibold py-2 px-4 rounded-full hover:bg-white transition-all">{t('whatIsDepression')}</button>
                        <button onClick={() => handleTopicSelect('burnout', t('whatIsBurnout'))} className="bg-white/70 border border-[#D4AF37]/50 text-[#4A2C2A] font-semibold py-2 px-4 rounded-full hover:bg-white transition-all">{t('whatIsBurnout')}</button>
                    </div>
                )}
                {step === 'done' && !isLoading && (
                    <div className="text-center pt-4">
                        <button onClick={resetAnalysisState} className="bg-[#8C5A2A] text-white font-bold py-2 px-5 rounded-lg hover:bg-[#4A2C2A] transition-all duration-300">
                           {t('startNewAnalysis')}
                        </button>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-6 border-t-2 border-dashed border-[#D4AF37]/50 pt-4">
                <form onSubmit={handleRegularSendMessage} className="flex items-end gap-3">
                    <textarea
                        ref={textareaRef}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRegularSendMessage(e); }}}
                        placeholder={t('typeYourMessage')}
                        className="flex-grow max-h-40 p-3 border-2 border-[#D4AF37]/50 rounded-lg focus:ring-2 focus:ring-[#8C5A2A] focus:outline-none transition-all duration-300 resize-none text-lg bg-[#FBF5E9] text-[#4A2C2A] placeholder-[#8C5A2A]/70"
                        rows={1}
                        disabled={isLoading || step !== 'done'}
                        aria-label={t('chatInput')}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !userInput.trim() || step !== 'done'}
                        className="self-stretch w-14 h-14 flex items-center justify-center bg-[#8C5A2A] text-[#FBF5E9] rounded-lg hover:bg-[#4A2C2A] disabled:bg-[#8C5A2A]/60 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FBF5E9] focus:ring-[#4A2C2A]"
                        aria-label={t('sendMessage')}
                    >
                        {isLoading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <SendIcon className="w-6 h-6" />}
                    </button>
                </form>
                 <p className="text-xs text-center text-[#8C5A2A]/70 mt-2">{t('disclaimer')}</p>
            </div>
        </div>
    );
};

export default AnalysisView;
