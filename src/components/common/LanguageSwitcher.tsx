import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Globe } from 'lucide-react';
import styles from './LanguageSwitcher.module.css';

interface LanguageSwitcherProps {
  variant?: 'header' | 'footer' | 'inline';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'header' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`${styles.switcherContainer} ${styles[variant]}`}>
      <Globe size={16} className={styles.globeIcon} />
      <button
        type="button"
        className={`${styles.langBtn} ${language === 'mr' ? styles.active : ''}`}
        onClick={() => setLanguage('mr')}
        aria-label="मराठी भाषेत पहा"
      >
        मराठी
      </button>
      <span className={styles.divider}>|</span>
      <button
        type="button"
        className={`${styles.langBtn} ${language === 'en' ? styles.active : ''}`}
        onClick={() => setLanguage('en')}
        aria-label="View in English"
      >
        English
      </button>
    </div>
  );
};
