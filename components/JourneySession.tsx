import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { type JourneyDay, type JourneyPlan, type ChatMessage, type JourneyDayContent } from '../types';
import { getJourneyDayContent, streamSessionChat } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import Loader from './Loader';
import CheckCircleIcon from './icons/CheckCircleIcon';
import SendIcon from './icons/SendIcon';
import StoryCard from './StoryCard';

interface JourneySessionProps {
    day: JourneyDay;
    plan: JourneyPlan;
    onComplete: (day: JourneyDay) => void;
}

const JourneySession: React.FC<JourneySessionProps> = ({ day, plan, onComplete }) => {
    const [sessionContent, setSessionContent] = useState<JourneyDayContent | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoadingContent, setIsLoadingContent] = useState(true);
    const [isAnswering, setIsAnswering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userInput, setUserInput] = useState('');
    
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
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
        }
    }, [userInput]);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setIsLoadingContent(true);
                setError(null);
                setSessionContent(null);
                setMessages([]);
                const content = await getJourneyDayContent(day.topic, plan.originalProblem, language);
                setSessionContent(content);
            } catch (err) {
                if (err instanceof Error && err.message === 'RATE_LIMIT_EXCEEDED') {
                    setError(t('apiRateLimitError'));
                } else {
                    setError(t('couldNotPrepareSession'));
                }
            } finally {
                setIsLoadingContent(false);
            }
        };
        fetchContent();
    }, [day, plan, language, t]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput || isAnswering || !sessionContent) return;

        const newUserMessage: ChatMessage = { role: 'user', content: trimmedInput };
        
        // This provides context to the AI about the session content without cluttering the user's view.
        const initialContentForHistory: ChatMessage = {
            role: 'model',
            content: `CONTEXT: The user has just read the following content for today's session on "${day.topic}".
            Introduction: ${sessionContent.introduction}
            Stories Provided: ${sessionContent.stories.map(s => s.title).join(', ')}.
            Do not repeat this information. Simply answer the user's question based on this context.`
        };
        
        const historyForAPICall = [initialContentForHistory, ...messages];

        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsAnswering(true);
        
        setMessages(prev => [...prev, { role: 'model', content: '' }]);

        try {
            const responseStream = streamSessionChat(historyForAPICall, trimmedInput, language, day.topic, plan.originalProblem);
            
            for await (const chunk of responseStream) {
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
        } catch (error) {
             console.error("Session chat error:", error);
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
            setIsAnswering(false);
        }
    };


    const renderSessionContent = () => {
        if (isLoadingContent) {
            return <div className="my-8"><Loader /></div>;
        }
        if (error) {
            return (
                <div className="text-center text-red-800 bg-red-100/50 border-2 border-red-500/50 rounded-lg p-4 my-8 animate-fade-in">
                    <p className="font-bold text-lg">{error}</p>
                </div>
            );
        }
        if (!sessionContent) {
            return null;
        }
        return (
            <div className="mt-6">
                <div className="mb-8 p-6 rounded-lg border-2 border-dashed border-[#D4AF37]/60 bg-[#FBF5E9]">
                    <p className="text-[#4A2C2A]/90 text-xl leading-loose">
                        {sessionContent.introduction}
                    </p>
                </div>
                <div className="space-y-4">
                    {sessionContent.stories.map((story, index) => (
                        <StoryCard key={index} story={story} index={index} />
                    ))}
                </div>
            </div>
        );
    };

    const renderChat = () => {
        if (isLoadingContent || error || !sessionContent) {
            return null;
        }
        return (
            <div className="mt-12">
                 <div className="relative text-center mb-6">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t-2 border-dashed border-[#D4AF37]/50"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-[#FBF5E9]/80 backdrop-blur-sm px-4 text-2xl font-bold text-[#8C5A2A] font-sanskrit">{t('clearYourDoubts')}</span>
                    </div>
                </div>

                 <div className="flex flex-col h-[50vh] bg-white/50 rounded-lg p-4 border border-[#D4AF37]/30">
                     <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                        {messages.length === 0 && (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-[#4A2C2A]/70 text-lg">{t('askAQuestion')}</p>
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && (
                                    <div className="w-8 h-8 rounded-full bg-[#8C5A2A] flex items-center justify-center text-white font-sanskrit text-sm flex-shrink-0 self-start mt-1">M</div>
                                )}
                                <div className={`max-w-md lg:max-w-xl p-3 rounded-2xl ${msg.role === 'user' 
                                    ? 'bg-[#EAE0C8] text-[#4A2C2A] rounded-br-none' 
                                    : 'bg-white border border-[#D4AF37]/50 text-[#4A2C2A] rounded-bl-none'}`
                                }>
                                   <p className="text-lg leading-relaxed whitespace-pre-wrap">
                                    {msg.content}
                                    {msg.role === 'model' && isAnswering && index === messages.length - 1 && <span className="inline-block w-2 h-4 bg-[#4A2C2A] ml-1 animate-pulse"></span>}
                                   </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="mt-4 border-t-2 border-dashed border-[#D4AF37]/50 pt-4">
                        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                            <textarea
                                ref={textareaRef}
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }}}
                                placeholder={t('askForClarification')}
                                className="flex-grow max-h-40 p-3 border-2 border-[#D4AF37]/50 rounded-lg focus:ring-2 focus:ring-[#8C5A2A] focus:outline-none transition-all duration-300 resize-none text-lg bg-white text-[#4A2C2A] placeholder-[#8C5A2A]/70"
                                rows={1}
                                disabled={isAnswering}
                                aria-label="Chat input for session"
                            />
                            <button
                                type="submit"
                                disabled={isAnswering || !userInput.trim()}
                                className="self-stretch w-14 h-14 flex items-center justify-center bg-[#8C5A2A] text-[#FBF5E9] rounded-lg hover:bg-[#4A2C2A] disabled:bg-[#8C5A2A]/60 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FBF5E9] focus:ring-[#4A2C2A]"
                                aria-label={t('sendMessage')}
                            >
                                {isAnswering ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <SendIcon className="w-6 h-6" />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-8 animate-fade-in">
            <div className="text-center mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#4A2C2A] font-sanskrit">
                    {t('day')} {day.day}: {day.topic}
                </h2>
                <p className="text-lg text-[#4A2C2A]/80 max-w-2xl mx-auto">
                    {plan.title}
                </p>
            </div>
            {renderSessionContent()}
            {renderChat()}
             <div className="mt-12 text-center">
                 <button 
                    onClick={() => onComplete(day)}
                    disabled={isLoadingContent || !!error}
                    className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-green-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FBF5E9] focus:ring-green-500 flex items-center justify-center mx-auto"
                >
                    <CheckCircleIcon className="w-6 h-6 mr-2" />
                    {t('markDayAsComplete')}
                </button>
            </div>
        </div>
    );
};

export default JourneySession;