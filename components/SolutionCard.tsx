import React, { useState, useEffect } from 'react';
import { type Solution } from '../types';
import SpeakerOnIcon from './icons/SpeakerOnIcon';
import SpeakerOffIcon from './icons/SpeakerOffIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface SolutionCardProps {
  solution: Solution;
  index: number;
}

const SolutionCard: React.FC<SolutionCardProps> = ({ solution, index }) => {
  const [isOpen, setIsOpen] = useState(index === 0); // Open the first card by default
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { t } = useLanguage();
  const contentId = `solution-content-${index}`;

  // Cleanup speech synthesis on component unmount or when the card is closed
  useEffect(() => {
    return () => {
      // This is a global cancel, which is fine as only one card should speak at a time.
      speechSynthesis.cancel();
    };
  }, []);

  // If the card is closed while speaking, stop the speech.
  useEffect(() => {
    if (!isOpen && isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen, isSpeaking]);

  const handleToggleSpeech = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card from collapsing when clicking the button

    if (!('speechSynthesis' in window)) {
      alert("Sorry, your browser doesn't support text-to-speech.");
      return;
    }

    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // Stop any other speech that might be active
      speechSynthesis.cancel();

      const textToSpeak = `${solution.title}. ${solution.story}. Reference: ${solution.reference}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'en-US';

      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        setIsSpeaking(false);
      };

      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="border-2 border-[#D4AF37]/50 rounded-lg shadow-sm bg-[#FBF5E9]/90 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[#D4AF37]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 text-left flex justify-between items-center hover:bg-[#D4AF37]/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#8C5A2A]"
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <h3 className="text-xl font-bold text-[#4A2C2A]">{solution.title}</h3>
        <div className="w-6 h-6 flex items-center justify-center text-[#8C5A2A] border-2 border-[#8C5A2A] rounded-full transition-transform duration-300 transform"
             style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
             <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d={isOpen ? "M5 12h14" : "M12 5v14m-7-7h14"}
            />
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
        <div className="p-5 pt-3 border-t-2 border-dashed border-[#D4AF37]/50">
          <p className="text-[#4A2C2A]/90 text-lg leading-relaxed whitespace-pre-wrap mb-4" style={{lineHeight: '2.2rem'}}>
            {solution.story}
          </p>
          <div className="flex justify-between items-center mt-4">
             <button
                onClick={handleToggleSpeech}
                className={`p-2 rounded-full text-[#8C5A2A] hover:bg-[#8C5A2A]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FBF5E9] focus:ring-[#4A2C2A] transition-colors ${isSpeaking ? 'bg-[#8C5A2A]/20' : ''}`}
                aria-label={isSpeaking ? t('stopReadingAloud') : t('readSolutionAloud')}
                aria-pressed={isSpeaking}
             >
                {isSpeaking ? <SpeakerOnIcon className="w-6 h-6" /> : <SpeakerOffIcon className="w-6 h-6" />}
             </button>
            <p className="text-right text-base font-semibold text-[#8C5A2A] italic font-sanskrit">
              ~ {solution.reference}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionCard;
