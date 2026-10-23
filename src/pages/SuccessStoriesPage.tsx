import React from 'react';
import { Quote, Calendar, MapPin, Heart } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SectionHeading } from '../components/common/SectionHeading';
import { Button } from '../components/common/Button';
import { mockStories } from '../data/mockStories';
import styles from './SuccessStoriesPage.module.css';

export const SuccessStoriesPage: React.FC = () => {
  const { t, localize } = useLanguage();

  return (
    <div className="section">
      <div className="container">
        <SectionHeading
          badge={t.successStories.badge}
          title={t.successStories.title}
          subtitle={t.successStories.subtitle}
        />

        <div className={styles.storiesList}>
          {mockStories.map((story) => (
            <div key={story.id} className={styles.storyCard}>
              <div className={styles.imageWrap}>
                <img
                  src={story.imageUrl}
                  alt={localize(story.coupleNames)}
                  className={styles.storyImg}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/stories/story-1.jpg';
                  }}
                />
              </div>
              <div className={styles.storyBody}>
                <div className={styles.headerRow}>
                  <h3 className={styles.coupleNames}>
                    {localize(story.coupleNames)}
                  </h3>
                  <Quote size={24} color="var(--color-secondary)" />
                </div>

                <div className={styles.metaRow}>
                  <span className={styles.metaItem}>
                    <Calendar size={14} />
                    {localize(story.weddingDate)}
                  </span>
                  <span className={styles.metaItem}>
                    <MapPin size={14} />
                    {localize(story.location)}
                  </span>
                </div>

                <blockquote className={styles.quote}>
                  "{localize(story.quote)}"
                </blockquote>

                <p className={styles.storyText}>
                  {localize(story.story)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Share story CTA */}
        <div className={styles.ctaBox}>
          <Heart size={32} color="var(--color-primary)" style={{ margin: '0 auto 12px auto' }} />
          <h3 className={styles.ctaTitle}>
            {t.successStories.shareYourStory}
          </h3>
          <p className={styles.ctaDesc}>
            {t.successStories.sharePrompt}
          </p>
          <Button to="/contact" variant="primary" size="md">
            {t.footer.contact}
          </Button>
        </div>
      </div>
    </div>
  );
};
