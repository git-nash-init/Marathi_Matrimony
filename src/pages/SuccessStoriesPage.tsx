import React, { useCallback, useEffect, useState } from 'react';
import { Quote, Calendar, MapPin, Heart } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SectionHeading } from '../components/common/SectionHeading';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState, ErrorState } from '../components/states/UiStates';
import { Story, storiesService } from '../services/content.service';
import styles from './SuccessStoriesPage.module.css';

export const SuccessStoriesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const mr = language === 'mr';
  const [stories, setStories] = useState<Story[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(() => {
    setError(null);
    storiesService.listPublished().then(setStories).catch(setError);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="section">
      <div className="container">
        <SectionHeading
          badge={t.successStories.badge}
          title={t.successStories.title}
          subtitle={t.successStories.subtitle}
        />

        {error ? (
          <ErrorState error={error} onRetry={load} />
        ) : stories === null ? (
          <div style={{ display: 'grid', gap: 16 }} aria-label={mr ? 'लोड होत आहे' : 'Loading'}>
            {[0, 1].map((i) => <Skeleton key={i} height={220} borderRadius={14} />)}
          </div>
        ) : stories.length === 0 ? (
          <EmptyState
            icon={<Heart size={30} />}
            title={mr ? 'पहिल्या कथा लवकरच' : 'The first stories are coming soon'}
            description={mr ? 'जोडप्यांच्या संमतीनेच कथा येथे दिसतील. आपलीही कथा आम्हाला कळवा.' : 'Stories appear here only with the couple\'s agreement. If you met through us, we would love to hear from you.'}
            action={{ label: mr ? 'आमच्याशी संपर्क साधा' : 'Contact us', to: '/contact' }}
          />
        ) : (
        <div className={styles.storiesList}>
          {stories.map((story) => (
            <div key={story.id} className={styles.storyCard}>
              <div className={styles.imageWrap}>
                {story.photo_url && <img src={story.photo_url} alt={mr ? story.couple_names_mr : story.couple_names_en} className={styles.storyImg} />}
              </div>
              <div className={styles.storyBody}>
                <div className={styles.headerRow}>
                  <h3 className={styles.coupleNames}>
                    {mr ? story.couple_names_mr : story.couple_names_en}
                  </h3>
                  <Quote size={24} color="var(--color-secondary)" />
                </div>

                <div className={styles.metaRow}>
                  <span className={styles.metaItem}>
                    <Calendar size={14} />
                    {story.wedding_date && new Date(story.wedding_date).toLocaleDateString(mr ? 'mr-IN' : 'en-IN', { year: 'numeric', month: 'long' })}
                  </span>
                  <span className={styles.metaItem}>
                    <MapPin size={14} />
                    {mr ? story.location_mr : story.location_en}
                  </span>
                </div>

                <p className={styles.storyText}>
                  {mr ? story.story_mr : story.story_en}
                </p>
              </div>
            </div>
          ))}
        </div>
        )}

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
