import React from 'react';
import { Edit3 } from 'lucide-react';

export interface ReviewItem {
  label: string;
  value: React.ReactNode;
}

export interface ReviewCardProps {
  title: string;
  icon?: React.ReactNode;
  items: ReviewItem[];
  onEdit?: () => void;
  editLabel?: string;
  columns?: number;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  title,
  icon,
  items,
  onEdit,
  editLabel = 'Edit',
  columns = 3,
}) => {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1.5px solid var(--color-border, #E8DFC8)',
        boxShadow: '0 2px 10px rgba(122, 31, 61, 0.04)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border, #E8DFC8)',
          paddingBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {icon && (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--color-primary-light, #FAF0F3)',
                color: 'var(--color-primary, #7A1F3D)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </div>
          )}
          <h4
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--color-primary, #7A1F3D)',
              margin: 0,
            }}
          >
            {title}
          </h4>
        </div>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              background: 'var(--color-primary-light, #FAF0F3)',
              color: 'var(--color-primary, #7A1F3D)',
              border: '1px solid var(--color-primary-subtle, #F3DEE5)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F3DEE5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-primary-light, #FAF0F3)';
            }}
          >
            <Edit3 size={13} />
            {editLabel}
          </button>
        )}
      </div>

      {/* Grid of details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${columns === 2 ? '240px' : '180px'}, 1fr))`,
          gap: '14px',
        }}
      >
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span
              style={{
                fontSize: '0.78rem',
                color: 'var(--color-text-muted, #8E8480)',
                fontWeight: 500,
              }}
            >
              {item.label}
            </span>
            <span
              style={{
                fontSize: '0.92rem',
                fontWeight: 600,
                color: 'var(--color-dark, #242124)',
                wordBreak: 'break-word',
              }}
            >
              {item.value || '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
