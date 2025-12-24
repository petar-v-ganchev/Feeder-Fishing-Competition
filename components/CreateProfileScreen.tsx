import React, { useState, useEffect } from 'react';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { MOCK_COUNTRIES } from '../constants';
import { completeRegistration } from '../services/userService';
import type { User } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { languages, LanguageCode } from '../i18n/translations';

interface CreateProfileScreenProps {
  firebaseUser: FirebaseAuthUser;
  onProfileCreated: (newUser: User) => void;
}

export const CreateProfileScreen: React.FC<CreateProfileScreenProps> = ({ firebaseUser, onProfileCreated }) => {
  const { t, locale, setLocale } = useTranslation();
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState(MOCK_COUNTRIES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) setError(null);
  }, [displayName, country]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const trimmedName = displayName.trim();
      if (!trimmedName || !country) {
        throw new Error(t('error.fill_all'));
      }
      if (trimmedName.length < 3) {
        throw new Error(t('error.display_name_length'));
      }
      
      const newUser = await completeRegistration({
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: trimmedName,
        country,
        language: locale,
      });
      onProfileCreated(newUser);
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("display name is already taken")) {
        setError(t('error.display_name_taken'));
      } else if (err.message.includes("between 3 and 15 characters")) {
        setError(t('error.display_name_length'));
      } else {
        setError(err.message || t('error.generic'));
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-8 justify-center gap-6 bg-white">
      <div className="text-center border-b border-outline pb-4">
        <h1 className="text-xl font-bold text-primary tracking-tight">{t('create.title')}</h1>
        <p className="text-[10px] font-bold text-onSurfaceVariant opacity-70 tracking-widest mt-1">{t('create.subtitle')}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold text-onSurfaceVariant ml-1">{t('edit.display_name')}</p>
            <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={`w-full bg-slate-50 border ${error && !displayName ? 'border-red-500' : 'border-outline'} p-3 rounded-small text-sm outline-none focus:border-primary transition-all`}
                placeholder={t('create.placeholder.handle')}
                maxLength={15}
            />
        </div>
        
        <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold text-onSurfaceVariant ml-1">{t('edit.country')}</p>
            <select 
                value={country} 
                onChange={(e) => setCountry(e.target.value)} 
                className="w-full bg-slate-50 border border-outline p-3 rounded-small text-sm outline-none"
            >
              {MOCK_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>

        <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold text-onSurfaceVariant ml-1">{t('common.language')}</p>
            <select 
                value={locale} 
                onChange={(e) => setLocale(e.target.value as LanguageCode)} 
                className="w-full bg-slate-50 border border-outline p-3 rounded-small text-sm outline-none"
            >
              {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-medium text-xs font-bold flex items-center text-left mt-2">
            <span className="leading-none py-1">{error}</span>
          </div>
        )}
        
        <Button type="submit" className="mt-4" disabled={isLoading}>
          {isLoading ? '...' : t('create.btn')}
        </Button>
      </form>
    </div>
  );
};