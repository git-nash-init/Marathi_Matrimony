import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SectionHeading } from '../common/SectionHeading';
import { Button } from '../common/Button';
import { mockStories } from '../../data/mockStories';
import styles from './SuccessStoriesSection.module.css';

export const SuccessStoriesSection: React.FC = () => {
  const { localize, language } = useLanguage();

  return (
    <section className={`section ${styles.storiesSection}`}>
      <div className="container">
        <SectionHeading
          badge={language === 'mr' ? 'यशस्वी विवाह' : 'Success Stories'}
          title={language === 'mr' ? 'मराठा लगीनसराई द्वारे जुळलेली शुभबंधने' : 'Celebrated Maratha Laginsarai Marriages'}
          subtitle={language === 'mr' ? 'आमच्या विश्वासू सेवेने संपन्न झालेल्या आनंदी विवाहांची खरीखुरी यशोगाथा.' : 'Real couples whose sacred unions began with Maratha Laginsarai.'}
        />

        <div className={styles.storiesGrid}>
          {mockStories.map((story) => (
            <div key={story.id} className={styles.storyCard}>
              <div className={styles.imageWrap}>
                <img
                  src={story.imageUrl}
                  alt={localize(story.coupleNames)}
                  className={styles.image}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/stories/story-1.jpg';
                  }}
                />
                <div className={styles.quoteIconCircle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
              </div>

              <div className={styles.storyContent}>
                <h3 className={styles.coupleNames}>{localize(story.coupleNames)}</h3>
                
                <div className={styles.metaRow}>
                  <span className={styles.metaItem}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {localize(story.weddingDate)}
                  </span>
                  <span className={styles.metaItem}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {localize(story.location)}
                  </span>
                </div>

                <p className={styles.quoteText}>
                  "{localize(story.quote)}"
                </p>

                <p className={styles.storyText}>
                  {localize(story.story)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.bottomLink}>
          <Button to="/success-stories" variant="outline-gold" size="md">
            <span>{language === 'mr' ? 'अधिक यशोगाथा पहा' : 'View All Success Stories'}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Button>
        </div>
      </div>
    </section>
  );
};
