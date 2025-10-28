import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ProblemInput from './components/ProblemInput';
import SolutionCard from './components/SolutionCard';
import Loader from './components/Loader';
import Welcome from './components/Welcome';
import IntroAnimation from './components/IntroAnimation';
import JourneyView from './components/JourneyView';
import AnalysisView from './components/AnalysisView';
import QuickChatView from './components/QuickChatView';
import AuthView from './components/AuthView';
import MediaView from './components/MediaView';
import DoctorsView from './components/DoctorsView';
import HistoryView from './components/HistoryView';
import SavedView from './components/SavedView';
import ProfileSettingsModal from './components/ProfileSettingsModal';
import ManoVakthaIcon from './components/icons/ManoVakthaIcon';
import { type Solution } from './types';
import { getSolutionsFromPuranas, manuscriptService } from './services';
import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';

type AppState = 'idle' | 'loading' | 'success' | 'error';
type AppView = 'intro' | 'auth' | 'manuscript' | 'journey' | 'analysis' | 'quickChat' | 'media' | 'doctors' | 'history' | 'saved';

const App: React.FC = () => {
  const [problem, setProblem] = useState<string>('');
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [appState, setAppState] = useState<AppState>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const [view, setView] = useState<AppView>('intro'); // Start with intro animation
  const [introExiting, setIntroExiting] = useState(false);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  
  const { language, t, isLoaded } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const languageFontMap: Record<string, string> = {
        English: 'font-sans',
        Hindi: 'font-hindi',
        Telugu: 'font-telugu',
    };
    document.body.classList.remove('font-sans', 'font-hindi', 'font-telugu');
    document.body.classList.add(languageFontMap[language]);
  }, [language]);

  const handleEnter = () => {
    setIntroExiting(true);
    setTimeout(() => {
        setView('auth');
    }, 1000); // Duration of the fade-out animation
  };
  
  const handleAuthSuccess = () => {
    setView('manuscript');
  };
  
  const handleLogout = () => {
    // In a real app, you would clear auth tokens, user data, etc.
    setView('auth');
    setIsProfileSettingsOpen(false); // Close modal on logout
  };

  const handleReset = useCallback(() => {
    setAppState('idle');
    setProblem('');
    setSolutions([]);
    setError(null);
  }, []);

  const navigateTo = (targetView: AppView, shouldReset?: boolean) => {
    setView(targetView);
    if (targetView === 'manuscript' && shouldReset) {
      handleReset();
    }
  };
  
  const handleProblemSubmit = useCallback(async (userProblem: string) => {
    if (!userProblem.trim()) {
      setError(t('explainChallenge'));
      setAppState('error');
      return;
    }
    setAppState('loading');
    setError(null);
    setSolutions([]);
    setProblem(userProblem);

    try {
      const fetchedSolutions = await getSolutionsFromPuranas(userProblem, language);
      setSolutions(fetchedSolutions);
      setAppState('success');

      if (fetchedSolutions.length > 0) {
        // Save to MongoDB instead of localStorage
        try {
          await manuscriptService.saveHistory(
            userProblem,
            fetchedSolutions,
            language,
            []
          );
        } catch (dbError) {
          console.error('Failed to save to database:', dbError);
          // Fallback to localStorage if database fails
          const newHistoryItem = {
            problem: userProblem,
            solutions: fetchedSolutions,
            timestamp: Date.now(),
          };
          const existingHistory = JSON.parse(localStorage.getItem('manuscriptHistory') || '[]');
          const updatedHistory = [newHistoryItem, ...existingHistory].slice(0, 10);
          localStorage.setItem('manuscriptHistory', JSON.stringify(updatedHistory));
        }
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error && err.message === 'RATE_LIMIT_EXCEEDED') {
        setError(t('apiRateLimitError'));
      } else {
        setError(t('errorOccurred'));
      }
      setAppState('error');
    }
  }, [language, t]);

  const renderManuscriptContent = () => {
    switch (appState) {
      case 'loading':
        return <Loader />;
      case 'error':
        return (
          <div className="text-center text-red-800 bg-red-100/50 border-2 border-red-500/50 rounded-lg p-4 mb-8 animate-fade-in">
            <p className="font-bold text-lg">{error}</p>
          </div>
        );
      case 'success':
        if (solutions.length === 0) {
            return (
                 <div className="text-center text-amber-800 bg-amber-100/50 border-2 border-amber-500/50 rounded-lg p-4 animate-fade-in">
                    <p className="font-bold text-lg">{t('noSolutionsFound')}</p>
                </div>
            )
        }
        return (
          <section id="solutions-output" className="space-y-6 animate-fade-in">
            <h2 className="text-4xl font-bold text-center text-[#8C5A2A] mb-8 font-sanskrit after:content-[''] after:block after:w-24 after:h-1 after:bg-gradient-to-r after:from-transparent after:via-[#D4AF37] after:to-transparent after:mx-auto after:mt-2">
              {t('guidanceFromScriptures')}
            </h2>
            {solutions.map((solution, index) => (
              <SolutionCard key={index} solution={solution} index={index} />
            ))}
          </section>
        );
      case 'idle':
      default:
        return <Welcome />;
    }
  };

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#FBF5E9]">
        <div className="relative">
            <ManoVakthaIcon className="w-28 h-28 text-[#8C5A2A]" />
            <div className="absolute inset-0 rounded-full bg-[#D4AF37] opacity-20 animate-ping"></div>
        </div>
        <p className="text-xl text-[#4A2C2A] text-center font-semibold mt-6">
            Loading...
        </p>
      </div>
    );
  }
  
  if (view === 'intro') {
    return <IntroAnimation onEnter={handleEnter} isExiting={introExiting} />;
  }

  if (view === 'auth') {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  // Use authenticated user instead of dummy user
  if (!user) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <>
      <div className="min-h-screen flex flex-col animate-fade-in">
        <Header 
          onNavigate={navigateTo} 
          currentView={view} 
          user={user}
          onOpenProfileSettings={() => setIsProfileSettingsOpen(true)}
          onLogout={handleLogout}
        />
        <main className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl flex-grow">
          <div className="bg-[#FBF5E9]/80 backdrop-blur-sm border-2 border-[#D4AF37]/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            {view === 'manuscript' && (
               <div className="p-4 sm:p-8">
                  <section id="problem-input" className="mb-12">
                    <ProblemInput onSubmit={handleProblemSubmit} isLoading={appState === 'loading'} />
                  </section>
                  {renderManuscriptContent()}
               </div>
            )}
            {view === 'journey' && <JourneyView />}
            {view === 'analysis' && <AnalysisView />}
            {view === 'media' && <MediaView problem={problem} />}
            {view === 'doctors' && <DoctorsView />}
            {view === 'history' && <HistoryView onNavigate={navigateTo} />}
            {view === 'saved' && <SavedView />}
            {view === 'quickChat' && <QuickChatView />}
          </div>
        </main>
        <footer className="text-center py-6 text-sm text-[#8C5A2A]/80">
          <p>{t('footerText', new Date().getFullYear())}</p>
        </footer>
      </div>
      <ProfileSettingsModal 
        isOpen={isProfileSettingsOpen} 
        onClose={() => setIsProfileSettingsOpen(false)}
        onLogout={handleLogout}
      />
    </>
  );
};

export default App;