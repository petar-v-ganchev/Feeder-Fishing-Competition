import React, { useState, useEffect } from 'react';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { loginUser } from '../services/userService';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

export const LoginScreen: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    // Check for registration errors passed from the main App component
    const registrationError = sessionStorage.getItem('registrationError');
    if (registrationError) {
      setError(registrationError);
      setIsRegistering(true); // Switch to register tab to show the error contextually
      sessionStorage.removeItem('registrationError');
    }
    
    // Check for a remembered email from a previous session
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        if (!email || !password) {
          throw new Error('Please fill in all fields.');
        }
        // Step 1 of registration: Create the auth user.
        // The onAuthStateChanged listener in App.tsx will detect this
        // and navigate the user to the CreateProfileScreen.
        await createUserWithEmailAndPassword(auth, email, password);

      } else {
        if (!email || !password) {
          throw new Error('Please enter your email and password.');
        }
        await loginUser({ email, password, rememberMe });
        // onAuthStateChanged in App.tsx will handle the rest
      }
    } catch (err: any) {
        const errorCode = err.code;
        const errorMessage = (err.message || '').toLowerCase();

        if (errorCode === 'auth/email-already-in-use' || errorMessage.includes('email-already-in-use')) {
          setError('An account with this email already exists. Please login instead.');
        } else if (
            errorCode === 'auth/invalid-credential' || 
            errorCode === 'auth/wrong-password' ||
            errorCode === 'auth/invalid-login-credentials' ||
            errorMessage.includes('invalid-credential') ||
            errorMessage.includes('invalid login credentials')
        ) {
          setError('Invalid email or password. Please try again.');
        } else {
          console.error("Unhandled login error:", err);
          setError('An unexpected error occurred. Please check your connection and try again.');
        }
        setIsLoading(false);
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

          {!isRegistering && (
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300 cursor-pointer">
                Remember me
              </label>
            </div>
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
