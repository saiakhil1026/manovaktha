<<<<<<< HEAD
// This file is now obsolete and has been replaced by components/QuickChatView.tsx. This file can be removed.
=======
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { type ChatMessage } from '../types';
import { streamTempChat } from '../services/geminiService';
import SendIcon from './icons/SendIcon';
import { useLanguage } from '../contexts/LanguageContext';

const sendSound = 'data:audio/mpeg;base64,SUQzBAAAAAAAIptEAAAAANDUHJAEBTGl2ZTMuNi45qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//LAME3.98.4UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU...';
const receiveSound = 'data:audio/mpeg;base64,SUQzBAAAAAAAIptEAAAAANDUHJAEBTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-V-,';

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

const TempChatView: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
        setMessages([
            { role: 'model', content: "Hello! I'm Chintan. Tell me, what's on your mind? We can figure this out together." }
        ]);
    }, []);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput || isLoading) return;

        playAudio(sendSound);
        const newUserMessage: ChatMessage = { role: 'user', content: trimmedInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);
        
        // Add a placeholder for the model's response
        setMessages(prev => [...prev, { role: 'model', content: '' }]);

        try {
            const responseStream = streamTempChat(messages, trimmedInput, language);
            let isFirstChunk = true;
            
            for await (const chunk of responseStream) {
                if (isFirstChunk) {
                    playAudio(receiveSound);
                    isFirstChunk = false;
                }

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
            console.error("Temp chat error:", error);
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
    
    return (
        <div className="flex flex-col h-[75vh] p-4 sm:p-6 animate-fade-in">
             <div className="relative text-center mb-4">
                <h2 className="text-3xl font-bold text-[#8C5A2A] font-sanskrit">
                    {t('tempChart')}
                </h2>
                 <p className="text-lg text-[#4A2C2A]/80">{t('friendlyChatForGuidance')}</p>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                {messages.map((msg, index) => (
                    <div key={index}>
                        <div className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-[#4A2C2A] flex items-center justify-center text-white font-sanskrit text-sm flex-shrink-0 self-start mt-1">C</div>
                            )}
                            <div className={`max-w-md lg:max-w-lg p-3 rounded-2xl transition-all ${msg.role === 'user' 
                                ? 'bg-[#EAE0C8] text-[#4A2C2A] rounded-br-none' 
                                : 'bg-[#FBF5E9] border border-[#D4AF37]/50 text-[#4A2C2A] rounded-bl-none'}`
                            }>
                               <p className="text-lg leading-relaxed whitespace-pre-wrap">{msg.content}{msg.role === 'model' && isLoading && index === messages.length - 1 && <span className="inline-block w-2 h-4 bg-[#4A2C2A] ml-1 animate-pulse"></span>}</p>
                            </div>
                        </div>
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
                        placeholder={t('shareYourThoughts')}
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

export default TempChatView;
>>>>>>> 39ceae5246b9efa5d915fc623f5e55a25c810605
