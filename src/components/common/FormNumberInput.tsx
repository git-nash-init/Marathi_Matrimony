import React from 'react';
import { FormField } from './FormField';

export interface FormNumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  badge?: React.ReactNode;
}

export const FormNumberInput: React.FC<FormNumberInputProps> = ({
  label,
  helperText,
  error,
  required,
  min,
  max,
  step = 1,
  suffix,
  badge,
  id,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const numberId = id || (label ? `number-${label.toLowerCase().replace(/[^\w]/g, '-')}` : undefined);

  return (
    <FormField
      label={label}
      required={required}
      helperText={helperText}
      error={error}
      htmlFor={numberId}
      badge={badge}
    >
      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        <input
          id={numberId}
          type="number"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          style={{
            width: '100%',
            minHeight: '50px',
            height: '50px',
            padding: suffix ? '12px 50px 12px 16px' : '12px 16px',
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
              fontSize: '0.85rem',
              fontWeight: 600,
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
