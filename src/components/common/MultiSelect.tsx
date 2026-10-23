import React from 'react';
import { FormField } from './FormField';

export interface MultiSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  maxHeight?: string;
  singleSelectAllValue?: string; // e.g. 'any'
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selectedValues = [],
  onChange,
  helperText,
  error,
  required,
  disabled = false,
  maxHeight,
  singleSelectAllValue,
}) => {
  const toggleOption = (val: string) => {
    if (singleSelectAllValue && val === singleSelectAllValue) {
      onChange([singleSelectAllValue]);
      return;
    }

    let next = selectedValues.filter((v) => v !== singleSelectAllValue);

    if (next.includes(val)) {
      next = next.filter((v) => v !== val);
      if (next.length === 0 && singleSelectAllValue) {
        next = [singleSelectAllValue];
      }
    } else {
      next = [...next, val];
    }
    onChange(next);
  };

  return (
    <FormField label={label} required={required} helperText={helperText} error={error}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '12px',
          background: 'var(--color-bg, #FAF7F2)',
          borderRadius: '12px',
          border: '1.5px solid var(--color-border, #E8DFC8)',
          maxHeight: maxHeight || 'none',
          overflowY: maxHeight ? 'auto' : 'visible',
          width: '100%',
        }}
      >
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <button
              type="button"
              key={option.value}
              disabled={disabled}
              onClick={() => toggleOption(option.value)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: isSelected ? 700 : 500,
                fontFamily: 'inherit',
                border: isSelected
                  ? '1.5px solid var(--color-primary, #7A1F3D)'
                  : '1.5px solid var(--color-border, #E8DFC8)',
                background: isSelected ? 'var(--color-primary, #7A1F3D)' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : 'var(--color-dark, #242124)',
                boxShadow: isSelected
                  ? '0 2px 8px rgba(122, 31, 61, 0.2)'
                  : '0 1px 2px rgba(36, 33, 36, 0.02)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected && !disabled) {
                  e.currentTarget.style.borderColor = 'var(--color-secondary, #C59A45)';
                  e.currentTarget.style.background = 'var(--color-primary-light, #FAF0F3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected && !disabled) {
                  e.currentTarget.style.borderColor = 'var(--color-border, #E8DFC8)';
                  e.currentTarget.style.background = '#FFFFFF';
                }
              }}
            >
              {isSelected ? (
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: '1.5px solid var(--color-border, #E8DFC8)',
                    display: 'inline-block',
                  }}
                />
              )}
              {option.label}
            </button>
          );
        })}
      </div>
    </FormField>
  );
};
