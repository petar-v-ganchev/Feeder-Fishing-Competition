import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { MOCK_COUNTRIES } from '../constants';
import { ConfirmationModal } from './common/ConfirmationModal';
import { useTranslation } from '../i18n/LanguageContext';
import { languages, LanguageCode } from '../i18n/translations';

interface EditProfileScreenProps {
  user: User;
  onBack: () => void;
  onSave: (updatedData: { displayName: string; email: string; avatar: string; country: string; language: string }) => Promise<{ emailChanged: boolean }>;
  onDeleteAccount: () => void;
}

const InputField: React.FC<{label: string, id: string, type: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string, maxLength?: number, disabled?: boolean, hasError?: boolean}> = 
({ label, id, type, value, onChange, placeholder, maxLength, disabled, hasError }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-onSurfaceVariant ml-1" htmlFor={id}>{label}</label>
        <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            className={`w-full p-3 bg-slate-50 border ${hasError ? 'border-red-500' : 'border-outline'} rounded-small text-sm outline-none focus:border-primary transition-all disabled:opacity-50`}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
        />
    </div>
);

const SelectField: React.FC<{label: string, id: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode}> = 
({ label, id, value, onChange, children }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-onSurfaceVariant ml-1" htmlFor={id}>{label}</label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            className="w-full p-3 bg-slate-50 border border-outline rounded-small text-sm outline-none focus:border-primary transition-all"
        >
            {children}
        </select>
    </div>
);

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ user, onBack, onSave, onDeleteAccount }) => {
    const { t, locale, setLocale } = useTranslation();
    const [displayName, setDisplayName] = useState(user.displayName);
    const [email, setEmail] = useState(user.email);
    const [avatar, setAvatar] = useState(user.avatar);
    const [country, setCountry] = useState(user.country);
    const [selectedLanguage, setSelectedLanguage] = useState(user.language || locale);
    
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (error) setError(null);
    }, [displayName, country, selectedLanguage]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        const trimmedName = displayName.trim();
        if (!trimmedName) {
            setError(t('error.fill_all'));
            return;
        }
        if (trimmedName.length < 3) {
            setError(t('error.display_name_length'));
            return;
        }

        setIsLoading(true);
        try {
            await onSave({ 
                displayName: trimmedName, 
                email: email.trim(), 
                avatar, 
                country,
                language: selectedLanguage
            });
            setLocale(selectedLanguage as LanguageCode);
            onBack(); 
        } catch (err: any) {
            console.error(err);
            if (err.message.includes("already taken")) {
                setError(t('error.display_name_taken'));
            } else {
                setError(t('error.generic'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-6 gap-6 overflow-y-auto bg-white">
            <header className="relative flex items-center justify-center border-b border-outline pb-4">
                <button 
                  onClick={onBack} 
                  className="absolute left-0 p-1 text-primary hover:text-secondary transition-colors"
                  aria-label="Go back"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-primary">{t('edit.title')}</h1>
            </header>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <InputField 
                    label={t('edit.display_name')}
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    hasError={!!error && !displayName.trim()}
                />

                <SelectField
                    label={t('edit.country')}
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                >
                    {MOCK_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </SelectField>

                <SelectField
                    label={t('common.language')}
                    id="language"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                    {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                </SelectField>

                <InputField 
                    label={t('edit.email')}
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                />
                
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-medium text-xs font-bold flex items-center text-left">
                        <span className="leading-none py-1">{error}</span>
                    </div>
                )}

                <div className="flex flex-col gap-2 pt-4">
                    <Button type="submit" disabled={isLoading}>{isLoading ? '...' : t('edit.save')}</Button>
                </div>
            </form>

            <div className="mt-auto text-center pb-4">
                <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="text-xs font-bold text-red-500 opacity-60 hover:opacity-100 transition-opacity no-underline"
                >
                    {t('edit.delete')}
                </button>
            </div>

            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                title={t('edit.confirm.delete_title')}
                message={t('edit.confirm.delete_msg')}
                onConfirm={onDeleteAccount}
                onCancel={() => setIsDeleteConfirmOpen(false)}
                confirmText={t('edit.delete')}
                cancelText={t('nav.back')}
                confirmVariant="danger"
            />
        </div>
    );
};