import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full ${maxWidthStyles[maxWidth]} transform rounded-2xl bg-white p-6 shadow-2xl transition-all border border-brand-border`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header if title passed directly */}
          {title && (
            <div className="flex items-start justify-between pb-4 border-b border-brand-border mb-4">
              <div>
                <h3 className="text-lg font-semibold text-brand-navy">{title}</h3>
                {description && <p className="text-sm text-brand-muted mt-1">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-brand-text p-1.5 rounded-lg hover:bg-slate-100 transition duration-150"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Body */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export const DialogHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`pb-4 border-b border-brand-border mb-4 ${className}`}>{children}</div>;

export const DialogTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <h3 className={`text-lg font-semibold text-brand-navy ${className}`}>{children}</h3>;

export const DialogContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`space-y-4 ${className}`}>{children}</div>;

export const DialogFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`mt-6 pt-4 border-t border-brand-border flex items-center justify-end gap-3 ${className}`}>{children}</div>;
