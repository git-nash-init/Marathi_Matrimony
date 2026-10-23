import React from 'react';

export interface FieldGroupProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const FieldGroup: React.FC<FieldGroupProps> = ({
  children,
  columns = 2,
  gap = '18px',
  style,
  className = '',
}) => {
  const minWidth = columns === 3 ? '220px' : columns === 4 ? '180px' : '280px';

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
        gap,
        width: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
