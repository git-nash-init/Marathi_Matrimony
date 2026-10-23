import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { SectionHeading } from '../components/common/SectionHeading';
import { Button } from '../components/common/Button';
import { FAQAccordion } from '../components/common/FAQAccordion';
import { mockFaqs } from '../data/mockFaqs';
import styles from './HowItWorksPage.module.css';

export const HowItWorksPage: React.FC = () => {
  const { t } = useLanguage();

  const stepsDetail = [
    {
      num: t.howItWorks.step1Num,
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc
    },
    {
      num: t.howItWorks.step2Num,
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc
    },
    {
      num: t.howItWorks.step3Num,
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc
    },
    {
      num: t.howItWorks.step4Num,
      title: t.howItWorks.step4Title,
      desc: t.howItWorks.step4Desc
    }
  ];

  return (
    <div className="section">
      <div className="container">
        <SectionHeading
          badge={t.howItWorks.badge}
          title={t.howItWorks.title}
          subtitle={t.howItWorks.subtitle}
        />

        {/* Detailed Steps Progression */}
        <div className={styles.stepsProgression}>
          {stepsDetail.map((s, idx) => (
            <div key={idx} className={styles.stepCard}>
              <div className={styles.stepNumberBadge}>
                {s.num}
              </div>
              <div>
                <h3 className={styles.stepTitle}>
                  {s.title}
                </h3>
                <p className={styles.stepDesc}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className={styles.ctaBanner}>
          <h2 className={styles.bannerTitle}>
            {t.cta.title}
          </h2>
          <p className={styles.bannerSubtitle}>
            {t.cta.subtitle}
          </p>
          <Button to="/register" variant="secondary" size="lg">
            {t.cta.button}
          </Button>
        </div>

        {/* Related FAQs */}
        <SectionHeading
          badge={t.faq.badge}
          title={t.howItWorks.faqsTitle}
          subtitle={t.howItWorks.faqsSubtitle}
        />
        <FAQAccordion items={mockFaqs.slice(0, 3)} />
      </div>
    </div>
  );
};
