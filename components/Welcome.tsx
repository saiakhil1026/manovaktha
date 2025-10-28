import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Welcome: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="text-center p-8 animate-fade-in">
      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#8C5A2A] mb-6 font-sanskrit">
        {t('welcomeSeeker')}
      </h2>
      <p className="text-xl text-[#4A2C2A]/90 leading-loose max-w-3xl mx-auto">
        {t('welcomeMessage')}
      </p>
    </div>
  );
};

export default Welcome;