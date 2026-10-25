import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverEffect = false }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-brand-border shadow-sm p-6 ${
        hoverEffect ? 'hover:shadow-md hover:border-brand-teal/40 transition-all duration-200 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}> = ({ title, subtitle, action, className = '', children }) => {
  if (children) {
    return <div className={`mb-4 ${className}`}>{children}</div>;
  }

  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div>
        {title && <h3 className="text-lg font-semibold text-brand-navy leading-tight">{title}</h3>}
        {subtitle && <p className="text-sm text-brand-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <h3 className={`text-lg font-semibold text-brand-navy leading-tight ${className}`}>{children}</h3>;

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`space-y-4 ${className}`}>{children}</div>;

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`mt-6 pt-4 border-t border-brand-border flex items-center justify-end gap-3 ${className}`}>{children}</div>;
