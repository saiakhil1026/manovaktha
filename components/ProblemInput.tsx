import React, { useState } from 'react';
import LotusIcon from './icons/LotusIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface ProblemInputProps {
  onSubmit: (problem: string) => void;
  isLoading: boolean;
}

const ProblemInput: React.FC<ProblemInputProps> = ({ onSubmit, isLoading }) => {
  const [problem, setProblem] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(problem);
  };

  return (
    <div className="p-6 rounded-lg border-2 border-dashed border-[#D4AF37]/60 bg-[#FBF5E9]">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#8C5A2A] mb-2 font-sanskrit">
          {t('describeYourProblem')}
        </h2>
        <p className="text-[#4A2C2A]/80">
          {t('explainChallenge')}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder={t('problemPlaceholder')}
          className="w-full h-36 p-4 border-2 border-[#D4AF37]/50 rounded-lg focus:ring-2 focus:ring-[#8C5A2A] focus:outline-none transition-all duration-300 resize-none text-lg bg-[#FBF5E9] text-[#4A2C2A] placeholder-[#8C5A2A]/70"
          disabled={isLoading}
          aria-label={t('problemInputLabel')}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center bg-[#8C5A2A] text-[#FBF5E9] font-bold py-3 px-6 rounded-lg hover:bg-[#4A2C2A] disabled:bg-[#8C5A2A]/60 disabled:cursor-not-allowed transition-all duration-300 shadow-md shadow-[#8C5A2A]/30 border border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FBF5E9] focus:ring-[#4A2C2A] transform hover:scale-[1.01]"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('searching')}
            </>
          ) : (
            <>
              <LotusIcon className="h-6 w-6 mr-2" />
              {t('seekGuidance')}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ProblemInput;