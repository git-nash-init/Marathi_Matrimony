import React, { useEffect, useState } from 'react';
import { ArrowRight, Users } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { discoveryService } from '../../services/discovery.service';
import { Profile } from '../../types';
import { ProfileCard, ProfileCardSkeleton } from '../profile/ProfileCard';
import { SectionHeading } from '../common/SectionHeading';
import { Button } from '../common/Button';
import { EmptyState } from '../states/UiStates';
import styles from './FeaturedProfilesSection.module.css';

export const FeaturedProfilesSection: React.FC = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [featured, setFeatured] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const mr = language === 'mr';

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    let active = true;
    discoveryService.fetchProfiles({ pageSize: 4 })
      .then((res) => { if (active) setFeatured(res.profiles); })
      .catch(() => { if (active) setFeatured([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authLoading, isAuthenticated]);

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
          {featured.length > 0 && (
            <div className={styles.viewAllTop}>
              <Button to="/search" variant="outline" size="sm" icon={<ArrowRight size={16} />}>
                {t.featuredProfiles.viewAll}
              </Button>
            </div>
          )}
        </div>

        {loading || authLoading ? (
          <div className={styles.profilesGrid}>
            {[0, 1, 2, 3].map((i) => <ProfileCardSkeleton key={i} />)}
          </div>
        ) : !isAuthenticated ? (
          <EmptyState
            icon={<Users size={30} />}
            title={mr ? 'आपला जोडीदार येथे शोधा' : 'Find your match here'}
            description={mr
              ? 'सदस्यांच्या गोपनीयतेसाठी प्रोफाइल्स फक्त नोंदणीकृत सदस्यांना दिसतात. मोफत नोंदणी करा आणि आपल्या वयोगटातील स्थळे पहा.'
              : "To protect members' privacy, profiles are shown only to registered members. Register free to see members in your age group."}
            action={{ label: mr ? 'मोफत नोंदणी करा' : 'Register free', to: '/register' }}
            secondaryAction={{ label: mr ? 'लॉगिन करा' : 'Sign in', to: '/login' }}
          />
        ) : featured.length === 0 ? (
          <EmptyState
            icon={<Users size={30} />}
            title={mr ? 'सध्या आपल्या वयोगटात नवीन स्थळे नाहीत' : 'No new members in your age group yet'}
            description={mr ? 'नवीन सदस्य मंजूर झाल्यावर येथे दिसतील. तोपर्यंत सर्व स्थळे पाहू शकता.' : 'New members appear here once approved. Meanwhile you can search all members.'}
            action={{ label: t.featuredProfiles.viewAll, to: '/search' }}
          />
        ) : (
          <>
            <div className={styles.profilesGrid}>
              {featured.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
            <div className={styles.bottomCta}>
              <Button to="/search" variant="primary" size="lg" icon={<ArrowRight size={18} />}>
                {t.featuredProfiles.viewAll}
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
