import React from 'react';
import { FormField } from './FormField';

export interface RangeSelectorProps {
  label: string;
  minLabel?: string;
  maxLabel?: string;
  minValue: number;
  maxValue: number;
  minLimit: number;
  maxLimit: number;
  step?: number;
  unit?: string;
  onMinChange: (val: number) => void;
  onMaxChange: (val: number) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const RangeSelector: React.FC<RangeSelectorProps> = ({
  label,
  minLabel = 'Min',
  maxLabel = 'Max',
  minValue,
  maxValue,
  minLimit,
  maxLimit,
  step = 1,
  unit = '',
  onMinChange,
  onMaxChange,
  error,
  helperText,
  required,
}) => {
  return (
    <FormField
      label={label}
      required={required}
      helperText={helperText}
      error={error}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '16px 20px',
          borderRadius: '12px',
          background: 'var(--color-surface, #FAF7F2)',
          border: '1.5px solid var(--color-border, #E8DFC8)',
        }}
      >
        {/* Selected Range Display Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-dark, #242124)' }}>
            {minLabel}: <strong style={{ color: 'var(--color-primary, #7A1F3D)' }}>{minValue} {unit}</strong>
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted, #8E8480)' }}>—</span>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-dark, #242124)' }}>
            {maxLabel}: <strong style={{ color: 'var(--color-primary, #7A1F3D)' }}>{maxValue} {unit}</strong>
          </span>
        </div>

        {/* Dual Range Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #8E8480)', display: 'block', marginBottom: '4px' }}>
              {minLabel} ({minValue} {unit})
            </span>
            <input
              type="range"
              min={minLimit}
              max={maxLimit}
              step={step}
              value={minValue}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val <= maxValue) {
                  onMinChange(val);
                }
              }}
              style={{
                width: '100%',
                accentColor: 'var(--color-primary, #7A1F3D)',
                cursor: 'pointer',
              }}
            />
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #8E8480)', display: 'block', marginBottom: '4px' }}>
              {maxLabel} ({maxValue} {unit})
            </span>
            <input
              type="range"
              min={minLimit}
              max={maxLimit}
              step={step}
              value={maxValue}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= minValue) {
                  onMaxChange(val);
                }
              }}
              style={{
                width: '100%',
                accentColor: 'var(--color-primary, #7A1F3D)',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      </div>
    </FormField>
  );
};
