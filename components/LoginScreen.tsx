import React, { useState, useEffect } from 'react';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { loginUser } from '../services/userService';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useTranslation } from '../i18n/LanguageContext';
import { languages, LanguageCode } from '../i18n/translations';

export const LoginScreen: React.FC = () => {
  const { t, locale, setLocale } = useTranslation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    const registrationError = sessionStorage.getItem('registrationError');
    if (registrationError) {
      setError(registrationError);
      setIsRegistering(true);
      sessionStorage.removeItem('registrationError');
    }
    
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Controlled localized validation (prevents browser popups)
    if (!email.trim() || !password.trim()) {
      setError(t('error.fill_all'));
      return;
    }

    setIsLoading(true);

    if (!isRegistering) {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await loginUser({ email, password, rememberMe });
      }
    } catch (err: any) {
        const errorCode = err.code;
        const errorMessage = (err.message || '').toLowerCase();

        if (errorCode === 'auth/email-already-in-use' || errorMessage.includes('email-already-in-use')) {
          setError(t('error.email_in_use'));
        } else if (
            errorCode === 'auth/invalid-credential' || 
            errorCode === 'auth/wrong-password' ||
            errorCode === 'auth/invalid-login-credentials' ||
            errorMessage.includes('invalid-credential') ||
            errorMessage.includes('invalid login credentials')
        ) {
          setError(t('error.invalid_login'));
        } else {
          setError(t('error.generic'));
        }
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 relative">
      <div className="absolute top-8 left-0 right-0 flex justify-center px-4 z-20">
        <div className="relative">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as LanguageCode)}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs font-bold rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer hover:bg-gray-750 transition-colors shadow-2xl"
          >
            {languages.map(l => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-gray-700/50">
        <h1 className="text-3xl font-bold text-center mb-2 text-blue-400">{t('login.title')}</h1>
        <h2 className="text-xl font-bold text-center mb-6">{t('login.subtitle')}</h2>
        
        <div className="flex border-b border-gray-700 mb-6">
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setError(null); }}
            className={`flex-1 h-11 text-center font-bold text-sm transition-colors ${!isRegistering ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            {t('login.tab.login')}
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setError(null); }}
            className={`flex-1 h-11 text-center font-bold text-sm transition-colors ${isRegistering ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            {t('login.tab.register')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">{t('login.label.email')}</label>
            <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('login.placeholder.email')}
              />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">{t('login.label.password')}</label>
            <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('login.placeholder.password')}
              />
          </div>

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
                {t('login.remember')}
              </label>
            </div>
          )}

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('login.status.processing') : (isRegistering ? t('login.btn.register') : t('login.btn.login'))}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
