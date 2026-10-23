import React from 'react';
import { FormField } from './FormField';

export interface SegmentOption<T extends string | number | boolean> {
  value: T;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string | number | boolean> {
  label?: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  columns?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function SegmentedControl<T extends string | number | boolean>({
  label,
  options,
  value,
  onChange,
  helperText,
  error,
  required,
  disabled = false,
  columns,
  size = 'md',
}: SegmentedControlProps<T>) {
  const isLarge = size === 'lg';

  return (
    <FormField label={label} required={required} helperText={helperText} error={error}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: columns
            ? `repeat(${columns}, 1fr)`
            : `repeat(auto-fit, minmax(${isLarge ? '140px' : '110px'}, 1fr))`,
          gap: '10px',
          width: '100%',
        }}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              type="button"
              key={String(option.value)}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              style={{
                minHeight: isLarge ? '56px' : '48px',
                padding: isLarge ? '12px 14px' : '10px 12px',
                borderRadius: '12px',
                fontSize: isLarge ? '0.95rem' : '0.88rem',
                fontWeight: isSelected ? 700 : 600,
                fontFamily: 'inherit',
                display: 'flex',
                flexDirection: isLarge ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: isSelected
                  ? '2px solid var(--color-primary, #7A1F3D)'
                  : '1.5px solid var(--color-border, #E8DFC8)',
                background: isSelected ? 'var(--color-primary, #7A1F3D)' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : 'var(--color-dark, #242124)',
                boxShadow: isSelected
                  ? '0 4px 12px rgba(122, 31, 61, 0.22)'
                  : '0 1px 3px rgba(36, 33, 36, 0.03)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.18s ease',
                textAlign: 'center',
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
              {option.icon && (
                <span style={{ fontSize: isLarge ? '1.2rem' : '1rem', display: 'flex', alignItems: 'center' }}>
                  {option.icon}
                </span>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                <span>{option.label}</span>
                {option.sublabel && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      opacity: isSelected ? 0.9 : 0.65,
                      marginTop: '2px',
                      fontWeight: 400,
                    }}
                  >
                    {option.sublabel}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </FormField>
  );
}
