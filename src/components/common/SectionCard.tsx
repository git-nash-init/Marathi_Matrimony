import React from 'react';

export interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  icon,
  badge,
  action,
  children,
  className = '',
  style,
}) => {
  return (
    <div
      className={className}
      style={{
        background: 'var(--color-card-bg, #FFFFFF)',
        border: '1.5px solid var(--color-border, #E8DFC8)',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(122, 31, 61, 0.05)',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 22px',
          borderBottom: '1px solid var(--color-border-light, #F0EAE1)',
          background: 'linear-gradient(180deg, #FAF7F2 0%, #FFFFFF 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {icon && (
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--color-primary-light, #FAF0F3)',
                color: 'var(--color-primary, #7A1F3D)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid var(--color-primary-subtle, #F3DEE5)',
              }}
            >
              {icon}
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: 'var(--color-primary, #7A1F3D)',
                  margin: 0,
                  letterSpacing: '0.01em',
                }}
              >
                {title}
              </h3>
              {badge && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: 'var(--color-secondary-light, #FAF5E8)',
                    color: 'var(--color-secondary-hover, #AA8232)',
                    border: '1px solid rgba(197, 154, 69, 0.3)',
                  }}
                >
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--color-text-muted, #6C625E)',
                  margin: '2px 0 0 0',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action && <div>{action}</div>}
      </div>

      {/* Content */}
      <div style={{ padding: '22px 24px' }}>{children}</div>
    </div>
  );
};
