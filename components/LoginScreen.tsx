
import React, { useState } from 'react';
import { Button } from './common/Button';
import { Card } from './common/Card';
import type { User } from '../types';
import { MOCK_COUNTRIES, MOCK_INVENTORY_ITEMS } from '../constants';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState(MOCK_COUNTRIES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering && !displayName) {
      alert('Please enter a display name.');
      return;
    }
    const finalDisplayName = isRegistering ? displayName : 'AnglerPro';
    // Mock login/registration
    const mockUser: User = {
      id: 'user123',
      displayName: finalDisplayName,
      email,
      avatar: finalDisplayName.charAt(0).toUpperCase(),
      country: isRegistering ? country : 'United Kingdom',
      euros: 1000,
      inventory: MOCK_INVENTORY_ITEMS,
      stats: {
        matchesPlayed: 15,
        wins: 8,
        globalRank: 123,
        countryRank: 45,
      },
    };
    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-blue-400">Feeder Fishing</h1>
        <h2 className="text-xl font-bold text-center mb-6">Competition</h2>
        
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setIsRegistering(false)}
            className={`flex-1 py-2 text-center font-semibold transition-colors ${!isRegistering ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsRegistering(true)}
            className={`flex-1 py-2 text-center font-semibold transition-colors ${isRegistering ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="displayName">Display Name</label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="YourFisherName"
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="country">Country</label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MOCK_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <div className="pt-2">
            <Button type="submit">
              {isRegistering ? 'Register & Play' : 'Login'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};