import React from 'react';

interface HeaderProps {
  title: string;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack }) => {
  return (
    <header className="relative flex items-center justify-center h-16 w-full px-6 mb-4 flex-shrink-0 border-b border-outline">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute left-4 p-2 text-primary hover:text-secondary transition-colors"
          aria-label="Go back"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <h1 className="text-xl font-bold text-center text-primary px-12 truncate tracking-tight">{title}</h1>
    </header>
  );
};