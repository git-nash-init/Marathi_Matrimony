import React from 'react';

export interface InfoCardProps {
  type?: 'info' | 'warning' | 'success' | 'gold';
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  type = 'info',
  title,
  children,
  icon,
  className = '',
  style,
}) => {
  const typeConfig = {
    info: {
      bg: '#F0F9FF',
      border: '#BAE6FD',
      color: '#0369A1',
      text: '#0C4A6E',
      icon: (
        <svg width="20" height="20" fill="none" stroke="#0284C7" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    warning: {
      bg: 'var(--color-warning-bg, #FDF2E9)',
      border: '#FCD34D',
      color: 'var(--color-warning, #D35400)',
      text: '#78350F',
      icon: (
        <svg width="20" height="20" fill="none" stroke="#D97706" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    success: {
      bg: 'var(--color-success-bg, #E8F8F0)',
      border: '#A7F3D0',
      color: 'var(--color-success, #1E824C)',
      text: '#064E3B',
      icon: (
        <svg width="20" height="20" fill="none" stroke="#10B981" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    gold: {
      bg: 'var(--color-secondary-light, #FAF5E8)',
      border: 'rgba(197, 154, 69, 0.4)',
      color: 'var(--color-secondary-hover, #AA8232)',
      text: '#5B4314',
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
  };

  const current = typeConfig[type];

  return (
    <div
      className={className}
      style={{
        padding: '16px 20px',
        borderRadius: '14px',
        background: current.bg,
        border: `1.5px solid ${current.border}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        fontSize: '0.88rem',
        color: current.text,
        lineHeight: '1.55',
        ...style,
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }}>{icon || current.icon}</div>
      <div style={{ flex: 1 }}>
        {title && (
          <h4
            style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              color: current.color,
              marginBottom: '4px',
              margin: '0 0 4px 0',
            }}
          >
            {title}
          </h4>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};
