import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'elevated' | 'tonal' | 'outlined';
}

export const Card: React.FC<CardProps> = ({ children, className, variant = 'outlined' }) => {
  const baseClasses = 'p-4 rounded-medium flex flex-col transition-all';
  const variantClasses = {
    elevated: 'bg-white shadow-md border border-outline',
    tonal: 'bg-slate-50 border border-slate-100',
    outlined: 'bg-white border border-outline',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};