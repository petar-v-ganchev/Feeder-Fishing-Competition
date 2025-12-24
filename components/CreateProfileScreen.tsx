import React, { useState } from 'react';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { MOCK_COUNTRIES } from '../constants';
import { completeRegistration } from '../services/userService';
import type { User } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface CreateProfileScreenProps {
  firebaseUser: FirebaseAuthUser;
  onProfileCreated: (newUser: User) => void;
}

export const CreateProfileScreen: React.FC<CreateProfileScreenProps> = ({ firebaseUser, onProfileCreated }) => {
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState(MOCK_COUNTRIES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (!displayName.trim() || !country) {
        throw new Error(t('error.fill_all'));
      }
      const newUser = await completeRegistration({
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: displayName.trim(),
        country,
      });
      onProfileCreated(newUser);
    } catch (err: any) {
      if (err.message.includes("display name is already taken")) {
        setError(t('error.display_name_taken'));
      } else if (err.message.includes("between 3 and 15 characters")) {
        setError(t('error.display_name_length'));
      } else if (err.message === t('error.fill_all')) {
        setError(t('error.fill_all'));
      } else {
        setError(t('error.generic'));
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">{t('create.title')}</h1>
        <p className="text-center text-gray-400 mb-6">{t('create.subtitle')}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="displayName">{t('edit.display_name')}</label>
            <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="YourFisherName"
                minLength={3}
                maxLength={15}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="country">{t('edit.country')}</label>
            <select id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {MOCK_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <div className="pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('login.status.saving') : t('create.btn')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
