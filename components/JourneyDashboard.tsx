import React from 'react';
import { type JourneyPlan, type JourneyDay } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface JourneyDashboardProps {
  plan: JourneyPlan;
  onStartSession: (day: JourneyDay) => void;
}

const JourneyDashboard: React.FC<JourneyDashboardProps> = ({ plan, onStartSession }) => {
  const { t } = useLanguage();
  const completedDays = plan.days.filter(day => day.completed).length;
  const totalDays = plan.days.length;
  const progressPercentage = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

  return (
    <div className="p-4 sm:p-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#8C5A2A] mb-2 font-sanskrit">
          {t('yourWellnessJourney')}
        </h2>
        <p className="text-lg text-[#4A2C2A]/80 max-w-2xl mx-auto">
          {plan.title}
        </p>
      </div>

      <div className="mb-10 p-6 rounded-lg border-2 border-dashed border-[#D4AF37]/60 bg-[#FBF5E9]">
        <h3 className="font-bold text-xl text-[#4A2C2A] mb-4 text-center">{t('journeyProgress')}</h3>
        <div className="flex items-center gap-4">
            <div 
                role="progressbar"
                aria-valuenow={completedDays}
                aria-valuemin={0}
                aria-valuemax={totalDays}
                aria-label={`${t('journeyProgress')} ${completedDays} of ${totalDays} ${t('days')}`}
                className="w-full bg-[#EAE0C8] rounded-full h-6 border border-[#D4AF37]/50 overflow-hidden">
                <div 
                    className="bg-gradient-to-r from-[#8C5A2A] to-[#D4AF37] h-6 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2" 
                    style={{ width: `${progressPercentage}%` }}
                    aria-hidden="true"
                >
                  {progressPercentage > 10 && <span className="text-white text-xs font-bold">{Math.round(progressPercentage)}%</span>}
                </div>
            </div>
            <span className="font-bold text-[#4A2C2A] w-24 text-right" aria-hidden="true">{completedDays} / {totalDays} {t('days')}</span>
        </div>
        <div className="flex justify-between mt-2 text-sm text-[#8C5A2A]/80" aria-hidden="true">
            <span>{t('start')}</span>
            <span>{t('completion')}</span>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-2xl text-[#4A2C2A] mb-6 text-center font-sanskrit">{t('roadmap')}</h3>
        <div className="space-y-4">
          {plan.days.map((day, index) => (
            <div key={day.day} className={`flex items-center p-4 rounded-lg border transition-all duration-300 ${day.completed ? 'bg-green-100/60 border-green-500/50 opacity-80' : 'bg-[#FBF5E9]/80 border-[#D4AF37]/50'}`}>
              <div aria-hidden="true" className={`w-12 h-12 rounded-full flex-shrink-0 mr-4 flex items-center justify-center font-bold text-xl transition-colors duration-300 ${day.completed ? 'bg-green-600 text-white' : 'bg-[#EAE0C8] text-[#4A2C2A]'}`}>
                {day.completed ? <CheckCircleIcon className="w-8 h-8"/> : day.day}
              </div>
              <div>
                <p className={`font-bold text-lg text-[#4A2C2A] transition-all duration-300 ${day.completed ? 'line-through text-gray-500' : ''}`}>{t('day')} {day.day}: {day.topic}</p>
                {!day.completed && index === completedDays && (
                   <button 
                     onClick={() => onStartSession(day)}
                     className="text-sm font-bold text-[#8C5A2A] hover:underline mt-1 focus:outline-none focus:ring-2 focus:ring-[#8C5A2A] rounded p-1 -ml-1"
                   >
                     {t('startTodaysSession')}
                   </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JourneyDashboard;