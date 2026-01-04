
import React from 'react';
import { HapticService } from '../../services/hapticService';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, rightAction }) => {
  const handleBackClick = () => {
    HapticService.light();
    if (onBack) onBack();
  };

  return (
    <header className="native-header w-full flex-shrink-0 border-b border-outline">
      <div className="h-14 px-4 flex items-center relative">
        {/* Left Action Area */}
        <div className="z-20 flex items-center min-w-[40px]">
          {onBack && (
            <button
              onClick={handleBackClick}
              className="p-2 -ml-2 text-primary active:opacity-40 transition-all"
              aria-label="Go back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Centered Title Area */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-12">
          <h1 className="text-lg font-extrabold text-primary truncate tracking-tight animate-reveal pointer-events-auto">
            {title}
          </h1>
        </div>
        
        {/* Right Action Area */}
        <div className="z-20 ml-auto min-w-[40px] flex justify-end">
          {rightAction}
        </div>
      </div>
    </header>
  );
};
