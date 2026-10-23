import React from 'react';

export interface StepHeaderProps {
  stepNumber: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const StepHeader: React.FC<StepHeaderProps> = ({
  stepNumber,
  totalSteps = 10,
  title,
  subtitle,
  icon,
}) => {
  return (
    <div
      style={{
        borderBottom: '1.5px solid var(--color-border-light, #F0EAE1)',
        paddingBottom: '18px',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'var(--color-primary, #7A1F3D)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            fontWeight: 800,
            boxShadow: '0 4px 14px rgba(122, 31, 61, 0.25)',
            flexShrink: 0,
          }}
        >
          {icon || stepNumber}
        </div>
        <div>
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-secondary-hover, #AA8232)',
              marginBottom: '2px',
            }}
          >
            Step {stepNumber} of {totalSteps}
          </div>
          <h2
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: 'var(--color-primary, #7A1F3D)',
              margin: 0,
              lineHeight: '1.3',
            }}
          >
            {title}
          </h2>
        </div>
      </div>
      {subtitle && (
        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--color-text-muted, #6C625E)',
            margin: '4px 0 0 58px',
            lineHeight: '1.5',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
