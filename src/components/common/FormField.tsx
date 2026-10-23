import React from 'react';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
  badge?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  helperText,
  error,
  className = '',
  children,
  htmlFor,
  badge,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', ...((className ? {} : {})) }}>
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
          <label
            htmlFor={htmlFor}
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--color-dark, #242124)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              letterSpacing: '0.01em',
            }}
          >
            {label}
            {required && (
              <span style={{ color: '#DC2626', fontWeight: 800, fontSize: '1rem' }} title="Required">
                *
              </span>
            )}
          </label>
          {badge && <div>{badge}</div>}
        </div>
      )}

      {children}

      {error ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px', color: '#DC2626', fontSize: '0.82rem', fontWeight: 600 }}>
          <svg style={{ width: '14px', height: '14px', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted, #6C625E)' }}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
