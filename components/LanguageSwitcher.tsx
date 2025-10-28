import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { type Language } from '../types';
import GlobeIcon from './icons/GlobeIcon';

const languages: { code: Language; name: string; native: string, font: string }[] = [
  { code: 'English', name: 'English', native: 'English', font: 'font-sans' },
  { code: 'Hindi', name: 'Hindi', native: 'हिन्दी', font: 'font-hindi' },
  { code: 'Telugu', name: 'Telugu', native: 'తెలుగు', font: 'font-telugu' },
];

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleInteraction = (event: MouseEvent | KeyboardEvent) => {
      if (event.type === 'keydown' && (event as KeyboardEvent).key === 'Escape') {
        event.stopPropagation();
        setIsOpen(false);
        buttonRef.current?.focus();
        return;
      }

      if (event.type === 'mousedown') {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    
    return () => {
      document.removeEventListener('mousedown', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full text-[#4A2C2A] hover:bg-[#8C5A2A]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FBF5E9] focus:ring-[#4A2C2A]"
        aria-label="Change language"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <GlobeIcon className="w-6 h-6" />
      </button>
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-40 bg-[#FBF5E9] border-2 border-[#D4AF37]/50 rounded-lg shadow-lg z-50 animate-fade-in-fast"
          role="menu"
        >
          <ul className="p-1">
            {languages.map((lang) => (
              <li key={lang.code}>
                <button
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full text-left px-3 py-2 text-lg rounded-md transition-colors ${lang.font} ${
                    language === lang.code
                      ? 'bg-[#8C5A2A]/20 text-[#4A2C2A] font-bold'
                      : 'text-[#4A2C2A]/90 hover:bg-[#8C5A2A]/10'
                  }`}
                  role="menuitem"
                >
                  {lang.native}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <style>{`
        @keyframes fade-in-fast {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-fast {
          animation: fade-in-fast 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LanguageSwitcher;