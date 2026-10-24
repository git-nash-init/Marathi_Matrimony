import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './LanguageSwitcher.module.css';

interface LanguageSwitcherProps {
  variant?: 'header' | 'footer' | 'inline';
  isGlass?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'header',
  isGlass = false 
}) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div 
      className={`
        ${styles.switcherContainer} 
        ${styles[variant]} 
        ${isGlass ? styles.glassMode : ''}
      `}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        className={`${styles.symbolBtn} ${language === 'mr' ? styles.active : ''}`}
        onClick={() => setLanguage('mr')}
        title="मराठी (Marathi)"
        aria-label="मराठी भाषेत बदला"
        aria-pressed={language === 'mr'}
      >
        <span className={styles.symbolChar}>आ</span>
      </button>

      <span className={styles.divider} aria-hidden="true">/</span>

      <button
        type="button"
        className={`${styles.symbolBtn} ${language === 'en' ? styles.active : ''}`}
        onClick={() => setLanguage('en')}
        title="English"
        aria-label="Switch to English"
        aria-pressed={language === 'en'}
      >
        <span className={styles.symbolChar}>A</span>
      </button>
    </div>
  );
};
