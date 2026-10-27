import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { mockProfiles } from '../../data/mockProfiles';
import { ProfileCard } from '../profile/ProfileCard';
import { SectionHeading } from '../common/SectionHeading';
import { Button } from '../common/Button';
import styles from './FeaturedProfilesSection.module.css';

export const FeaturedProfilesSection: React.FC = () => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();

  // Enforce opposite gender matching if user is logged in
  const userGender = profile?.gender?.toLowerCase() || (user?.user_metadata?.gender as 'male' | 'female' | undefined);
  const targetOppositeGender = userGender === 'male' ? 'female' : userGender === 'female' ? 'male' : undefined;

  const eligibleProfiles = targetOppositeGender
    ? mockProfiles.filter((p) => p.gender === targetOppositeGender)
    : mockProfiles;

  // Show first 4 featured profiles on homepage
  const featured = eligibleProfiles.slice(0, 4);

  return (
    <section className={`section ${styles.featuredSection}`}>
      <div className="container">
        <div className={styles.headerRow}>
          <SectionHeading
            badge={t.featuredProfiles.badge}
            title={t.featuredProfiles.title}
            subtitle={t.featuredProfiles.subtitle}
            align="left"
          />
          <div className={styles.viewAllTop}>
            <Button to="/search" variant="outline" size="sm" icon={<ArrowRight size={16} />}>
              {t.featuredProfiles.viewAll}
            </Button>
          </div>
        </div>

        <div className={styles.profilesGrid}>
          {featured.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
            />
          ))}
        </div>

        <div className={styles.bottomCta}>
          <Button to="/search" variant="primary" size="lg" icon={<ArrowRight size={18} />}>
            {t.featuredProfiles.viewAll}
          </Button>
        </div>
      </div>
    </section>
  );
};
