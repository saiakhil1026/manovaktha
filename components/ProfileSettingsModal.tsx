import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { type Language } from '../types';
import CloseIcon from './icons/CloseIcon';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const languages: { code: Language; name: string }[] = [
  { code: 'English', name: 'English' },
  { code: 'Hindi', name: 'Hindi' },
  { code: 'Telugu', name: 'Telugu' },
];

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'danger'>('personal');
  const { t, language, setLanguage } = useLanguage();
  const { user, updateUserProfile, updateUserPreferences } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLElement | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    dateOfBirth: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  // Security form state
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [confirmDeletePassword, setConfirmDeletePassword] = useState('');
  const [confirmDeleteChecked, setConfirmDeleteChecked] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user && isOpen) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
        phone: user.profile?.phone || '',
        dateOfBirth: user.profile?.dateOfBirth || ''
      });
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (isOpen) {
      triggerButtonRef.current = document.activeElement as HTMLElement;
      const modalNode = modalRef.current;
      if (!modalNode) return;

      const focusableElements = modalNode.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      firstElement?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => {
          document.removeEventListener('keydown', handleKeyDown);
          triggerButtonRef.current?.focus();
      }
    }
  }, [isOpen, onClose]);

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    setUpdateMessage('');
    
    try {
      // Update preferences (language)
      if (language !== user.preferences.language) {
        await updateUserPreferences({ language });
      }
      
      // Update profile if any fields changed
      const profileUpdates: any = {};
      if (profileForm.name !== user.name) profileUpdates.name = profileForm.name;
      if (profileForm.bio !== (user.profile?.bio || '')) profileUpdates.bio = profileForm.bio;
      if (profileForm.phone !== (user.profile?.phone || '')) profileUpdates.phone = profileForm.phone;
      if (profileForm.dateOfBirth !== (user.profile?.dateOfBirth || '')) profileUpdates.dateOfBirth = profileForm.dateOfBirth;
      
      if (Object.keys(profileUpdates).length > 0) {
        await updateUserProfile(profileUpdates);
      }
      
      setUpdateMessage(t('profileUpdatedSuccessfully') || 'Profile updated successfully!');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setUpdateMessage(t('profileUpdateFailed') || 'Failed to update profile. Please try again.');
      setTimeout(() => setUpdateMessage(''), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (!isOpen || !user) return null;

  const renderPersonalInformation = () => (
    <div className="space-y-6">
      <div className="p-4 bg-[#EAE0C8]/50 rounded-lg border border-dashed border-[#D4AF37]/50">
        <h3 className="font-bold text-lg text-[#4A2C2A] mb-2">{t('userInformation')}</h3>
        <div className="flex justify-between text-sm text-[#4A2C2A]/80">
          <span>{t('joinedOn')}: {formatDate(user.createdAt)}</span>
          <span>{t('lastUpdated')}: {formatDate(user.updatedAt)}</span>
        </div>
      </div>
      
      {updateMessage && (
        <div className={`p-3 rounded-lg text-sm font-medium ${
          updateMessage.includes('success') || updateMessage.includes('Successfully') 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {updateMessage}
        </div>
      )}
      
      <div>
        <label htmlFor="username-input" className="block text-sm font-bold text-[#4A2C2A] mb-1">{t('username')}</label>
        <input 
          id="username-input" 
          type="text" 
          value={profileForm.name}
          onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
          className="w-full p-2 border-2 border-[#D4AF37]/50 rounded-lg focus:ring-2 focus:ring-[#8C5A2A] bg-white"
        />
      </div>
      
      <div>
        <label htmlFor="email-input" className="block text-sm font-bold text-[#4A2C2A] mb-1">{t('emailAddress')}</label>
        <input 
          id="email-input" 
          type="email" 
          value={profileForm.email}
          disabled
          className="w-full p-2 border-2 border-[#D4AF37]/30 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
        />
        <p className="text-xs text-[#4A2C2A]/60 mt-1">Email cannot be changed</p>
      </div>
      
      <div>
        <label htmlFor="bio-input" className="block text-sm font-bold text-[#4A2C2A] mb-1">Bio</label>
        <textarea 
          id="bio-input" 
          value={profileForm.bio}
          onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
          rows={3}
          placeholder="Tell us about yourself..."
          className="w-full p-2 border-2 border-[#D4AF37]/50 rounded-lg focus:ring-2 focus:ring-[#8C5A2A] bg-white resize-none"
        />
      </div>
      
      <div>
        <label htmlFor="phone-input" className="block text-sm font-bold text-[#4A2C2A] mb-1">Phone Number</label>
        <input 
          id="phone-input" 
          type="tel" 
          value={profileForm.phone}
          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="+1 (555) 123-4567"
          className="w-full p-2 border-2 border-[#D4AF37]/50 rounded-lg focus:ring-2 focus:ring-[#8C5A2A] bg-white"
        />
      </div>
      
      <div>
        <label htmlFor="dob-input" className="block text-sm font-bold text-[#4A2C2A] mb-1">Date of Birth</label>
        <input 
          id="dob-input" 
          type="date" 
          value={profileForm.dateOfBirth}
          onChange={(e) => setProfileForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
          className="w-full p-2 border-2 border-[#D4AF37]/50 rounded-lg focus:ring-2 focus:ring-[#8C5A2A] bg-white"
        />
      </div>
      
      <div>
        <label htmlFor="language-select" className="block text-sm font-bold text-[#4A2C2A] mb-1">{t('preferredLanguage')}</label>
        <select 
          id="language-select" 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as Language)} 
          className="w-full p-2 border-2 border-[#D4AF37]/50 rounded-lg focus:ring-2 focus:ring-[#8C5A2A] bg-white"
        >
          {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
        </select>
      </div>
      
      <button 
        onClick={handleProfileUpdate}
        disabled={isUpdating}
        className="w-full bg-[#8C5A2A] text-white font-bold py-2.5 rounded-lg hover:bg-[#4A2C2A] disabled:bg-[#8C5A2A]/50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {isUpdating ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Updating...
          </>
        ) : (
          t('update')
        )}
      </button>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <h3 className="font-bold text-lg text-[#4A2C2A]">{t('changePassword')}</h3>
      
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Password change functionality is not yet implemented. This feature will be available in a future update.
        </p>
      </div>
      
      <div>
        <label htmlFor="current-password-input" className="block text-sm font-bold text-[#4A2C2A] mb-1">{t('currentPassword')}</label>
        <input 
          id="current-password-input" 
          type="password" 
          value={securityForm.currentPassword}
          onChange={(e) => setSecurityForm(prev => ({ ...prev, currentPassword: e.target.value }))}
          disabled
          className="w-full p-2 border-2 border-[#D4AF37]/30 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
        />
      </div>
      
      <div>
        <label htmlFor="new-password-input" className="block text-sm font-bold text-[#4A2C2A] mb-1">{t('newPassword')}</label>
        <input 
          id="new-password-input" 
          type="password" 
          value={securityForm.newPassword}
          onChange={(e) => setSecurityForm(prev => ({ ...prev, newPassword: e.target.value }))}
          disabled
          className="w-full p-2 border-2 border-[#D4AF37]/30 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
        />
      </div>
      
      <div>
        <label htmlFor="confirm-password-input" className="block text-sm font-bold text-[#4A2C2A] mb-1">{t('confirmPassword')}</label>
        <input 
          id="confirm-password-input" 
          type="password" 
          value={securityForm.confirmPassword}
          onChange={(e) => setSecurityForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
          disabled
          className="w-full p-2 border-2 border-[#D4AF37]/30 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
        />
      </div>
      
      <button 
        disabled
        className="w-full bg-[#8C5A2A]/50 text-white font-bold py-2.5 rounded-lg cursor-not-allowed transition-colors"
      >
        {t('changePassword')} (Coming Soon)
      </button>
    </div>
  );

  const renderDangerZone = () => (
    <div className="space-y-6 p-4 border-2 border-red-500/50 bg-red-100/40 rounded-lg">
       <h3 className="font-bold text-lg text-red-800">{t('accountDeletion')}</h3>
       <p className="text-red-700">{t('accountDeletionWarning')}</p>
       <div>
        <label htmlFor="delete-password-input" className="block text-sm font-bold text-red-800 mb-1">{t('confirmPasswordPrompt')}</label>
        <input 
          id="delete-password-input"
          type="password"
          value={confirmDeletePassword}
          onChange={e => setConfirmDeletePassword(e.target.value)}
          className="w-full p-2 border-2 border-red-400/50 rounded-lg focus:ring-2 focus:ring-red-600 bg-white"
        />
      </div>
      <div className="flex items-start">
        <input 
          id="confirm-delete" 
          type="checkbox"
          checked={confirmDeleteChecked}
          onChange={e => setConfirmDeleteChecked(e.target.checked)}
          className="h-5 w-5 mt-0.5 rounded border-gray-400 text-red-600 focus:ring-red-600"
        />
        <label htmlFor="confirm-delete" className="ml-3 text-sm text-red-800">{t('confirmDeletionCheckbox')}</label>
      </div>
      <button 
        disabled={!confirmDeletePassword || !confirmDeleteChecked}
        className="w-full bg-red-600 text-white font-bold py-2.5 rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
      >
        {t('confirmDeletion')}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="profile-settings-title">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true"></div>
      {/* FIX: Replaced inline style with Tailwind classes to resolve TypeScript error. */}
      <div ref={modalRef} className="relative bg-[#FBF5E9] bg-opacity-95 backdrop-blur w-full max-w-lg rounded-2xl shadow-2xl border-2 border-[#D4AF37]/50">
        <div className="p-6 border-b-2 border-dashed border-[#D4AF37]/50">
          <h2 id="profile-settings-title" className="text-2xl font-bold text-[#4A2C2A] flex items-center gap-3">
            <svg className="w-8 h-8 text-[#8C5A2A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            {t('profileSettings')}
          </h2>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#D4AF37]/20 transition-colors" aria-label={t('close')}>
            <CloseIcon className="w-6 h-6 text-[#4A2C2A]" />
          </button>
        </div>

        <div className="flex border-b-2 border-dashed border-[#D4AF37]/50 px-2">
          <button onClick={() => setActiveTab('personal')} className={`flex-1 py-3 font-bold text-base transition-colors ${activeTab === 'personal' ? 'text-[#4A2C2A] border-b-4 border-[#8C5A2A]' : 'text-[#4A2C2A]/60 hover:text-[#4A2C2A]'}`}>{t('personalInformation')}</button>
          <button onClick={() => setActiveTab('security')} className={`flex-1 py-3 font-bold text-base transition-colors ${activeTab === 'security' ? 'text-[#4A2C2A] border-b-4 border-[#8C5A2A]' : 'text-[#4A2C2A]/60 hover:text-[#4A2C2A]'}`}>{t('security')}</button>
          <button onClick={() => setActiveTab('danger')} className={`flex-1 py-3 font-bold text-base transition-colors ${activeTab === 'danger' ? 'text-red-600 border-b-4 border-red-600' : 'text-red-600/60 hover:text-red-600'}`}>{t('dangerZone')}</button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'personal' && renderPersonalInformation()}
          {activeTab === 'security' && renderSecurity()}
          {activeTab === 'danger' && renderDangerZone()}
        </div>

        <div className="p-4 bg-[#EAE0C8]/40 border-t-2 border-dashed border-[#D4AF37]/50 flex justify-between items-center">
            <button onClick={onLogout} className="py-2 px-4 rounded-lg bg-yellow-100 text-yellow-800 border border-yellow-500/50 font-bold hover:bg-yellow-200 transition-colors">{t('logout')}</button>
            <button onClick={onClose} className="py-2 px-4 font-semibold text-[#4A2C2A]/80 hover:underline">{t('cancel')}</button>
        </div>
      </div>
    </div>
  );
};
export default ProfileSettingsModal;
