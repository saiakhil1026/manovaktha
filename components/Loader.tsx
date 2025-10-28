import React, { useState, useEffect, useMemo } from 'react';
import ManoVakthaIcon from './icons/ManoVakthaIcon';
import { useLanguage } from '../contexts/LanguageContext';

const Loader: React.FC = () => {
  const { t } = useLanguage();
  const [messageIndex, setMessageIndex] = useState(0);

  const loadingMessages = useMemo(() => [
    t('turningPages'),
    t('searchingGita'),
    t('consultingSages'),
    t('exploringDivinePath')
  ], [t]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(intervalId);
  }, [loadingMessages.length]);

  return (
    <div role="status" className="flex flex-col items-center justify-center space-y-6 p-8">
       <div className="relative">
        <ManoVakthaIcon className="w-28 h-28 text-[#8C5A2A]" />
        <div className="absolute inset-0 rounded-full bg-[#D4AF37] opacity-20 animate-ping"></div>
      </div>
      <p className="text-xl text-[#4A2C2A] text-center font-semibold">
        {loadingMessages[messageIndex]}
      </p>
      <span className="sr-only">{t('loading')}</span>
    </div>
  );
};

export default Loader;
