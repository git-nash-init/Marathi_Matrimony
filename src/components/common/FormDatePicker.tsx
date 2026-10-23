import React from 'react';
import { FormField } from './FormField';
import { Calendar } from 'lucide-react';

export interface FormDatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  badge?: React.ReactNode;
}

export const FormDatePicker: React.FC<FormDatePickerProps> = ({
  label,
  helperText,
  error,
  required,
  badge,
  id,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const datePickerId = id || (label ? `datepicker-${label.toLowerCase().replace(/[^\w]/g, '-')}` : undefined);

  return (
    <FormField
      label={label}
      required={required}
      helperText={helperText}
      error={error}
      htmlFor={datePickerId}
      badge={badge}
    >
      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        <input
          id={datePickerId}
          type="date"
          disabled={disabled}
          style={{
            width: '100%',
            minHeight: '50px',
            height: '50px',
            padding: '12px 42px 12px 16px',
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
            cursor: disabled ? 'not-allowed' : 'pointer',
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
        <div
          style={{
            position: 'absolute',
            right: '14px',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
            color: 'var(--color-primary, #7A1F3D)',
            zIndex: 1,
          }}
        >
          <Calendar size={18} />
        </div>
      </div>
    </FormField>
  );
};
