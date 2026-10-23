import React from 'react';

export interface ChoiceOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface ChoiceCardProps {
  label?: string;
  required?: boolean;
  options: ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  columns?: number;
}

export const ChoiceCard: React.FC<ChoiceCardProps> = ({
  label,
  required,
  options,
  value,
  onChange,
  error,
  helperText,
  columns = 2,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {label && (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.92rem',
            fontWeight: 600,
            color: 'var(--color-dark, #242124)',
          }}
        >
          {label}
          {required && <span style={{ color: '#DC2626', fontWeight: 700 }}>*</span>}
        </label>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${columns === 3 ? '180px' : '220px'}, 1fr))`,
          gap: '12px',
        }}
      >
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                border: isSelected
                  ? '2px solid var(--color-primary, #7A1F3D)'
                  : '1.5px solid var(--color-border, #E8DFC8)',
                background: isSelected
                  ? 'var(--color-primary-light, #FAF0F3)'
                  : '#FFFFFF',
                color: isSelected
                  ? 'var(--color-primary, #7A1F3D)'
                  : 'var(--color-dark, #242124)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                boxShadow: isSelected
                  ? '0 2px 8px rgba(122, 31, 61, 0.1)'
                  : '0 1px 3px rgba(36, 33, 36, 0.03)',
              }}
            >
              {opt.icon && (
                <div
                  style={{
                    color: isSelected ? 'var(--color-primary, #7A1F3D)' : 'var(--color-text-muted, #8E8480)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {opt.icon}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: isSelected ? 700 : 500 }}>
                  {opt.label}
                </span>
                {opt.description && (
                  <span
                    style={{
                      fontSize: '0.78rem',
                      color: isSelected ? 'var(--color-primary, #7A1F3D)' : 'var(--color-text-muted, #8E8480)',
                      opacity: 0.85,
                    }}
                  >
                    {opt.description}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {helperText && !error && (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted, #8E8480)' }}>
          {helperText}
        </span>
      )}
      {error && (
        <span style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 500 }}>
          {error}
        </span>
      )}
    </div>
  );
};
