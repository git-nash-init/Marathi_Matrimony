import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SectionHeading } from '../components/common/SectionHeading';
import { FAQAccordion } from '../components/common/FAQAccordion';
import { mockFaqs } from '../data/mockFaqs';
import { Button } from '../components/common/Button';

export const FAQPage: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = mockFaqs.filter((faq) => {
    if (selectedCategory !== 'all' && faq.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const questionEn = faq.question.en.toLowerCase();
      const questionMr = faq.question.mr.toLowerCase();
      const answerEn = faq.answer.en.toLowerCase();
      const answerMr = faq.answer.mr.toLowerCase();
      return questionEn.includes(q) || questionMr.includes(q) || answerEn.includes(q) || answerMr.includes(q);
    }
    return true;
  });

  return (
    <div className="section">
      <div className="container">
        <SectionHeading
          badge={t.faq.badge}
          title={t.faq.title}
          subtitle={t.faq.subtitle}
        />

        {/* Search & Filter Bar */}
        <div style={{ maxWidth: '680px', margin: '0 auto 36px auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-primary)' }} />
            <input
              type="text"
              placeholder={t.faq.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 46px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-white)',
                fontSize: '0.96rem',
                outline: 'none',
                boxShadow: 'var(--shadow-sm)'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline'}`}
            >
              {t.faq.allCategory}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('registration')}
              className={`btn btn-sm ${selectedCategory === 'registration' ? 'btn-primary' : 'btn-outline'}`}
            >
              {t.faq.categoryRegistration}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('privacy')}
              className={`btn btn-sm ${selectedCategory === 'privacy' ? 'btn-primary' : 'btn-outline'}`}
            >
              {t.faq.categoryPrivacy}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('membership')}
              className={`btn btn-sm ${selectedCategory === 'membership' ? 'btn-primary' : 'btn-outline'}`}
            >
              {t.faq.categoryMembership}
            </button>
          </div>
        </div>

        {/* FAQs */}
        {filteredFaqs.length > 0 ? (
          <FAQAccordion items={filteredFaqs} allowMultiple />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
            <p>{t.faq.noResults}</p>
          </div>
        )}

        {/* Need more help */}
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
            {t.faq.needHelp}
          </p>
          <Button to="/contact" variant="primary" size="md">
            {t.faq.contactSupport}
          </Button>
        </div>
      </div>
    </div>
  );
};
