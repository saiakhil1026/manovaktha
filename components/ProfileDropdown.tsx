import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface User {
  name: string;
  email: string;
}

interface ProfileDropdownProps {
  user: User;
  onOpenSettings: () => void;
  onLogout: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onOpenSettings, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : '';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg p-1 pr-3 border border-[#D4AF37]/50 bg-white/50 hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FBF5E9] focus:ring-[#4A2C2A]"
        aria-label="Open user menu"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="w-8 h-8 rounded-full bg-[#8C5A2A] text-white flex items-center justify-center font-bold">
          {getInitial(user.name)}
        </span>
        <span className="font-semibold text-sm text-[#4A2C2A]">{user.name}</span>
        <svg className={`w-4 h-4 text-[#4A2C2A] transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#FBF5E9] border-2 border-[#D4AF37]/50 rounded-lg shadow-lg z-50 animate-fade-in-fast" role="menu">
          <div className="p-4 border-b border-dashed border-[#D4AF37]/50">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-[#8C5A2A] text-white flex items-center justify-center font-bold text-lg">
                {getInitial(user.name)}
              </span>
              <div>
                <p className="font-bold text-base text-[#4A2C2A]">{user.name}</p>
                <p className="text-sm text-[#4A2C2A]/80">{user.email}</p>
                <p className="text-xs text-green-700 font-semibold mt-1">{language}</p>
              </div>
            </div>
          </div>
          <div className="py-2">
            <button role="menuitem" onClick={() => { onOpenSettings(); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-base text-[#4A2C2A] hover:bg-[#D4AF37]/20 flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              {t('viewProfile')}
            </button>
            <button role="menuitem" onClick={() => { onOpenSettings(); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-base text-[#4A2C2A] hover:bg-[#D4AF37]/20 flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
              {t('editProfile')}
            </button>
          </div>
          <div className="border-t border-dashed border-[#D4AF37]/50 py-2">
            <button role="menuitem" onClick={onLogout} className="w-full text-left px-4 py-2 text-base text-red-700 hover:bg-red-100/50 flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              {t('logout')}
            </button>
          </div>
           <style>{`
            @keyframes fade-in-fast {
              from { opacity: 0; transform: translateY(-5px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-fast {
              animation: fade-in-fast 0.2s ease-out forwards;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};
export default ProfileDropdown;