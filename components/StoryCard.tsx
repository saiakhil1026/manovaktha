<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> 39ceae5246b9efa5d915fc623f5e55a25c810605
import { type DailyStory } from '../types';
import SpeakerOnIcon from './icons/SpeakerOnIcon';
import SpeakerOffIcon from './icons/SpeakerOffIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface StoryCardProps {
  story: DailyStory;
  index: number;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, index }) => {
  const [isOpen, setIsOpen] = useState(false);
<<<<<<< HEAD
  const [isSpeaking, setIsSpeakingState] = useState(false);
  const { t, language } = useLanguage();
  const contentId = `story-content-${index}`;
  const isSpeakingRef = useRef(false);

  const setIsSpeaking = (value: boolean) => {
    isSpeakingRef.current = value;
    setIsSpeakingState(value);
  };
=======
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { t } = useLanguage();
  const contentId = `story-content-${index}`;
>>>>>>> 39ceae5246b9efa5d915fc623f5e55a25c810605

  // Cleanup speech synthesis on component unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  // If the card is closed while speaking, stop the speech
  useEffect(() => {
    if (!isOpen && isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen, isSpeaking]);

  const handleToggleSpeech = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card from toggling when clicking the button

<<<<<<< HEAD
    if (isSpeakingRef.current) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
    }

=======
>>>>>>> 39ceae5246b9efa5d915fc623f5e55a25c810605
    if (!('speechSynthesis' in window)) {
      alert("Sorry, your browser doesn't support text-to-speech.");
      return;
    }

<<<<<<< HEAD
    speechSynthesis.cancel(); // Clear any previous speech

    const langCodeMap: Record<string, string> = {
        English: 'en-US',
        Hindi: 'hi-IN',
        Telugu: 'te-IN',
    };
    const targetLang = langCodeMap[language] || 'en-US';
    
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice;
    if (voices.length > 0) {
        selectedVoice = voices.find(v => v.lang === targetLang && /Google|Microsoft|Apple/.test(v.name));
        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang === targetLang);
        }
    }

    const textParts = [
        story.title,
        // Split content into sentences to avoid character limits
        ...(story.content.match(/[^.!?\n]+[.!?\n]*/g) || [story.content]),
        `Reference: ${story.reference}`
    ].map(p => p.trim()).filter(Boolean);


    const utteranceQueue = textParts.map(text => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = targetLang;
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        return utterance;
    });

    if (utteranceQueue.length === 0) return;

    let currentIndex = 0;

    const playNext = () => {
        if (!isSpeakingRef.current || currentIndex >= utteranceQueue.length) {
            setIsSpeaking(false);
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
            setIsSpeaking(false);
        };
        speechSynthesis.speak(utterance);
    };

    setIsSpeaking(true);
    playNext();
=======
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // Stop any other speech that might be active
      speechSynthesis.cancel();

      const textToSpeak = `${story.title}. ${story.content}. Reference: ${story.reference}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      // This could be made dynamic with the language context in a future update
      utterance.lang = 'en-US'; 

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        setIsSpeaking(false);
      };

      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
>>>>>>> 39ceae5246b9efa5d915fc623f5e55a25c810605
  };

  return (
    <div className="border border-[#D4AF37]/50 rounded-lg shadow-sm bg-[#FBF5E9]/90 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#D4AF37]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-left flex justify-between items-center hover:bg-[#D4AF37]/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#8C5A2A]"
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <h3 className="text-lg font-bold text-[#4A2C2A]">{index + 1}. {story.title}</h3>
<<<<<<< HEAD
        <div 
            aria-hidden="true"
            className="w-5 h-5 flex items-center justify-center text-[#8C5A2A] transition-transform duration-300 transform"
=======
        <div className="w-5 h-5 flex items-center justify-center text-[#8C5A2A] transition-transform duration-300 transform"
>>>>>>> 39ceae5246b9efa5d915fc623f5e55a25c810605
             style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
      <div
        id={contentId}
        className={`transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="p-4 pt-2 border-t border-dashed border-[#D4AF37]/50">
<<<<<<< HEAD
          <p className="text-[#4A2C2A]/90 text-lg leading-loose whitespace-pre-wrap mb-4">
=======
          <p className="text-[#4A2C2A]/90 text-lg leading-relaxed whitespace-pre-wrap mb-4" style={{lineHeight: '2.1rem'}}>
>>>>>>> 39ceae5246b9efa5d915fc623f5e55a25c810605
            {story.content}
          </p>
          <div className="flex justify-between items-center mt-3">
             <button
                onClick={handleToggleSpeech}
                className={`p-2 rounded-full text-[#8C5A2A] hover:bg-[#8C5A2A]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FBF5E9] focus:ring-[#4A2C2A] transition-colors ${isSpeaking ? 'bg-[#8C5A2A]/20' : ''}`}
                aria-label={isSpeaking ? t('stopReadingAloud') : t('readStoryAloud')}
                aria-pressed={isSpeaking}
             >
                {isSpeaking ? <SpeakerOnIcon className="w-6 h-6" /> : <SpeakerOffIcon className="w-6 h-6" />}
             </button>
            <p className="text-right text-base font-semibold text-[#8C5A2A] italic font-sanskrit">
              ~ {story.reference}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default StoryCard;
=======
export default StoryCard;
>>>>>>> 39ceae5246b9efa5d915fc623f5e55a25c810605
