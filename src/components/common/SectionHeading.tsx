import React from 'react';
import { Sparkles } from 'lucide-react';

interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  title,
  subtitle,
  align = 'center',
  className = ''
}) => {
  return (
    <div className={`section-header ${align === 'left' ? 'text-left' : ''} ${className}`}>
      {badge && (
        <span className="badge-tag">
          <Sparkles size={13} />
          {badge}
        </span>
      )}
      <h2>{title}</h2>
      <div className="ornament-divider" style={align === 'left' ? { justifyContent: 'flex-start' } : undefined}>
        <span className="ornament-line"></span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        </svg>
        <span className="ornament-line right"></span>
      </div>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
};
