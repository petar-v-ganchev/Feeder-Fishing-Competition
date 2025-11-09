import React, { useState } from 'react';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { MOCK_COUNTRIES } from '../constants';
// FIX: The function 'createUserProfile' is not exported from 'userService'. It has been replaced with the correct function 'completeRegistration'.
import { completeRegistration } from '../services/userService';
import type { User } from '../types';

interface CreateProfileScreenProps {
  firebaseUser: FirebaseAuthUser;
  onProfileCreated: (newUser: User) => void;
}

export const CreateProfileScreen: React.FC<CreateProfileScreenProps> = ({ firebaseUser, onProfileCreated }) => {
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState(MOCK_COUNTRIES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (!displayName || !country) {
        throw new Error('Please complete your profile.');
      }
      // FIX: The function 'createUserProfile' does not exist. It has been replaced with 'completeRegistration' to correctly create the user profile.
      const newUser = await completeRegistration({
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName,
        country,
      });
      onProfileCreated(newUser);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Complete Your Profile</h1>
        <p className="text-center text-gray-400 mb-6">Welcome! Choose a display name to get started.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="displayName">Display Name</label>
            <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="YourFisherName"
                required
                minLength={3}
                maxLength={15}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="country">Country</label>
            <select id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {MOCK_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <div className="pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Start Fishing'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
