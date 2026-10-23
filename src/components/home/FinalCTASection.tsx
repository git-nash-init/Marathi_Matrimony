import React from 'react';
import { Heart, Search } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from '../common/Button';
import styles from './FinalCTASection.module.css';

export const FinalCTASection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className={styles.ctaSection}>
      <div className={styles.bgGlow}></div>
      <div className="container">
        <div className={styles.ctaCard}>
          <div className={styles.iconHeart}>
            <Heart size={36} fill="#C59A45" color="#C59A45" />
          </div>

          <h2 className={styles.ctaTitle}>{t.cta.title}</h2>
          <p className={styles.ctaSubtitle}>{t.cta.subtitle}</p>

          <div className={styles.btnGroup}>
            <Button to="/register" variant="secondary" size="lg" icon={<Heart size={18} />}>
              {t.cta.button}
            </Button>
            <Button to="/search" variant="outline-gold" size="lg" icon={<Search size={18} />}>
              {t.cta.browseLink}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
