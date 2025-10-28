
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { type Solution } from '../types';
import { savedSolutionsService, type SavedSolutionEntry } from '../services';
import SolutionCard from './SolutionCard';

const SavedView: React.FC = () => {
    const { t } = useLanguage();
    const { isAuthenticated } = useAuth();
    const [savedSolutions, setSavedSolutions] = useState<SavedSolutionEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            loadSavedSolutions();
        } else {
            // Fallback to localStorage for unauthenticated users
            loadFromLocalStorage();
        }
    }, [isAuthenticated]);

    const loadSavedSolutions = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await savedSolutionsService.getSavedSolutions(1, 100);
            setSavedSolutions(response.savedSolutions);
        } catch (error) {
            console.error('Failed to load saved solutions:', error);
            setError('Failed to load saved solutions');
            // Fallback to localStorage
            loadFromLocalStorage();
        } finally {
            setIsLoading(false);
        }
    };

    const loadFromLocalStorage = () => {
        try {
            const saved = localStorage.getItem('savedSolutions');
            if (saved) {
                const localSolutions: Solution[] = JSON.parse(saved);
                // Convert to SavedSolutionEntry format for compatibility
                const converted: SavedSolutionEntry[] = localSolutions.map((solution, index) => ({
                    _id: `local-${index}`,
                    userId: 'local',
                    solution,
                    originalProblem: 'Saved locally',
                    notes: '',
                    tags: [],
                    isFavorite: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }));
                setSavedSolutions(converted);
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            setError('Failed to load saved solutions');
        } finally {
            setIsLoading(false);
        }
    };
    
    // This effect listens for storage changes from other tabs/windows
     useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'savedSolutions') {
                try {
                    setSavedSolutions(JSON.parse(event.newValue || '[]'));
                } catch {
                    setSavedSolutions([]);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleUnsave = async (solutionToUnsave: SavedSolutionEntry) => {
        if (isAuthenticated && !solutionToUnsave._id.startsWith('local-')) {
            try {
                await savedSolutionsService.deleteSavedSolution(solutionToUnsave._id);
                setSavedSolutions(prev => prev.filter(s => s._id !== solutionToUnsave._id));
            } catch (error) {
                console.error('Failed to delete saved solution:', error);
                setError('Failed to delete solution');
            }
        } else {
            // Handle localStorage for unauthenticated users or local solutions
            const updatedSolutions = savedSolutions.filter(s => 
                s.solution.title !== solutionToUnsave.solution.title || 
                s.solution.reference !== solutionToUnsave.solution.reference
            );
            setSavedSolutions(updatedSolutions);
            
            // Update localStorage
            const localSolutions = updatedSolutions.map(s => s.solution);
            localStorage.setItem('savedSolutions', JSON.stringify(localSolutions));
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 sm:p-8 animate-fade-in flex justify-center items-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#8C5A2A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg text-[#4A2C2A]/80">Loading saved solutions...</p>
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
                        onClick={() => isAuthenticated ? loadSavedSolutions() : loadFromLocalStorage()}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 animate-fade-in">
            <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-[#8C5A2A] mb-2 font-sanskrit">
                    {t('savedSolutions')}
                </h2>
                <p className="text-lg text-[#4A2C2A]/80 max-w-2xl mx-auto">
                    {t('yourSavedWisdom')}
                </p>
            </div>

            {savedSolutions.length > 0 ? (
                <div className="space-y-6">
                    {savedSolutions.map((savedSolution, index) => (
                        <SolutionCard 
                            key={savedSolution._id} 
                            solution={savedSolution.solution} 
                            index={index} 
                            onUnsave={() => handleUnsave(savedSolution)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 border-2 border-dashed border-[#D4AF37]/60 bg-[#FBF5E9] rounded-lg">
                    <p className="text-xl text-[#4A2C2A]/90">{t('noSolutionsSaved')}</p>
                    <p className="text-md text-[#4A2C2A]/70 mt-2">{t('saveFromManuscript')}</p>
                </div>
            )}
        </div>
    );
};

export default SavedView;
