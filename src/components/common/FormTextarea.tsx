import React from 'react';
import { FormField } from './FormField';

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  charCount?: number;
  maxChars?: number;
  badge?: React.ReactNode;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  helperText,
  error,
  required,
  charCount,
  maxChars,
  badge,
  id,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/[^\w]/g, '-')}` : undefined);

  const charCounterBadge = maxChars !== undefined && charCount !== undefined ? (
    <span
      style={{
        fontSize: '0.8rem',
        fontWeight: 600,
        color: charCount > maxChars ? '#DC2626' : charCount < 50 ? '#D97706' : '#16A34A',
        background: charCount > maxChars ? '#FEE2E2' : charCount < 50 ? '#FEF3C7' : '#DCFCE7',
        padding: '2px 8px',
        borderRadius: '8px',
      }}
    >
      {charCount} / {maxChars}
    </span>
  ) : null;

  return (
    <FormField
      label={label}
      required={required}
      helperText={helperText}
      error={error}
      htmlFor={textareaId}
      badge={badge || charCounterBadge}
    >
      <textarea
        id={textareaId}
        disabled={disabled}
        style={{
          width: '100%',
          minHeight: '130px',
          padding: '14px 16px',
          fontSize: '0.95rem',
          fontWeight: 500,
          fontFamily: 'inherit',
          lineHeight: '1.6',
          color: 'var(--color-dark, #242124)',
          backgroundColor: disabled ? '#F3ECE2' : '#FFFFFF',
          border: error ? '1.5px solid #DC2626' : '1.5px solid var(--color-border, #E8DFC8)',
          borderRadius: '12px',
          outline: 'none',
          resize: 'vertical',
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
      />
    </FormField>
  );
};
