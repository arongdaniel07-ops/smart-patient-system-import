import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'teal' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'navy';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-brand-navy hover:bg-brand-navy-light text-white focus:ring-brand-navy',
    navy: 'bg-brand-navy hover:bg-brand-navy-light text-white focus:ring-brand-navy',
    teal: 'bg-brand-teal hover:bg-brand-teal-hover text-white focus:ring-brand-teal',
    secondary: 'bg-brand-panel hover:bg-slate-200 text-brand-navy focus:ring-brand-panel border border-brand-border',
    danger: 'bg-brand-error hover:bg-red-700 text-white focus:ring-brand-error',
    outline: 'border border-brand-border bg-white hover:bg-brand-bg text-brand-text focus:ring-brand-teal',
    ghost: 'bg-transparent hover:bg-slate-100 text-brand-text shadow-none focus:ring-brand-teal',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};
