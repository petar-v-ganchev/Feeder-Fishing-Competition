
import React from 'react';

interface HeaderProps {
  title: string;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack }) => {
  return (
    <header className="relative flex items-center justify-center p-4 mb-6">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute left-0 text-blue-400 hover:text-blue-300 transition-colors"
        >
          &lt; Back
        </button>
      )}
      <h1 className="text-2xl font-bold text-center">{title}</h1>
    </header>
  );
};