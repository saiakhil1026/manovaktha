
import React, { useState, useEffect, useRef } from 'react';
import { type Solution } from '../types';
import SpeakerOnIcon from './icons/SpeakerOnIcon';
import SpeakerOffIcon from './icons/SpeakerOffIcon';
import BookmarkIcon from './icons/BookmarkIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { savedSolutionsService } from '../services';

interface SolutionCardProps {
  solution: Solution;
  index: number;
  onUnsave?: (solution: Solution) => void;
}

const SolutionCard: React.FC<SolutionCardProps> = ({ solution, index, onUnsave }) => {
  const [isOpen, setIsOpen] = useState(index === 0); // Open the first card by default
  const [isSpeaking, setIsSpeakingState] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const contentId = `solution-content-${index}`;
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    // Check if the solution is already saved
    checkIfSaved();
  }, [solution, isAuthenticated]);

  const checkIfSaved = async () => {
    if (isAuthenticated) {
      try {
        const isSolutionSaved = await savedSolutionsService.isSolutionSaved(solution);
        setIsSaved(isSolutionSaved);
      } catch (error) {
        console.error('Failed to check if solution is saved:', error);
        // Fallback to localStorage
        checkLocalStorage();
      }
    } else {
      checkLocalStorage();
    }
  };

  const checkLocalStorage = () => {
    const savedSolutions: Solution[] = JSON.parse(localStorage.getItem('savedSolutions') || '[]');
    const alreadySaved = savedSolutions.some(s => s.title === solution.title && s.reference === solution.reference);
    setIsSaved(alreadySaved);
  };

  const setIsSpeaking = (value: boolean) => {
    isSpeakingRef.current = value;
    setIsSpeakingState(value);
  };

  // Cleanup speech synthesis on component unmount
  useEffect(() => {
    return () => {
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

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onUnsave && isSaved) {
        onUnsave(solution);
        return;
    }

    if (isAuthenticated) {
      try {
        if (isSaved) {
          // Remove from database - this would require getting the saved solution ID
          // For now, we'll handle unsaving in the parent component
          setIsSaved(false);
        } else {
          // Add to database
          await savedSolutionsService.saveSolution(
            solution,
            'Saved from manuscript', // Default problem text
            '',
            []
          );
          setIsSaved(true);
          setShowSavedMessage(true);
          setTimeout(() => setShowSavedMessage(false), 2000);
        }
      } catch (error) {
        console.error('Failed to save solution:', error);
        // Fallback to localStorage
        handleLocalStorageSave();
      }
    } else {
      handleLocalStorageSave();
    }
  };

  const handleLocalStorageSave = () => {
    const savedSolutions: Solution[] = JSON.parse(localStorage.getItem('savedSolutions') || '[]');
    if (isSaved) {
      // Remove the solution
      const updatedSolutions = savedSolutions.filter(s => s.title !== solution.title || s.reference !== solution.reference);
      localStorage.setItem('savedSolutions', JSON.stringify(updatedSolutions));
      setIsSaved(false);
    } else {
      // Add the solution
      savedSolutions.unshift(solution); // Add to the beginning
      localStorage.setItem('savedSolutions', JSON.stringify(savedSolutions));
      setIsSaved(true);
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 2000);
    }
  };


  const handleToggleSpeech = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card from collapsing when clicking the button

    if (isSpeakingRef.current) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert("Sorry, your browser doesn't support text-to-speech.");
      return;
    }

    speechSynthesis.cancel(); // Clear any previous speech

    const langCodeMap: Record<string, string> = {
        English: 'en-US',
        Hindi: 'hi-IN',
        Telugu: 'te-IN',
    };
    const targetLang = langCodeMap[language] || 'en-US';

    // Attempt to find a higher quality voice if available
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice;
    if (voices.length > 0) {
      selectedVoice = voices.find(v => v.lang === targetLang && /Google|Microsoft|Apple/.test(v.name));
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang === targetLang);
      }
    }

    const textParts = [
        solution.title,
        // Split story into sentences to avoid character limits
        ...(solution.story.match(/[^.!?\n]+[.!?\n]*/g) || [solution.story]),
        `Reference: ${solution.reference}`
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
        <div 
             aria-hidden="true"
             className="w-6 h-6 flex items-center justify-center text-[#8C5A2A] border-2 border-[#8C5A2A] rounded-full transition-transform duration-300 transform"
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
          <p className="text-[#4A2C2A]/90 text-lg leading-loose whitespace-pre-wrap mb-4">
            {solution.story}
          </p>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
                 <button
                    onClick={handleToggleSpeech}
                    className={`p-2 rounded-full text-[#8C5A2A] hover:bg-[#8C5A2A]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FBF5E9] focus:ring-[#4A2C2A] transition-colors ${isSpeaking ? 'bg-[#8C5A2A]/20' : ''}`}
                    aria-label={isSpeaking ? t('stopReadingAloud') : t('readSolutionAloud')}
                    aria-pressed={isSpeaking}
                 >
                    {isSpeaking ? <SpeakerOnIcon className="w-6 h-6" /> : <SpeakerOffIcon className="w-6 h-6" />}
                 </button>
                  <button
                    onClick={handleToggleSave}
                    className={`p-2 rounded-full text-[#8C5A2A] hover:bg-[#8C5A2A]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FBF5E9] focus:ring-[#4A2C2A] transition-colors`}
                    aria-label={isSaved ? t('removeSavedSolution') : t('saveSolution')}
                    aria-pressed={isSaved}
                >
                    <BookmarkIcon className="w-6 h-6" filled={isSaved} />
                </button>
                <div className={`transition-opacity duration-300 ${showSavedMessage ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="text-sm font-semibold text-green-700">{t('solutionSaved')}</span>
                </div>
            </div>
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
