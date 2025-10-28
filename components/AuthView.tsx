import React, { useState, useEffect } from 'react';
import ManoVakthaIcon from './icons/ManoVakthaIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface AuthViewProps {
  onAuthSuccess: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedResponsibility, setAgreedResponsibility] = useState(false);
  const [agreedNotDepending, setAgreedNotDepending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const { login, register, isLoading } = useAuth();

  // Remove automatic API test since it shows unnecessary errors

  const handleModeChange = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    // Reset checkbox states when switching modes
    setAgreedResponsibility(false);
    setAgreedNotDepending(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, language as 'English' | 'Hindi' | 'Telugu');
      }
      onAuthSuccess();
    } catch (error: any) {
      console.error('Authentication failed:', error);
      setError(error.response?.data?.error || error.message || 'Authentication failed');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF5E9] p-4 animate-fade-in">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <ManoVakthaIcon className="w-20 h-20 text-[#8C5A2A] mx-auto" />
                <h1 className="text-4xl font-sanskrit tracking-wider text-[#4A2C2A] mt-4">Mano Vaktha</h1>
                <p className="text-lg text-[#4A2C2A]/80 mt-1">{t('yourWellnessCompanion')}</p>
            </div>

            <div className="bg-[#FBF5E9]/80 backdrop-blur-sm border-2 border-[#D4AF37]/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8">
                <div className="flex border-b-2 border-[#D4AF37]/30 mb-6">
                    <button onClick={() => handleModeChange('login')} className={`flex-1 pb-3 font-bold text-xl transition-colors ${mode === 'login' ? 'text-[#4A2C2A] border-b-4 border-[#8C5A2A]' : 'text-[#4A2C2A]/60 hover:text-[#4A2C2A]'}`}>{t('login')}</button>
                    <button onClick={() => handleModeChange('signup')} className={`flex-1 pb-3 font-bold text-xl transition-colors ${mode === 'signup' ? 'text-[#4A2C2A] border-b-4 border-[#8C5A2A]' : 'text-[#4A2C2A]/60 hover:text-[#4A2C2A]'}`}>{t('signUp')}</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 border-2 border-red-300 bg-red-50 rounded-lg">
                            <p className="text-red-700 text-center">{error}</p>
                        </div>
                    )}
                    {mode === 'signup' && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-[#4A2C2A] mb-2">{t('name')}</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full p-3 border-2 border-[#D4AF37]/50 rounded-lg focus:ring-2 focus:ring-[#8C5A2A] focus:outline-none transition-all duration-300 text-lg bg-[#FBF5E9] text-[#4A2C2A] placeholder-[#8C5A2A]/70" />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-[#4A2C2A] mb-2">{t('emailAddress')}</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 border-2 border-[#D4AF37]/50 rounded-lg focus:ring-2 focus:ring-[#8C5A2A] focus:outline-none transition-all duration-300 text-lg bg-[#FBF5E9] text-[#4A2C2A] placeholder-[#8C5A2A]/70" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-bold text-[#4A2C2A] mb-2">{t('password')}</label>

                        <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 border-2 border-[#D4AF37]/50 rounded-lg focus:ring-2 focus:ring-[#8C5A2A] focus:outline-none transition-all duration-300 text-lg bg-[#FBF5E9] text-[#4A2C2A] placeholder-[#8C5A2A]/70" />
                    </div>

                    {mode === 'signup' && (
                        <div className="space-y-4">
                            <div className="relative flex items-start">
                                <div className="flex h-6 items-center">
                                    <input
                                        id="responsibility-check"
                                        name="responsibility-check"
                                        type="checkbox"
                                        checked={agreedResponsibility}
                                        onChange={(e) => setAgreedResponsibility(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-400 text-[#8C5A2A] focus:ring-[#8C5A2A]"
                                    />
                                </div>
                                <div className="ml-3 text-sm leading-6">
                                    <label htmlFor="responsibility-check" className="font-medium text-[#4A2C2A]/90">
                                        {t('agreeResponsibility')}
                                    </label>
                                </div>
                            </div>
                            <div className="relative flex items-start">
                                <div className="flex h-6 items-center">
                                    <input
                                        id="dependency-check"
                                        name="dependency-check"
                                        type="checkbox"
                                        checked={agreedNotDepending}
                                        onChange={(e) => setAgreedNotDepending(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-400 text-[#8C5A2A] focus:ring-[#8C5A2A]"
                                    />
                                </div>
                                <div className="ml-3 text-sm leading-6">
                                    <label htmlFor="dependency-check" className="font-medium text-[#4A2C2A]/90">
                                        {t('agreeNotDepending')}
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        disabled={isLoading || (mode === 'signup' && (!agreedResponsibility || !agreedNotDepending))} 
                        className="w-full flex items-center justify-center bg-[#8C5A2A] text-[#FBF5E9] font-bold py-3 px-6 rounded-lg hover:bg-[#4A2C2A] disabled:bg-[#8C5A2A]/60 disabled:cursor-not-allowed transition-all duration-300 shadow-md"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('loading')}...
                            </>
                        ) : (mode === 'login' ? t('login') : t('createAccount'))}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-[#4A2C2A]">
                    {mode === 'login' ? t('dontHaveAccount') : t('alreadyHaveAccount')}
                    <button onClick={() => handleModeChange(mode === 'login' ? 'signup' : 'login')} className="font-bold hover:underline ml-1 focus:outline-none focus:ring-2 focus:ring-[#8C5A2A] rounded">
                        {mode === 'login' ? t('signUp') : t('login')}
                    </button>
                </p>
            </div>
        </div>
    </div>
  );
};

export default AuthView;