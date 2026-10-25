import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-brand-navy mb-1.5">
            {label}
            {props.required && <span className="text-brand-error ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-brand-text placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition duration-150 ${
            error ? 'border-brand-error focus:ring-brand-error' : 'border-brand-border'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-brand-error">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-brand-muted">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
