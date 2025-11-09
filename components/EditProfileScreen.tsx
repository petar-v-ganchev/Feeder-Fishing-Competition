import React, { useState, useRef } from 'react';
import type { User } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Header } from './common/Header';
import { MOCK_COUNTRIES } from '../constants';
import { ConfirmationModal } from './common/ConfirmationModal';

interface EditProfileScreenProps {
  user: User;
  onBack: () => void;
  onSave: (updatedData: { displayName: string; email: string; avatar: string; country: string }) => void;
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
    const [displayName, setDisplayName] = useState(user.displayName);
    const [email, setEmail] = useState(user.email);
    const [avatar, setAvatar] = useState(user.avatar);
    const [country, setCountry] = useState(user.country);
    // Password fields are for UI demonstration; Firebase requires re-authentication for password changes,
    // which is beyond the scope of this implementation.
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
            alert('Image size should not exceed 1MB.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // The uniqueness check is now handled atomically by the onSave function's backend logic.
        // Note: Email & Password changes require separate Firebase flows (updateEmail, updatePassword)
        // often involving re-authentication, so we are only saving non-sensitive data here.
        onSave({ displayName, email: user.email, avatar, country });
        
        // The parent component will set loading to false after the async operation.
        // To provide immediate feedback, we can optimistically set it here, but it's better
        // managed by the parent who knows when the async call is truly done.
        // For now, let's assume the parent will handle navigation and state changes.
        // We'll leave isLoading=true to prevent double-clicks.
    };

    const handleDeleteConfirm = () => {
        onDeleteAccount();
        setIsDeleteConfirmOpen(false);
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <Header title="Edit Profile" onBack={onBack} />
            
            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <InputField 
                        label="Display Name"
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="YourFisherName"
                    />
                    <InputField 
                        label="Email (cannot be changed here)"
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        disabled={true}
                    />
                    <SelectField
                        label="Country"
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    >
                        {MOCK_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </SelectField>
                    <InputField 
                        label="New Password (not implemented)"
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={true}
                    />
                    <InputField 
                        label="Confirm New Password (not implemented)"
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={true}
                    />

                    <div className="pt-4">
                        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                </form>
            </Card>

            <div className="mt-8 text-center">
                <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="text-red-500 hover:text-red-400 text-sm font-medium"
                >
                    Delete Profile
                </button>
            </div>

            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                title="Delete Profile"
                message="Are you sure you want to delete your profile? This action is permanent and cannot be undone."
                onConfirm={handleDeleteConfirm}
                onCancel={() => setIsDeleteConfirmOpen(false)}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="danger"
            />
        </div>
    );
};
