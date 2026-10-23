import React from 'react';
import { Quote, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SectionHeading } from '../common/SectionHeading';
import { Button } from '../common/Button';
import { mockStories } from '../../data/mockStories';
import styles from './SuccessStoriesSection.module.css';

export const SuccessStoriesSection: React.FC = () => {
  const { t, localize } = useLanguage();

  return (
    <section className={`section ${styles.storiesSection}`}>
      <div className="container">
        <SectionHeading
          badge={t.successStories.badge}
          title={t.successStories.title}
          subtitle={t.successStories.subtitle}
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
                  <Quote size={18} />
                </div>
              </div>

              <div className={styles.storyContent}>
                <h3 className={styles.coupleNames}>{localize(story.coupleNames)}</h3>
                
                <div className={styles.metaRow}>
                  <span className={styles.metaItem}>
                    <Calendar size={13} />
                    {localize(story.weddingDate)}
                  </span>
                  <span className={styles.metaItem}>
                    <MapPin size={13} />
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
          <Button to="/success-stories" variant="outline" size="md" icon={<ArrowRight size={16} />}>
            {t.successStories.title} ({t.common.viewAll})
          </Button>
        </div>
      </div>
    </section>
  );
};
