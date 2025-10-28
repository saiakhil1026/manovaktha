import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { type Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, ...args: (string | number)[]) => string;
  isLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('English');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoaded(false);
        let langCode = 'en';
        if (language === 'Hindi') langCode = 'hi';
        if (language === 'Telugu') langCode = 'te';
        
        // Fetch the translation file from the public 'locales' directory.
        const response = await fetch(`./locales/${langCode}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load translations for ${language}`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error("Translation loading error:", error);
        // Fallback to empty object, t() will then return the keys.
        setTranslations({});
      } finally {
        setIsLoaded(true);
      }
    };

    loadTranslations();
  }, [language]);

  const t = useCallback((key: string, ...args: (string | number)[]): string => {
    let translation = translations[key] || key;
    
    if (args.length > 0) {
        args.forEach((arg, index) => {
            translation = translation.replace(new RegExp(`\\{${index}\\}`, 'g'), String(arg));
        });
    }
    return translation;
  }, [translations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
