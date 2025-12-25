import React, { useState, useEffect } from 'react';
import { Button } from './common/Button';
import { Header } from './common/Header';
import { loginUser } from '../services/userService';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useTranslation } from '../i18n/LanguageContext';
import { languages, LanguageCode } from '../i18n/translations';

export const LoginScreen: React.FC = () => {
  const { t, locale, setLocale } = useTranslation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState(() => localStorage.getItem('lastLoginEmail') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) setError(null);
  }, [email, password, isRegistering]);

  const validate = () => {
    if (!email.trim() || !password.trim()) {
      setError(t('error.fill_all'));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('error.invalid_email'));
      return false;
    }
    if (password.length < 6) {
      setError(t('error.password_length'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setError(null);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        localStorage.setItem('lastLoginEmail', email);
      } else {
        await loginUser({ email, password, rememberMe });
        localStorage.setItem('lastLoginEmail', email);
      }
    } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setError(t('error.invalid_login'));
        } else if (err.code === 'auth/email-already-in-use') {
          setError(t('error.email_in_use'));
        } else {
          setError(t('error.generic'));
        }
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title={t('login.title')} />
      
      <div className="px-6 flex flex-col flex-grow justify-center pb-12">
        <div className="absolute top-4 right-4 z-10">
          <select 
            value={locale} 
            onChange={(e) => setLocale(e.target.value as LanguageCode)}
            className="bg-slate-50 text-onSurfaceVariant border border-outline text-[10px] font-bold p-1 rounded-small outline-none"
          >
            {languages.map(l => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
        </div>

        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-onSurfaceVariant">
            {t('login.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
          <div className="space-y-4">
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-onSurfaceVariant ml-1">{t('login.label.email')}</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-slate-50 border ${error && !email ? 'border-red-500' : 'border-outline'} p-3 rounded-small text-sm outline-none focus:border-primary transition-all`}
                    placeholder={t('login.placeholder.email')}
                />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-onSurfaceVariant ml-1">{t('login.label.password')}</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full bg-slate-50 border ${error && !password ? 'border-red-500' : 'border-outline'} p-3 rounded-small text-sm outline-none focus:border-primary transition-all`}
                    placeholder={t('login.placeholder.password')}
                />
            </div>
          </div>

          {!isRegistering && (
            <div className="flex items-center gap-2 px-1">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-outline text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-[10px] font-bold text-onSurfaceVariant cursor-pointer">
                {t('login.remember')}
              </label>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-medium text-xs font-bold flex items-center text-left animate-in fade-in slide-in-from-top-1">
              <span className="leading-none py-1">{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('login.status.processing') : (isRegistering ? t('login.btn.register') : t('login.btn.login'))}
            </Button>

            <Button
                type="button"
                variant="secondary"
                onClick={() => setIsRegistering(!isRegistering)}
                className="h-10 text-xs"
            >
                {isRegistering ? t('login.tab.login') : t('login.tab.register')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};