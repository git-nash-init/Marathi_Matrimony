import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from '../common/Button';
import { WeddingUnionIcon, MatrimonySearchIcon } from '../common/CulturalIcons';
import styles from './FinalCTASection.module.css';

export const FinalCTASection: React.FC = () => {
  const { language } = useLanguage();

  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.ctaCard}>
          <div className={styles.iconHeart}>
            <WeddingUnionIcon size={34} color="var(--color-antique-gold)" />
          </div>

          <h2 className={styles.ctaTitle}>
            {language === 'mr'
              ? 'आपला ९६ कुळी मराठा जीवनसाथी शोधण्यास आजच सुरुवात करा'
              : 'Begin Your 96 Kuli Maratha Matrimonial Journey Today'}
          </h2>
          <p className={styles.ctaSubtitle}>
            {language === 'mr'
              ? 'मोफत नोंदणी करा आणि आपल्या पसंतीनुसार हजारो पडताळणी केलेली स्थळे पहा. तुमचे स्वप्नवत वैवाहिक जीवन आता फक्त एका क्लिकच्या अंतरावर!'
              : 'Register for free and connect with thousands of verified profiles across Maharashtra and abroad.'}
          </p>

          <div className={styles.btnGroup}>
            <Button to="/register" variant="secondary" size="lg" icon={<WeddingUnionIcon size={18} />}>
              {language === 'mr' ? 'मोफत नोंदणी करा' : 'Register Free Now'}
            </Button>
            <Button to="/search" variant="outline-gold" size="lg" icon={<MatrimonySearchIcon size={18} />}>
              {language === 'mr' ? 'स्थळे शोधा' : 'Browse Profiles'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
