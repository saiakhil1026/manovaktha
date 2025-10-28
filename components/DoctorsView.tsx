import React, { useState, useEffect, useRef } from 'react';
import { type DoctorProfile, type DoctorSpecialization } from '../types';
// import { getDoctorList } from '../services/geminiService'; // Replaced with static data
import { useLanguage } from '../contexts/LanguageContext';
import Loader from './Loader';
import StarIcon from './icons/StarIcon';
import CloseIcon from './icons/CloseIcon';

const specializations: DoctorSpecialization[] = ['Psychiatrist', 'Therapist', 'Counselor', 'Life Coach'];

// Static doctor data - 20 professionals
const staticDoctors: DoctorProfile[] = [
  {
    name: "Doctor-1",
    specialization: "Psychiatrist",
    experience: 15,
    rating: 4.8,
    bio: "Specializing in anxiety and depression disorders. Practicing in Koramangala, Bangalore with a compassionate approach to mental wellness.",
    address: "Address - XYZ Road 1, Bangalore - 560076"
  },
  {
    name: "Doctor-2",
    specialization: "Therapist", 
    experience: 12,
    rating: 4.7,
    bio: "Cognitive Behavioral Therapy expert based in Mumbai. Helps individuals overcome trauma and build resilience through evidence-based practices.",
    address: "Address - XYZ Road 2, Mumbai - 400050"
  },
  {
    name: "Doctor-3",
    specialization: "Counselor",
    experience: 10,
    rating: 4.9,
    bio: "Family and relationship counselor in Hyderabad. Specializes in marital therapy and adolescent behavioral issues with 10+ years experience.",
    address: "Address - XYZ Road 3, Hyderabad - 500034"
  },
  {
    name: "Doctor-4",
    specialization: "Life Coach",
    experience: 8,
    rating: 4.6,
    bio: "Life transformation coach in Delhi. Empowers individuals to achieve personal and professional goals through mindfulness and strategic planning.",
    address: "Address - XYZ Road 4, New Delhi - 110017"
  },
  {
    name: "Doctor-5",
    specialization: "Psychiatrist",
    experience: 18,
    rating: 4.9,
    bio: "Senior psychiatrist in Ahmedabad specializing in mood disorders and psychotherapy. Known for her patient-centered approach to mental health care.",
    address: "Address - XYZ Road 5, Ahmedabad - 380052"
  },
  {
    name: "Doctor-6",
    specialization: "Therapist",
    experience: 14,
    rating: 4.8,
    bio: "Clinical psychologist in Kochi. Expert in PTSD treatment and addiction recovery with extensive experience in group therapy sessions.",
    address: "Address - XYZ Road 6, Kochi - 682027"
  },
  {
    name: "Doctor-7",
    specialization: "Counselor", 
    experience: 11,
    rating: 4.7,
    bio: "Career and wellness counselor in Pune. Helps professionals manage work stress and achieve work-life balance through holistic approaches.",
    address: "Address - XYZ Road 7, Pune - 411001"
  },
  {
    name: "Doctor-8",
    specialization: "Life Coach",
    experience: 9,
    rating: 4.5,
    bio: "Executive coach and motivational speaker in Gurgaon. Specializes in leadership development and personal growth for corporate professionals.",
    address: "Address - XYZ Road 8, Gurgaon - 122001"
  },
  {
    name: "Doctor-9",
    specialization: "Psychiatrist",
    experience: 16,
    rating: 4.8,
    bio: "Child and adolescent psychiatrist in Chennai. Specializes in autism spectrum disorders and ADHD treatment with a family-centered approach.",
    address: "Address - XYZ Road 9, Chennai - 600006"
  },
  {
    name: "Doctor-10",
    specialization: "Therapist",
    experience: 13,
    rating: 4.6,
    bio: "Mindfulness-based therapist in Jaipur. Combines traditional therapy with meditation techniques for anxiety and stress management.",
    address: "Address - XYZ Road 10, Jaipur - 302017"
  },
  {
    name: "Doctor-11",
    specialization: "Counselor",
    experience: 12,
    rating: 4.8,
    bio: "Grief and trauma counselor in Lucknow. Provides compassionate support for individuals dealing with loss and major life transitions.",
    address: "Address - XYZ Road 11, Lucknow - 226010"
  },
  {
    name: "Doctor-12",
    specialization: "Life Coach",
    experience: 10,
    rating: 4.7,
    bio: "Wellness and lifestyle coach in Surat. Focuses on holistic health improvement and sustainable habit formation for long-term success.",
    address: "Address - XYZ Road 12, Surat - 395002"
  },
  {
    name: "Doctor-13",
    specialization: "Psychiatrist",
    experience: 20,
    rating: 4.9,
    bio: "Senior consultant psychiatrist in New Delhi. Expert in bipolar disorder and schizophrenia treatment with over two decades of experience.",
    address: "Address - XYZ Road 13, New Delhi - 110029"
  },
  {
    name: "Doctor-14",
    specialization: "Therapist",
    experience: 11,
    rating: 4.7,
    bio: "Sports psychologist and therapist in Mangalore. Helps athletes and professionals overcome performance anxiety and build mental resilience.",
    address: "Address - XYZ Road 14, Mangalore - 575001"
  },
  {
    name: "Doctor-15",
    specialization: "Counselor",
    experience: 9,
    rating: 4.6,
    bio: "Women's wellness counselor in Coimbatore. Specializes in postpartum depression, fertility counseling, and women's mental health issues.",
    address: "Address - XYZ Road 15, Coimbatore - 641014"
  },
  {
    name: "Doctor-16",
    specialization: "Life Coach",
    experience: 7,
    rating: 4.5,
    bio: "Career transition coach in Indore. Helps mid-career professionals navigate career changes and discover their true calling through structured guidance.",
    address: "Address - XYZ Road 16, Indore - 452014"
  },
  {
    name: "Doctor-17",
    specialization: "Psychiatrist",
    experience: 14,
    rating: 4.8,
    bio: "Geriatric psychiatrist in Chandigarh. Specializes in dementia care and mental health issues affecting elderly populations with dignity and care.",
    address: "Address - XYZ Road 17, Chandigarh - 160012"
  },
  {
    name: "Doctor-18",
    specialization: "Therapist",
    experience: 15,
    rating: 4.9,
    bio: "Addiction recovery therapist in Bhopal. Expert in substance abuse treatment and relapse prevention with a strong track record of successful recoveries.",
    address: "Address - XYZ Road 18, Bhopal - 462026"
  },
  {
    name: "Doctor-19",
    specialization: "Counselor",
    experience: 8,
    rating: 4.6,
    bio: "Student counselor and academic stress specialist in Kanpur. Helps students overcome exam anxiety and develop effective study strategies.",
    address: "Address - XYZ Road 19, Kanpur - 208001"
  },
  {
    name: "Doctor-20",
    specialization: "Life Coach",
    experience: 12,
    rating: 4.7,
    bio: "Retirement planning and senior life coach in Nagpur. Assists individuals in planning fulfilling post-retirement lives and managing life transitions.",
    address: "Address - XYZ Road 20, Nagpur - 440010"
  }
];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const partialStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (partialStar ? 1 : 0);

  return (
    <div className="flex items-center text-amber-500">
      {[...Array(fullStars)].map((_, i) => <StarIcon key={`full-${i}`} className="w-5 h-5" />)}
      {partialStar && <StarIcon key="partial" className="w-5 h-5" style={{ clipPath: `inset(0 ${100 - (rating % 1) * 100}% 0 0)` }} />}
      {[...Array(emptyStars)].map((_, i) => <StarIcon key={`empty-${i}`} className="w-5 h-5 text-gray-300" />)}
       <span className="ml-2 text-sm text-[#4A2C2A]/80 font-bold">{rating.toFixed(1)}</span>
    </div>
  );
};


const DoctorsView: React.FC = () => {
    const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<DoctorSpecialization | 'All'>('All');
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
    const [bookingStep, setBookingStep] = useState(1);
    const [bookingDetails, setBookingDetails] = useState({ type: 'Virtual', date: '', time: '' });

    const { language, t } = useLanguage();
    
    const modalRef = useRef<HTMLDivElement>(null);
    const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        // Load static doctor data with simulated loading
        const loadDoctors = () => {
            setIsLoading(true);
            setError(null);
            
            // Simulate brief loading for better UX
            setTimeout(() => {
                setDoctors(staticDoctors);
                setIsLoading(false);
            }, 300);
        };
        
        loadDoctors();
    }, [language, t]);
    
    // Accessibility Effect for Modal
    useEffect(() => {
        if (!selectedDoctor) return;

        const modalNode = modalRef.current;
        if (!modalNode) return;

        const focusableElements = modalNode.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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
    }, [selectedDoctor]);

    const handleOpenModal = (doctor: DoctorProfile, e: React.MouseEvent<HTMLButtonElement>) => {
        triggerButtonRef.current = e.currentTarget;
        setSelectedDoctor(doctor);
        setBookingStep(1);
        const today = new Date().toISOString().split('T')[0];
        setBookingDetails({ type: 'Virtual', date: today, time: '10:00' });
    };

    const handleCloseModal = () => {
        setSelectedDoctor(null);
    };

    const handleConfirmBooking = () => {
        setBookingStep(2);
    };

    const filteredDoctors = filter === 'All' ? doctors : doctors.filter(d => d.specialization === filter);

    const renderContent = () => {
        if (isLoading) return <div className="my-8"><Loader /></div>;
        if (error) return (
            <div className="text-center text-red-800 bg-red-100/50 border-2 border-red-500/50 rounded-lg p-4 my-8 animate-fade-in">
                <p className="font-bold text-lg">{error}</p>
            </div>
        );

        return (
            <div className="space-y-6">
                {filteredDoctors.map((doc, index) => (
                    <div key={index} className="bg-[#FBF5E9]/90 border border-[#D4AF37]/50 rounded-lg shadow-sm p-5 flex flex-col sm:flex-row items-center gap-5 transition-all duration-300 hover:shadow-md hover:border-[#D4AF37]">
                        <img src={`https://picsum.photos/150/150?random=${index + 1}`} alt={`Object ${index + 1}`} className="w-24 h-24 rounded-full border-4 border-[#D4AF37]/50 flex-shrink-0" />
                        <div className="flex-grow text-center sm:text-left">
                            <h3 className="text-xl font-bold text-[#4A2C2A]">{doc.name}</h3>
                            <p className="font-semibold text-[#8C5A2A]">{t(doc.specialization)}</p>
                            <p className="text-sm text-[#4A2C2A]/80 mt-1 mb-2">{doc.bio}</p>
                            <p className="text-sm text-[#4A2C2A]/70 mb-2 font-medium">{doc.address}</p>
                            <div className="flex items-center justify-center sm:justify-start gap-4 flex-wrap">
                                <StarRating rating={doc.rating} />
                                <span className="text-sm font-semibold text-[#4A2C2A]">{t('yearsExperience', doc.experience)}</span>
                            </div>
                        </div>
                        <button onClick={(e) => handleOpenModal(doc, e)} className="bg-[#8C5A2A] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#4A2C2A] transition-all duration-300 shadow-md flex-shrink-0 whitespace-nowrap">
                            {t('bookAppointment')}
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    const renderBookingModal = () => {
        if (!selectedDoctor) return null;
        
        const availableTimes = ['10:00', '11:00', '14:00', '15:00', '16:00'];

        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="fixed inset-0" onClick={handleCloseModal} aria-hidden="true"></div>
                <div 
                    ref={modalRef}
                    className="bg-[#FBF5E9] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative z-10"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="booking-modal-title"
                >
                     <button onClick={handleCloseModal} className="absolute top-4 right-4 text-[#4A2C2A] hover:scale-110 transition-transform" aria-label={t('close')}>
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <h2 id="booking-modal-title" className="text-2xl font-bold text-[#8C5A2A] font-sanskrit text-center mb-6">{t('appointmentWith', selectedDoctor.name)}</h2>
                    
                    {bookingStep === 1 ? (
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-lg text-[#4A2C2A] mb-2">{t('selectConsultationType')}</h3>
                                <div className="flex gap-4">
                                    {['virtual', 'inPerson'].map(type => (
                                        <button key={type} onClick={() => setBookingDetails(d => ({...d, type}))} className={`flex-1 py-3 font-semibold rounded-lg border-2 transition-colors ${bookingDetails.type.toLowerCase() === type ? 'bg-[#8C5A2A] text-white border-[#8C5A2A]' : 'bg-transparent text-[#4A2C2A] border-[#D4AF37]/50 hover:bg-[#D4AF37]/20'}`}>{t(type)}</button>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <label htmlFor="date-picker" className="font-bold text-lg text-[#4A2C2A] mb-2 block">{t('selectDate')}</label>
                                <input id="date-picker" type="date" value={bookingDetails.date} onChange={e => setBookingDetails(d => ({...d, date: e.target.value}))} className="w-full p-3 border-2 border-[#D4AF37]/50 rounded-lg text-lg bg-white"/>
                            </div>
                             <div>
                                <h3 className="font-bold text-lg text-[#4A2C2A] mb-2">{t('selectTime')}</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {availableTimes.map(time => (
                                        <button key={time} onClick={() => setBookingDetails(d => ({...d, time}))} className={`py-2 font-semibold rounded-lg border-2 transition-colors ${bookingDetails.time === time ? 'bg-[#8C5A2A] text-white border-[#8C5A2A]' : 'bg-transparent text-[#4A2C2A] border-[#D4AF37]/50 hover:bg-[#D4AF37]/20'}`}>{time}</button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleConfirmBooking} className="w-full bg-[#8C5A2A] text-white font-bold py-3 text-lg rounded-lg hover:bg-[#4A2C2A] transition-colors">{t('confirmBooking')}</button>
                        </div>
                    ) : (
                        <div className="text-center p-6 animate-fade-in">
                            <h3 className="text-2xl font-bold text-green-700 mb-4">{t('bookingConfirmed')}</h3>
                            <p className="text-lg text-[#4A2C2A]/90">
                                {t('bookingConfirmationMessage', selectedDoctor.name, new Date(bookingDetails.date).toLocaleDateString(language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}), bookingDetails.time)}
                            </p>
                            <button onClick={handleCloseModal} className="mt-8 bg-[#8C5A2A] text-white font-bold py-2 px-8 rounded-lg hover:bg-[#4A2C2A] transition-colors">{t('close')}</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-[#8C5A2A] mb-2 font-sanskrit">
                    {t('consultProfessional')}
                </h2>
                <p className="text-lg text-[#4A2C2A]/80 max-w-2xl mx-auto">
                    {t('findSupport')}
                </p>
            </div>

            <div className="mb-8">
                <label className="font-bold text-lg text-[#4A2C2A] mb-2 block text-center sm:text-left">{t('filterBySpecialization')}</label>
                <div className="flex flex-wrap justify-center gap-2 bg-[#FBF5E9] p-2 rounded-lg border border-[#D4AF37]/50">
                    <button onClick={() => setFilter('All')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${filter === 'All' ? 'bg-white text-[#4A2C2A] shadow-sm' : 'bg-transparent text-[#4A2C2A]/80 hover:bg-white/70'}`}>{t('all')}</button>
                    {specializations.map(spec => (
                        <button key={spec} onClick={() => setFilter(spec)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${filter === spec ? 'bg-white text-[#4A2C2A] shadow-sm' : 'bg-transparent text-[#4A2C2A]/80 hover:bg-white/70'}`}>{t(spec)}</button>
                    ))}
                </div>
            </div>

            {renderContent()}
            {renderBookingModal()}
        </div>
    );
};

export default DoctorsView;