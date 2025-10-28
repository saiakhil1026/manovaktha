
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { journeyService, manuscriptService, type JourneyPlanEntry, type ManuscriptHistoryEntry } from '../services';
import SolutionCard from './SolutionCard';

interface HistoryViewProps {
  onNavigate: (view: 'journey' | 'manuscript', shouldReset?: boolean) => void;
}

const ManuscriptHistoryEntryComponent: React.FC<{ item: ManuscriptHistoryEntry }> = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t, language } = useLanguage();

    const formattedDate = new Date(item.createdAt).toLocaleDateString(language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="border border-[#D4AF37]/50 rounded-lg shadow-sm bg-[#FBF5E9]/90 overflow-hidden">
            <div className="p-4">
                <p className="text-sm text-[#4A2C2A]/70 mb-1">{t('queriedOn')}: {formattedDate}</p>
                <p className="font-semibold text-[#4A2C2A] text-lg">"{item.problem}"</p>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="mt-3 text-sm font-bold text-[#8C5A2A] hover:underline"
                >
                    {isOpen ? t('hideSolutions') : t('viewSolutions')}
                </button>
            </div>
            {isOpen && (
                <div className="p-4 border-t-2 border-dashed border-[#D4AF37]/50 space-y-4">
                    {item.solutions.map((solution, index) => (
                        <SolutionCard key={index} solution={solution} index={index} />
                    ))}
                </div>
            )}
        </div>
    );
};

const HistoryView: React.FC<HistoryViewProps> = ({ onNavigate }) => {
    const { t } = useLanguage();
    const { isAuthenticated } = useAuth();
    const [journeyPlan, setJourneyPlan] = useState<JourneyPlanEntry | null>(null);
    const [history, setHistory] = useState<ManuscriptHistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            loadDataFromDatabase();
        } else {
            loadDataFromLocalStorage();
        }
    }, [isAuthenticated]);

    const loadDataFromDatabase = async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('🔄 Loading journey and history data from database...');

            // Load current journey
            const journeyResponse = await journeyService.getCurrentJourney();
            console.log('📊 Journey response:', journeyResponse);
            setJourneyPlan(journeyResponse.journeyPlan);

            // Load manuscript history
            const historyResponse = await manuscriptService.getHistory(1, 50);
            console.log('📚 History response:', historyResponse);
            setHistory(historyResponse.history);
        } catch (error) {
            console.error('❌ Failed to load data from database:', error);
            setError('Failed to load history');
            // Fallback to localStorage
            loadDataFromLocalStorage();
        } finally {
            setIsLoading(false);
        }
    };

    const loadDataFromLocalStorage = () => {
        try {
            const savedPlan = localStorage.getItem('journeyPlan');
            if (savedPlan) {
                const planData = JSON.parse(savedPlan);
                // Convert to JourneyPlanEntry format
                const convertedPlan: JourneyPlanEntry = {
                    _id: 'local',
                    userId: 'local',
                    title: planData.title,
                    originalProblem: planData.originalProblem,
                    days: planData.days,
                    language: 'English',
                    status: 'active',
                    progress: planData.days ? Math.round((planData.days.filter((d: any) => d.completed).length / planData.days.length) * 100) : 0,
                    startedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                setJourneyPlan(convertedPlan);
            }

            const savedHistory = localStorage.getItem('manuscriptHistory');
            if (savedHistory) {
                const historyData = JSON.parse(savedHistory);
                // Convert to ManuscriptHistoryEntry format
                const convertedHistory: ManuscriptHistoryEntry[] = historyData.map((item: any, index: number) => ({
                    _id: `local-${index}`,
                    userId: 'local',
                    problem: item.problem,
                    solutions: item.solutions,
                    language: 'English',
                    tags: [],
                    isArchived: false,
                    createdAt: new Date(item.timestamp).toISOString(),
                    updatedAt: new Date(item.timestamp).toISOString()
                }));
                setHistory(convertedHistory);
            }
        } catch (error) {
            console.error("Failed to load history from localStorage", error);
            setError('Failed to load local history');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (window.confirm(t('confirmClearHistory'))) {
            try {
                if (isAuthenticated) {
                    await manuscriptService.clearHistory();
                } else {
                    localStorage.removeItem('manuscriptHistory');
                }
                setHistory([]);
            } catch (error) {
                console.error('Failed to clear history:', error);
                setError('Failed to clear history');
            }
        }
    };

    const renderJourneySection = () => {
        if (!journeyPlan) {
            return (
                <div className="text-center p-6 border-2 border-dashed border-[#D4AF37]/60 bg-[#FBF5E9] rounded-lg">
                    <p className="text-lg text-[#4A2C2A]/80">{t('journeyNotStarted')}</p>
                    <p className="text-sm text-[#4A2C2A]/70">{t('startOneInJourneyTab')}</p>
                </div>
            );
        }

        const completedDays = journeyPlan.days.filter(day => day.completed).length;
        const totalDays = journeyPlan.days.length;
        const progressPercentage = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

        return (
            <div className="p-6 border-2 border-dashed border-[#D4AF37]/60 bg-[#FBF5E9] rounded-lg">
                <h3 className="font-bold text-xl text-[#4A2C2A] mb-2">{journeyPlan.title}</h3>
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-full bg-[#EAE0C8] rounded-full h-4 border border-[#D4AF37]/50 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-[#8C5A2A] to-[#D4AF37] h-4 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    <span className="font-bold text-[#4A2C2A] text-sm">{completedDays}/{totalDays} {t('days')}</span>
                </div>
                <button
                    onClick={() => onNavigate('journey')}
                    className="w-full bg-[#8C5A2A] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#4A2C2A] transition-all duration-300 shadow-md"
                >
                    {t('continueJourney')}
                </button>
            </div>
        );
    };

    const renderManuscriptHistory = () => {
        if (history.length === 0) {
            return (
                 <div className="text-center p-6 border-2 border-dashed border-[#D4AF37]/60 bg-[#FBF5E9] rounded-lg">
                    <p className="text-lg text-[#4A2C2A]/80">{t('noManuscriptHistory')}</p>
                </div>
            );
        }
        return (
            <div className="space-y-4">
                {history.map(item => <ManuscriptHistoryEntryComponent key={item._id} item={item} />)}
                <div className="text-center pt-4">
                    <button
                        onClick={handleClearHistory}
                        className="text-sm font-semibold text-red-700 bg-red-100/70 py-2 px-4 rounded-lg hover:bg-red-200/70 border border-red-500/50 transition-colors"
                    >
                        {t('clearHistory')}
                    </button>
                </div>
            </div>
        );
    };
    
    if (isLoading) {
        return (
            <div className="p-4 sm:p-8 animate-fade-in flex justify-center items-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#8C5A2A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg text-[#4A2C2A]/80">Loading history...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-8 animate-fade-in">
                <div className="text-center p-8 border-2 border-red-300 bg-red-50 rounded-lg">
                    <p className="text-xl text-red-700">{error}</p>
                    <button 
                        onClick={() => isAuthenticated ? loadDataFromDatabase() : loadDataFromLocalStorage()}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 animate-fade-in space-y-12">
            <div className="text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-[#8C5A2A] mb-2 font-sanskrit">
                    {t('yourHistory')}
                </h2>
                <p className="text-lg text-[#4A2C2A]/80 max-w-2xl mx-auto">
                    {t('reviewPastSessions')}
                </p>
            </div>

            <section>
                <h3 className="text-2xl font-bold text-[#4A2C2A] font-sanskrit mb-4 text-center">{t('currentJourney')}</h3>
                {renderJourneySection()}
            </section>
            
            <section>
                 <h3 className="text-2xl font-bold text-[#4A2C2A] font-sanskrit mb-4 text-center">{t('pastManuscriptQueries')}</h3>
                 {renderManuscriptHistory()}
            </section>
        </div>
    );
};

export default HistoryView;
