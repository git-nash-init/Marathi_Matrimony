import React from 'react';
import { FormField } from './FormField';

export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  badge?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  helperText,
  error,
  required,
  prefix,
  suffix,
  badge,
  id,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/[^\w]/g, '-')}` : undefined);

  return (
    <FormField
      label={label}
      required={required}
      helperText={helperText}
      error={error}
      htmlFor={inputId}
      badge={badge}
    >
      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <div
            style={{
              position: 'absolute',
              left: '14px',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              color: 'var(--color-text-muted, #8E8480)',
              zIndex: 1,
            }}
          >
            {prefix}
          </div>
        )}

        <input
          id={inputId}
          disabled={disabled}
          style={{
            width: '100%',
            minHeight: '50px',
            height: '50px',
            padding: prefix ? '12px 14px 12px 46px' : suffix ? '12px 46px 12px 16px' : '12px 16px',
            fontSize: '0.95rem',
            fontWeight: 500,
            fontFamily: 'inherit',
            color: 'var(--color-dark, #242124)',
            backgroundColor: disabled ? '#F3ECE2' : '#FFFFFF',
            border: error ? '1.5px solid #DC2626' : '1.5px solid var(--color-border, #E8DFC8)',
            borderRadius: '12px',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            boxShadow: '0 1px 3px rgba(36, 33, 36, 0.03)',
            cursor: disabled ? 'not-allowed' : 'text',
            ...style,
          }}
          onFocus={(e) => {
            if (!disabled && !error) {
              e.currentTarget.style.borderColor = 'var(--color-primary, #7A1F3D)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(122, 31, 61, 0.12)';
            }
          }}
          onBlur={(e) => {
            if (!disabled && !error) {
              e.currentTarget.style.borderColor = 'var(--color-border, #E8DFC8)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(36, 33, 36, 0.03)';
            }
          }}
          className={className}
          {...props}
        />

        {suffix && (
          <div
            style={{
              position: 'absolute',
              right: '14px',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              color: 'var(--color-text-muted, #8E8480)',
              zIndex: 1,
            }}
          >
            {suffix}
          </div>
        )}
      </div>
    </FormField>
  );
};
