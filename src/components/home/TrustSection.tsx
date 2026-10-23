import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  WeddingUnionIcon,
  KalashIcon,
  VerifiedShieldIcon,
  MarathaCrestIcon
} from '../common/CulturalIcons';
import styles from './TrustSection.module.css';

export const TrustSection: React.FC = () => {
  const { language } = useLanguage();

  const trustMetrics = [
    {
      icon: <WeddingUnionIcon size={28} color="var(--color-primary)" />,
      metric: '३,०००+',
      metricEn: '3,000+',
      title: language === 'mr' ? 'यशस्वी मराठा विवाह' : 'Happy Maratha Marriages',
      desc: language === 'mr' ? 'गेल्या १० वर्षांत संपन्न झालेले मंगल विवाह' : 'Celebrated unions over the past decade'
    },
    {
      icon: <KalashIcon size={28} color="var(--color-antique-gold)" />,
      metric: '१०+ वर्षे',
      metricEn: '10+ Years',
      title: language === 'mr' ? 'अखंड समर्पित सेवा' : 'Dedicated Service',
      desc: language === 'mr' ? 'महाराष्ट्रातील मराठा कुटुंबांचा दृढ विश्वास' : 'Trusted by Maratha families across Maharashtra'
    },
    {
      icon: <VerifiedShieldIcon size={28} color="var(--color-primary)" />,
      metric: '१००%',
      metricEn: '100%',
      title: language === 'mr' ? 'वैयक्तिक मार्गदर्शन व पडताळणी' : 'Personal Assistance',
      desc: language === 'mr' ? 'प्रत्येक प्रोफाईलची सत्यता व कौटुंबिक खातरजमा' : 'Verified biodatas and dedicated consultation'
    },
    {
      icon: <MarathaCrestIcon size={28} color="var(--color-antique-gold)" />,
      metric: '११,०००+',
      metricEn: '11,000+',
      title: language === 'mr' ? 'उच्चशिक्षित सक्रिय स्थळे' : 'Educated Active Members',
      desc: language === 'mr' ? 'इंजिनिअर, डॉक्टर, सीए, शासकीय व व्यावसायिक' : 'Engineers, doctors, CAs, and business professionals'
    }
  ];

  return (
    <section className={styles.trustSection} aria-label="Trust and Statistics">
      <div className="container">
        <div className={styles.cardsGrid}>
          {trustMetrics.map((item, idx) => (
            <div key={idx} className={styles.trustCard}>
              <div className={styles.iconCircle}>{item.icon}</div>
              <div className={styles.metricNumber}>
                {language === 'mr' ? item.metric : item.metricEn}
              </div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
