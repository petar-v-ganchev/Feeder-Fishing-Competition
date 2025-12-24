import React, { useState, useRef } from 'react';
import type { User } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Header } from './common/Header';
import { MOCK_COUNTRIES } from '../constants';
import { ConfirmationModal } from './common/ConfirmationModal';
import { resetPassword } from '../services/userService';
import { useTranslation } from '../i18n/LanguageContext';

interface EditProfileScreenProps {
  user: User;
  onBack: () => void;
  onSave: (updatedData: { displayName: string; email: string; avatar: string; country: string }) => Promise<{ emailChanged: boolean }>;
  onDeleteAccount: () => void;
}

const InputField: React.FC<{label: string, id: string, type: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string, maxLength?: number, disabled?: boolean}> = 
({ label, id, type, value, onChange, placeholder, maxLength, disabled }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor={id}>{label}</label>
        <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
        />
    </div>
);

const SelectField: React.FC<{label: string, id: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode}> = 
({ label, id, value, onChange, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor={id}>{label}</label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            {children}
        </select>
    </div>
);

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ user, onBack, onSave, onDeleteAccount }) => {
    const { t } = useTranslation();
    const [displayName, setDisplayName] = useState(user.displayName);
    const [email, setEmail] = useState(user.email);
    const [avatar, setAvatar] = useState(user.avatar);
    const [country, setCountry] = useState(user.country);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
    const [isResetSuccessModalOpen, setIsResetSuccessModalOpen] = useState(false);
    const [isEmailInfoModalOpen, setIsEmailInfoModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [displayNameError, setDisplayNameError] = useState<string | null>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.size < 1048576) { // 1MB limit
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else if (file) {
            alert(t('error.image_size'));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setDisplayNameError(null);

        // Manual validation for localized error messages
        if (!displayName.trim() || !email.trim()) {
            setError(t('error.fill_all'));
            return;
        }

        setIsLoading(true);
        try {
            const { emailChanged } = await onSave({ displayName: displayName.trim(), email: email.trim(), avatar, country });
            if (emailChanged) {
                setIsEmailInfoModalOpen(true);
            } else {
                alert(t('success.profile_updated'));
                onBack(); 
            }
        } catch (err: any) {
            const errorMessage = err?.message || err;
            if (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('display name is already taken')) {
                setDisplayNameError(t('error.display_name_taken'));
            } else if (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('between 3 and 15 characters')) {
                setDisplayNameError(t('error.display_name_length'));
            } else {
                setError(typeof errorMessage === 'string' ? errorMessage : t('error.generic'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteConfirm = () => {
        onDeleteAccount();
        setIsDeleteConfirmOpen(false);
    };
    
    const handlePasswordResetConfirm = async () => {
        setIsResetConfirmOpen(false);
        try {
            await resetPassword(user.email);
            setIsResetSuccessModalOpen(true);
        } catch (error: any) {
            console.error("Password reset failed:", error);
            setError(t('error.pwd_reset_fail'));
        }
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <Header title={t('edit.title')} onBack={onBack} />
            
            <Card>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            {avatar.startsWith('data:image/') ? (
                                <img src={avatar} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover border-2 border-gray-600" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center font-bold text-4xl">
                                    {avatar}
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/png, image/jpeg"
                            />
                            <button
                                type="button"
                                onClick={handleAvatarClick}
                                className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-transform transform active:scale-90"
                                aria-label="Change Avatar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div>
                        <InputField 
                            label={t('edit.display_name')}
                            id="displayName"
                            type="text"
                            value={displayName}
                            onChange={(e) => {
                                setDisplayName(e.target.value);
                                setDisplayNameError(null);
                            }}
                            placeholder="YourFisherName"
                        />
                        {displayNameError && <p className="text-red-400 text-sm mt-1">{displayNameError}</p>}
                    </div>

                    <SelectField
                        label={t('edit.country')}
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    >
                        {MOCK_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </SelectField>
                    <div>
                        <InputField 
                            label={t('edit.email')}
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>
                    
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <div className="pt-4 space-y-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsResetConfirmOpen(true)}
                        >
                            {t('edit.reset_pwd')}
                        </Button>
                        <Button type="submit" disabled={isLoading}>{isLoading ? t('login.status.saving') : t('edit.save')}</Button>
                    </div>
                </form>
            </Card>

            <div className="mt-8 text-center">
                <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="text-red-500 hover:text-red-400 text-sm font-medium"
                >
                    {t('edit.delete')}
                </button>
            </div>

            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                title={t('edit.confirm.delete_title')}
                message={t('edit.confirm.delete_msg')}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setIsDeleteConfirmOpen(false)}
                confirmText={t('edit.delete')}
                cancelText={t('nav.back')}
                confirmVariant="danger"
            />
            
            <ConfirmationModal
                isOpen={isResetConfirmOpen}
                title={t('edit.confirm.reset_title')}
                message={t('edit.confirm.reset_msg')}
                onConfirm={handlePasswordResetConfirm}
                onCancel={() => setIsResetConfirmOpen(false)}
                confirmText={t('edit.reset_pwd')}
                cancelText={t('nav.back')}
                confirmVariant="primary"
            />

            <ConfirmationModal
                isOpen={isResetSuccessModalOpen}
                title={t('edit.confirm.email_sent_title')}
                message={t('edit.confirm.email_sent_msg')}
                onConfirm={() => setIsResetSuccessModalOpen(false)}
                confirmText="OK"
                confirmVariant="primary"
            />

            <ConfirmationModal
                isOpen={isEmailInfoModalOpen}
                title={t('edit.confirm.verify_email_title')}
                message={t('edit.confirm.verify_email_msg')}
                onConfirm={() => {
                    setIsEmailInfoModalOpen(false);
                    onBack();
                }}
                confirmText="OK"
                confirmVariant="primary"
            />
        </div>
    );
};
