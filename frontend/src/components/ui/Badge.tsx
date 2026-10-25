import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'teal' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
  };

  const variantStyles = {
    primary: 'bg-brand-navy/10 text-brand-navy border border-brand-navy/20',
    teal: 'bg-brand-teal/10 text-brand-teal border border-brand-teal/20',
    success: 'bg-emerald-50 text-brand-success border border-emerald-200',
    warning: 'bg-amber-50 text-brand-warning border border-amber-200',
    error: 'bg-rose-50 text-brand-error border border-rose-200',
    info: 'bg-sky-50 text-brand-info border border-sky-200',
    neutral: 'bg-slate-100 text-brand-muted border border-slate-200',
    default: 'bg-slate-100 text-brand-muted border border-slate-200',
  };

  return (
    <span className={`inline-flex items-center rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
