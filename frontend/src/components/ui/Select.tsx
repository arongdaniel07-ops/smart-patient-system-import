import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string | number; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, children, className = '', id, ...props }, ref) => {
    const selectId = id || props.name || Math.random().toString(36).substring(2, 9);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-brand-navy mb-1.5">
            {label}
            {props.required && <span className="text-brand-error ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition duration-150 ${
            error ? 'border-brand-error focus:ring-brand-error' : 'border-brand-border'
          } ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="mt-1 text-xs text-brand-error">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
