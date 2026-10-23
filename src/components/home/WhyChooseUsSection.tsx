import React from 'react';
import { ShieldCheck, Lock, Search, HeartHandshake, MessageSquareCheck, Users } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SectionHeading } from '../common/SectionHeading';
import styles from './WhyChooseUsSection.module.css';

export const WhyChooseUsSection: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <ShieldCheck size={28} />,
      title: t.whyChooseUs.feature1Title,
      desc: t.whyChooseUs.feature1Desc
    },
    {
      icon: <Lock size={28} />,
      title: t.whyChooseUs.feature2Title,
      desc: t.whyChooseUs.feature2Desc
    },
    {
      icon: <Search size={28} />,
      title: t.whyChooseUs.feature3Title,
      desc: t.whyChooseUs.feature3Desc
    },
    {
      icon: <HeartHandshake size={28} />,
      title: t.whyChooseUs.feature4Title,
      desc: t.whyChooseUs.feature4Desc
    },
    {
      icon: <MessageSquareCheck size={28} />,
      title: t.whyChooseUs.feature5Title,
      desc: t.whyChooseUs.feature5Desc
    },
    {
      icon: <Users size={28} />,
      title: t.whyChooseUs.feature6Title,
      desc: t.whyChooseUs.feature6Desc
    }
  ];

  return (
    <section className={`section ${styles.whySection}`}>
      <div className="container">
        <SectionHeading
          badge={t.whyChooseUs.badge}
          title={t.whyChooseUs.title}
          subtitle={t.whyChooseUs.subtitle}
        />

        <div className={styles.featuresGrid}>
          {features.map((feat, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.iconCircle}>{feat.icon}</div>
              <h3 className={styles.featureTitle}>{feat.title}</h3>
              <p className={styles.featureDesc}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
