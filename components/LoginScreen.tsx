import React, { useState, useEffect } from 'react';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { registerUser, loginUser } from '../services/userService';
import { MOCK_COUNTRIES } from '../constants';

export const LoginScreen: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState(MOCK_COUNTRIES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for registration errors passed from the main App component
    const registrationError = sessionStorage.getItem('registrationError');
    if (registrationError) {
      setError(registrationError);
      setIsRegistering(true); // Switch to register tab to show the error contextually
      sessionStorage.removeItem('registrationError');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        if (!email || !password || !displayName || !country) {
          throw new Error('Please fill in all fields.');
        }
        if (displayName.length < 3 || displayName.length > 15) {
            throw new Error("Display name must be between 3 and 15 characters.");
        }
        
        // The new registerUser service function handles the entire flow:
        // 1. Creates Auth User
        // 2. Creates Firestore Profile (with retries)
        // 3. Cleans up Auth User if profile creation fails
        await registerUser(email, password, displayName, country);

        // On success, we wait. The onAuthStateChanged listener in App.tsx will detect
        // the new user, fetch their now-existing profile, and navigate to the main menu.
      } else {
        if (!email || !password) {
          throw new Error('Please enter your email and password.');
        }
        await loginUser({ email, password });
        // onAuthStateChanged in App.tsx will handle the rest
      }
    } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          setError('An account with this email already exists. Please login instead.');
        } else {
          const friendlyMessage = err.message
              .replace('Firebase: ', '')
              .replace(/ \(auth\/[a-z-]+\)\.?/, '');
          setError(friendlyMessage);
        }
        setIsLoading(false); // Only set loading to false on error. On success, we wait for screen change.
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-blue-400">Feeder Fishing</h1>
        <h2 className="text-xl font-bold text-center mb-6">Competition</h2>
        
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => { setIsRegistering(false); setError(null); }}
            className={`flex-1 py-2 text-center font-semibold transition-colors ${!isRegistering ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsRegistering(true); setError(null); }}
            className={`flex-1 py-2 text-center font-semibold transition-colors ${isRegistering ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email"
              required
            />
          <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password (min. 6 characters)"
              required
            />

          {isRegistering && (
            <>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Display Name (3-15 characters)"
                required
                minLength={3}
                maxLength={15}
              />
              <select id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {MOCK_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </>
          )}

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Login')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};