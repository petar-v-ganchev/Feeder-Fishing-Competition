
import React from 'react';
import { HapticService } from '../../services/hapticService';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'native';
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', onClick, ...props }) => {
  const baseClasses = 'w-full h-12 flex items-center justify-center text-[15px] font-semibold rounded-ios transition-all active:opacity-70 disabled:opacity-40 disabled:pointer-events-none px-4 select-none';
  
  const variantClasses = {
    primary: 'bg-primary text-white shadow-sm',
    secondary: 'bg-systemGray text-primary',
    danger: 'bg-red-600 text-white',
    ghost: 'bg-transparent text-primary',
    native: 'bg-systemBlue text-white shadow-md'
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    HapticService.light();
    if (onClick) onClick(e);
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} onClick={handleClick} {...props}>
      {children}
    </button>
  );
};
