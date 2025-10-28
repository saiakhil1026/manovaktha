import React, { useState, useEffect, useRef } from 'react';
import { type VideoSuggestion } from '../types';
import { getVideoSuggestions } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import Loader from './Loader';
import CloseIcon from './icons/CloseIcon';

interface MediaViewProps {
  problem: string;
}

const MediaView: React.FC<MediaViewProps> = ({ problem }) => {
  const [videos, setVideos] = useState<VideoSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const { language, t } = useLanguage();

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (problem) {
      const fetchVideos = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedVideos = await getVideoSuggestions(problem, language);
          setVideos(fetchedVideos);
        } catch (err) {
            console.error(err);
             if (err instanceof Error && err.message === 'RATE_LIMIT_EXCEEDED') {
                setError(t('apiRateLimitError'));
            } else {
                setError(t('errorOccurred'));
            }
        } finally {
          setIsLoading(false);
        }
      };
      fetchVideos();
    }
  }, [problem, language, t]);
  
  // Accessibility Effect for Modal
  useEffect(() => {
    if (!selectedVideoId) return;

    const modalNode = modalRef.current;
    if (!modalNode) return;

    const focusableElements = modalNode.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), iframe'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
      if (e.key === 'Tab') {
        if (e.shiftKey) { // Shift+Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    modalNode.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      modalNode.removeEventListener('keydown', handleKeyDown);
      triggerButtonRef.current?.focus();
    };
  }, [selectedVideoId]);
  
  const handleOpenModal = (videoId: string, e: React.MouseEvent<HTMLButtonElement>) => {
      triggerButtonRef.current = e.currentTarget;
      setSelectedVideoId(videoId);
  }

  const handleCloseModal = () => {
      setSelectedVideoId(null);
  }


  const renderContent = () => {
    if (!problem) {
      return (
        <div className="text-center p-8">
          <p className="text-xl text-[#4A2C2A]/90">{t('describeProblemInManuscript')}</p>
        </div>
      );
    }

    if (isLoading) {
      return <div className="my-8"><Loader /></div>;
    }

    if (error) {
      return (
        <div className="text-center text-red-800 bg-red-100/50 border-2 border-red-500/50 rounded-lg p-4 my-8 animate-fade-in">
          <p className="font-bold text-lg">{error}</p>
        </div>
      );
    }
    
     if (videos.length === 0) {
      return (
        <div className="text-center p-8">
          <p className="text-xl text-[#4A2C2A]/90">{t('noVideosFound')}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.youtubeId} className="bg-[#FBF5E9]/90 border border-[#D4AF37]/50 rounded-lg shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-lg hover:border-[#D4AF37] transform hover:-translate-y-1">
            <button onClick={(e) => handleOpenModal(video.youtubeId, e)} className="w-full text-left" aria-label={`${t('watchVideo')}: ${video.title}`}>
              <div className="aspect-video bg-black overflow-hidden">
                <img
                  src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt="" // Decorative, as the button has the full title
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-[#4A2C2A] leading-tight mb-2 group-hover:text-[#8C5A2A]">{video.title}</h3>
                <p className="text-sm text-[#4A2C2A]/80 font-semibold">{video.channel}</p>
              </div>
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#8C5A2A] mb-2 font-sanskrit">
          {t('visualGuidance')}
        </h2>
        <p className="text-lg text-[#4A2C2A]/80 max-w-2xl mx-auto">
          {t('videosForYourPath')}
        </p>
      </div>
      {renderContent()}

      {selectedVideoId && (
         <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="fixed inset-0" onClick={handleCloseModal} aria-hidden="true"></div>
            <div 
                ref={modalRef}
                className="relative w-full max-w-3xl aspect-video bg-black rounded-lg shadow-2xl z-10"
                role="dialog"
                aria-modal="true"
                aria-labelledby="video-modal-title"
            >
                <h2 id="video-modal-title" className="sr-only">{videos.find(v => v.youtubeId === selectedVideoId)?.title || t('watchVideo')}</h2>
                 <button 
                    onClick={handleCloseModal} 
                    className="absolute -top-3 -right-3 w-10 h-10 bg-[#FBF5E9] rounded-full flex items-center justify-center text-[#4A2C2A] hover:bg-white hover:scale-110 transition-transform z-10"
                    aria-label={t('close')}
                 >
                    <CloseIcon className="w-6 h-6" />
                </button>
                <iframe
                    className="w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&rel=0`}
                    title={videos.find(v => v.youtubeId === selectedVideoId)?.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
      )}
    </div>
  );
};

export default MediaView;