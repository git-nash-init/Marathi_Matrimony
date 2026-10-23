import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  borderRadius,
  style = {}
}) => {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
      aria-hidden="true"
    />
  );
};

export const ProfileCardSkeleton: React.FC = () => {
  return (
    <div className={styles.cardSkeleton} aria-label="स्थळांची माहिती लोड होत आहे... / Loading profile details...">
      <div className={`${styles.skeleton} ${styles.imageSkeleton}`} />
      <div className={`${styles.skeleton} ${styles.textSkeletonLg}`} />
      <div className={`${styles.skeleton} ${styles.textSkeletonMd}`} />
      <div className={`${styles.skeleton} ${styles.textSkeletonSm}`} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <div className={`${styles.skeleton} ${styles.btnSkeleton}`} />
        <div className={`${styles.skeleton} ${styles.btnSkeleton}`} />
      </div>
    </div>
  );
};
