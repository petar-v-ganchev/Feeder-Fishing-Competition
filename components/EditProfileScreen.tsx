import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Header } from './common/Header';
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
        <div className="flex flex-col min-h-screen bg-white">
            <Header title={t('edit.title')} onBack={onBack} />
            
            <div className="px-6 flex flex-col pb-6">
                <form id="editProfileForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                </form>

                <div className="mt-6 flex flex-col gap-3">
                    <Button 
                      form="editProfileForm" 
                      type="submit" 
                      disabled={isLoading}
                    >
                        {isLoading ? '...' : t('edit.save')}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setIsDeleteConfirmOpen(true)}
                        className="!text-secondary"
                    >
                        {t('edit.delete')}
                    </Button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                title={t('edit.confirm.delete_title')}
                message={t('edit.confirm.delete_msg')}
                onConfirm={onDeleteAccount}
                onCancel={() => setIsDeleteConfirmOpen(false)}
                confirmText={t('edit.delete')}
                cancelText={t('nav.back')}
                confirmVariant="primary"
            />
        </div>
    );
};