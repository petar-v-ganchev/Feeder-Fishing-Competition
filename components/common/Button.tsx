import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = 'w-full h-12 flex items-center justify-center text-sm font-bold rounded-medium transition-all active:translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none px-4';
  
  const variantClasses = {
    primary: 'bg-primary text-white shadow-sm hover:opacity-90',
    secondary: 'bg-white text-primary border border-outline hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-primary hover:bg-slate-100',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};