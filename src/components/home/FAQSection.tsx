import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SectionHeading } from '../common/SectionHeading';
import { FAQAccordion } from '../common/FAQAccordion';
import { mockFaqs } from '../../data/mockFaqs';
import styles from './FAQSection.module.css';

export const FAQSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className={`section ${styles.faqSection}`}>
      <div className="container">
        <SectionHeading
          badge={t.faq.badge}
          title={t.faq.title}
          subtitle={t.faq.subtitle}
        />

        <FAQAccordion items={mockFaqs} />
      </div>
    </section>
  );
};
