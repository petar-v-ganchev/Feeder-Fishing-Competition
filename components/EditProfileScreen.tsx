
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

const InputField: React.FC<{label: string, id: string, type: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string, maxLength?: number}> = 
({ label, id, type, value, onChange, placeholder, maxLength }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor={id}>{label}</label>
        <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder}
            maxLength={maxLength}
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
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
        // Password change is mocked and not saved.
        // In a real app, you'd handle password update logic here.
        onSave({ displayName, email, avatar, country });
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
                        label="Email"
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
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
                        label="New Password (optional)"
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                    <InputField 
                        label="Confirm New Password"
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                    />

                    <div className="pt-4">
                        <Button type="submit">Save Changes</Button>
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