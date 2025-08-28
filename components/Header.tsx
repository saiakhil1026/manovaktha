import React from 'react';
import ManoVakthaIcon from './icons/ManoVakthaIcon';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  onNavigate: (view: 'manuscript' | 'journey' | 'tempChat', shouldReset?: boolean) => void;
  currentView: 'manuscript' | 'journey' | 'tempChat';
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentView }) => {
  const { t } = useLanguage();
  
  const navItems = [
      { view: 'manuscript' as const, label: t('manuscript') },
      { view: 'journey' as const, label: t('wellnessJourney') },
      { view: 'tempChat' as const, label: t('tempChart') }
  ];

  return (
    <header className="py-3 px-4 sm:px-6 lg:px-8 border-b-2 border-amber-500/20 bg-[#FBF5E9]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onNavigate('manuscript', true)} 
            className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-[#8C5A2A] focus:ring-offset-2 focus:ring-offset-[#FBF5E9] rounded-lg p-1 -ml-1"
            aria-label={t('returnToHomepage')}
          >
            <ManoVakthaIcon className="h-12 w-12 text-[#8C5A2A] group-hover:text-[#4A2C2A] transition-colors duration-300" />
            <h1 className="text-3xl md:text-4xl font-bold font-sanskrit tracking-wider text-[#4A2C2A] group-hover:text-[#8C5A2A] transition-all duration-300">
              Mano Vaktha
            </h1>
          </button>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher />
          <nav className="flex items-center gap-1 sm:gap-2 rounded-lg bg-[#8C5A2A]/5 p-1 border border-[#D4AF37]/30">
            {navItems.map(({ view, label }) => (
              <button
                key={view}
                onClick={() => onNavigate(view, view === 'manuscript')} // Reset when navigating to manuscript
                className={`font-bold py-2 px-3 sm:px-4 rounded-md text-sm sm:text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FBF5E9] focus:ring-[#4A2C2A] whitespace-nowrap ${
                  currentView === view
                    ? 'bg-white text-[#4A2C2A] shadow-sm'
                    : 'bg-transparent text-[#4A2C2A]/70 hover:bg-white/50 hover:text-[#4A2C2A]'
                }`}
                aria-current={currentView === view ? 'page' : undefined}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
