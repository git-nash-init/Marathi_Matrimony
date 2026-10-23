import React from 'react';
import { UserPlus, Sliders, Search, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SectionHeading } from '../common/SectionHeading';
import styles from './HowItWorksSection.module.css';

export const HowItWorksSection: React.FC = () => {
  const { t } = useLanguage();

  const steps = [
    {
      num: t.howItWorks.step1Num,
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc,
      icon: <UserPlus size={28} />
    },
    {
      num: t.howItWorks.step2Num,
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc,
      icon: <Sliders size={28} />
    },
    {
      num: t.howItWorks.step3Num,
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc,
      icon: <Search size={28} />
    },
    {
      num: t.howItWorks.step4Num,
      title: t.howItWorks.step4Title,
      desc: t.howItWorks.step4Desc,
      icon: <MessageCircle size={28} />
    }
  ];

  return (
    <section className={`section ${styles.howItWorksSection}`}>
      <div className="container">
        <SectionHeading
          badge={t.howItWorks.badge}
          title={t.howItWorks.title}
          subtitle={t.howItWorks.subtitle}
        />

        <div className={styles.stepsGrid}>
          {steps.map((step, idx) => (
            <div key={idx} className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <div className={styles.stepNumBadge}>{step.num}</div>
                <div className={styles.iconCircle}>{step.icon}</div>
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
