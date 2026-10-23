import React from 'react';
import { FormField } from './FormField';

export interface OptionType {
  value: string | number;
  label: string;
}

export interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'prefix'> {
  label?: string;
  options?: OptionType[];
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  prefix?: React.ReactNode;
  children?: React.ReactNode;
  badge?: React.ReactNode;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  options,
  placeholder,
  helperText,
  error,
  required,
  prefix,
  badge,
  id,
  className = '',
  disabled,
  children,
  style,
  ...props
}) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/[^\w]/g, '-')}` : undefined);

  return (
    <FormField
      label={label}
      required={required}
      helperText={helperText}
      error={error}
      htmlFor={selectId}
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

        <select
          id={selectId}
          disabled={disabled}
          style={{
            width: '100%',
            minHeight: '50px',
            height: '50px',
            padding: prefix ? '12px 42px 12px 42px' : '12px 42px 12px 16px',
            fontSize: '0.95rem',
            fontWeight: 500,
            fontFamily: 'inherit',
            color: 'var(--color-dark, #242124)',
            backgroundColor: disabled ? '#F3ECE2' : '#FFFFFF',
            border: error ? '1.5px solid #DC2626' : '1.5px solid var(--color-border, #E8DFC8)',
            borderRadius: '12px',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            boxShadow: '0 1px 3px rgba(36, 33, 36, 0.03)',
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
        >
          {placeholder && (
            <option value="" disabled style={{ color: '#8E8480' }}>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        {/* Custom Chevron Indicator */}
        <div
          style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'var(--color-primary, #7A1F3D)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </FormField>
  );
};
