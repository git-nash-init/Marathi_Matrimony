import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Profile } from '../types';
import { discoveryService } from '../services/discovery.service';
import { shortlistService } from '../services/shortlist.service';
import { ProfileCard, ProfileCardSkeleton } from '../components/profile/ProfileCard';
import { Heart, Search, Sparkles, BookmarkCheck } from 'lucide-react';
import styles from './ShortlistPage.module.css';

export const ShortlistPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { user, profile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const userProfileId = profile?.id || user?.id;

  useEffect(() => {
    let isMounted = true;
    const loadShortlisted = async () => {
      setIsLoading(true);
      try {
        const shortIds = await shortlistService.getShortlistedIds(userProfileId);
        const res = await discoveryService.fetchProfiles({ pageSize: 100 });
        const filtered = res.profiles.filter((p: Profile) => shortIds.includes(p.id) || shortIds.includes(p.profileId));
        if (isMounted) setProfiles(filtered);
      } catch (err) {
        console.error('Failed to load shortlists:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadShortlisted();

    // Subscribe to shortlist updates
    const unsubscribe = shortlistService.subscribe((profileId, isShortlisted) => {
      if (isMounted) {
        if (!isShortlisted) {
          setProfiles((prev) =>
            prev.filter(
              (p) =>
                p.id.toLowerCase() !== profileId.toLowerCase() &&
                p.profileId.toLowerCase() !== profileId.toLowerCase()
            )
          );
        } else {
          // If a new profile is added, refresh the list
          loadShortlisted();
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [userProfileId]);

  const handleShortlistChange = (profileId: string, isShortlisted: boolean) => {
    if (!isShortlisted) {
      setProfiles((prev) =>
        prev.filter(
          (p) =>
            p.id.toLowerCase() !== profileId.toLowerCase() &&
            p.profileId.toLowerCase() !== profileId.toLowerCase()
        )
      );
    }
  };

  const shortlistText = t.shortlist;

  return (
    <div className={styles.container}>
      {/* Header Banner */}
      <div className={styles.headerBanner}>
        <div className={styles.bannerTag}>
          <Sparkles size={16} color="var(--color-primary, #7A1F3D)" />
          <span>{shortlistText?.badge || (language === 'mr' ? 'जतन केलेली स्थळे' : 'Saved Profiles')}</span>
        </div>
        <h1 className={styles.pageTitle}>
          {shortlistText?.title || (language === 'mr' ? 'माझी शॉर्टलिस्ट' : 'My Shortlist')}
        </h1>
        <p className={styles.pageSubtitle}>
          {shortlistText?.subtitle || (language === 'mr' ? 'तुम्ही जतन केलेले प्रोफाइल येथे पहा.' : "Profiles you've saved appear here.")}
        </p>

        {/* Counter Tag */}
        {!isLoading && profiles.length > 0 && (
          <div className={styles.countBadge}>
            <BookmarkCheck size={15} />
            <span>
              {profiles.length} {language === 'mr' ? 'प्रोफाइल जतन' : 'Profiles Saved'}
            </span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className={styles.contentArea}>
        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 3 }).map((_, idx) => (
              <ProfileCardSkeleton key={idx} />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconCircle}>
              <Heart size={44} color="var(--color-primary, #7A1F3D)" />
            </div>
            <h3 className={styles.emptyTitle}>
              {shortlistText?.emptyTitle || (language === 'mr' ? 'अजून कोणतेही प्रोफाइल शॉर्टलिस्ट केलेले नाही' : 'No profiles shortlisted yet')}
            </h3>
            <p className={styles.emptySubtitle}>
              {shortlistText?.emptySubtitle || (language === 'mr' ? 'तुम्हाला आवडणारी प्रोफाइल येथे जतन करा आणि नंतर सहज पाहा.' : 'Save profiles you like here and view them easily later.')}
            </p>
            <Link to="/matches" className={styles.browseBtn}>
              <Search size={16} />
              <span>{shortlistText?.browseCTA || (language === 'mr' ? 'प्रोफाइल शोधा' : 'Find Profiles')}</span>
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onShortlistChange={handleShortlistChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
