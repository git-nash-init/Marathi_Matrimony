import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Profile } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { shortlistService } from '../../services/shortlist.service';
import { interestService, InterestStatus } from '../../services/interest.service';
import { ExpressInterestModal } from '../common/ExpressInterestModal';
import { ReportProfileModal } from '../common/ReportProfileModal';
import { BlockProfileModal } from '../common/BlockProfileModal';
import {
  Heart,
  CheckCircle2,
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
  MoreVertical,
  Flag,
  Ban,
  Eye,
  Sparkles,
  Lock,
} from 'lucide-react';
import styles from './ProfileCard.module.css';

interface ProfileCardProps {
  profile: Profile;
  onBlock?: (profileId: string) => void;
  onShortlistChange?: (profileId: string, isShortlisted: boolean) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onBlock, onShortlistChange }) => {
  const { language, localize, t } = useLanguage();
  const { success, error } = useToast();
  const { user, profile: authProfile } = useAuth();
  const currentUserId = authProfile?.id || user?.id;

  const [isShortlisted, setIsShortlisted] = useState(false);
  const [isShortlistBusy, setIsShortlistBusy] = useState(false);
  const [interestStatus, setInterestStatus] = useState<InterestStatus | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    shortlistService.isShortlisted(profile.id, currentUserId).then((val) => {
      if (isMounted) setIsShortlisted(val);
    });
    interestService.getInterestStatus(profile.id, currentUserId).then((status) => {
      if (isMounted) setInterestStatus(status);
    });

    // Subscribe to shortlist updates from any component
    const unsubscribe = shortlistService.subscribe((updatedId, nextState) => {
      if (isMounted && (updatedId === profile.id || updatedId === profile.profileId)) {
        setIsShortlisted(nextState);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [profile.id, profile.profileId, currentUserId]);

  const handleToggleShortlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isShortlistBusy) return;

    setIsShortlistBusy(true);

    try {
      const res = await shortlistService.toggleShortlist(profile.id, currentUserId);
      setIsShortlisted(res.isShortlisted);
      if (onShortlistChange) onShortlistChange(profile.id, res.isShortlisted);

      if (res.success) {
        if (res.isShortlisted) {
          success(t.shortlist?.toastAdded || (language === 'mr' ? 'प्रोफाइल शॉर्टलिस्ट केली आहे.' : 'Profile added to shortlist.'));
        } else {
          success(t.shortlist?.toastRemoved || (language === 'mr' ? 'प्रोफाइल शॉर्टलिस्टमधून काढली आहे.' : 'Profile removed from shortlist.'));
        }
      } else {
        error(t.shortlist?.toastError || (language === 'mr' ? 'काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.' : 'Something went wrong. Please try again.'));
      }
    } catch {
      error(t.shortlist?.toastError || (language === 'mr' ? 'काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.' : 'Something went wrong. Please try again.'));
    } finally {
      setIsShortlistBusy(false);
    }
  };

  const handleOpenInterest = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInterestModalOpen(true);
  };

  const profileName = localize(profile.name);
  const city = localize(profile.city);
  const state = localize(profile.state);
  const education = localize(profile.education);
  const occupation = localize(profile.occupation);
  const maritalStatus = localize(profile.maritalStatus);
  const community = localize(profile.community);
  const motherTongue = localize(profile.motherTongue);
  const aboutMeText = localize(profile.aboutMe);

  return (
    <>
      <div className={styles.card}>
        {/* Top Media / Photo Section */}
        <div className={styles.mediaContainer}>
          <Link to={`/profile/${profile.id}`} className={styles.photoLink}>
            {profile.photosHidden ? (
              <div className={styles.placeholderPhoto} style={{ backgroundColor: '#FBF8F2', color: 'var(--color-primary)' }}>
                <Lock size={26} color="var(--color-secondary-hover)" style={{ marginBottom: '6px' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                  {language === 'mr' ? '🔒 फोटो संरक्षित आहे' : '🔒 Photo Protected'}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#666', marginTop: '2px' }}>
                  {language === 'mr' ? 'केवळ सदस्यांसाठी' : 'Members Only'}
                </span>
              </div>
            ) : profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profileName}
                className={styles.photo}
                loading="lazy"
              />
            ) : (
              <div className={styles.placeholderPhoto}>
                <span className={styles.placeholderInitial}>{profileName.charAt(0)}</span>
                <span className={styles.placeholderText}>
                  {language === 'mr' ? 'फोटो उपलब्ध नाही' : 'Photo Not Available'}
                </span>
              </div>
            )}
          </Link>

          {/* Verification Badge */}
          {profile.isVerified && (
            <div className={styles.verifiedBadge} title="Verified Profile">
              <CheckCircle2 size={13} strokeWidth={3} />
              <span>{language === 'mr' ? 'पडताळणी झालेले' : 'Verified'}</span>
            </div>
          )}

          {/* Shortlist Heart Button */}
          <button
            type="button"
            className={`${styles.shortlistBtn} ${isShortlisted ? styles.shortlisted : ''}`}
            onClick={handleToggleShortlist}
            disabled={isShortlistBusy}
            aria-pressed={isShortlisted}
            aria-label={isShortlisted ? (t.shortlist?.btnRemove || 'शॉर्टलिस्टमधून काढा') : (t.shortlist?.btnShortlist || 'शॉर्टलिस्ट करा')}
            title={isShortlisted ? (t.shortlist?.btnShortlisted || 'शॉर्टलिस्ट केले आहे') : (t.shortlist?.btnShortlist || 'शॉर्टलिस्ट करा')}
          >
            <Heart size={18} fill={isShortlisted ? '#E11D48' : 'none'} color={isShortlisted ? '#E11D48' : '#334155'} />
          </button>

          {/* More Menu Dropdown */}
          <div className={styles.menuWrapper}>
            <button
              type="button"
              className={styles.menuBtn}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              aria-label="More options"
            >
              <MoreVertical size={18} />
            </button>

            {isMenuOpen && (
              <div
                className={styles.dropdownMenu}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsReportModalOpen(true);
                  }}
                >
                  <Flag size={14} color="#E11D48" />
                  <span>{language === 'mr' ? 'रिपोर्ट करा' : 'Report Profile'}</span>
                </button>
                <button
                  type="button"
                  className={`${styles.menuItem} ${styles.menuItemDanger}`}
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsBlockModalOpen(true);
                  }}
                >
                  <Ban size={14} color="#DC2626" />
                  <span>{language === 'mr' ? 'ब्लॉक करा' : 'Block Profile'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card Body Information */}
        <div className={styles.cardBody}>
          {/* Header Title & ID */}
          <div className={styles.cardHeader}>
            <div>
              <Link to={`/profile/${profile.id}`} className={styles.profileName}>
                {profileName}, <span className={styles.ageText}>{profile.age} {language === 'mr' ? 'वर्षे' : 'yrs'}</span>
              </Link>
              <div className={styles.subMeta}>
                {profile.height} • {maritalStatus}
              </div>
            </div>
            <span className={styles.profileIdBadge}>{profile.profileId}</span>
          </div>

          {/* Details List */}
          <div className={styles.detailsList}>
            <div className={styles.detailRow}>
              <GraduationCap size={15} className={styles.detailIcon} />
              <span className={styles.detailText}>{education}</span>
            </div>
            <div className={styles.detailRow}>
              <Briefcase size={15} className={styles.detailIcon} />
              <span className={styles.detailText}>{occupation}</span>
            </div>
            <div className={styles.detailRow}>
              <MapPin size={15} className={styles.detailIcon} />
              <span className={styles.detailText}>
                {city}, {state}
              </span>
            </div>
            <div className={styles.detailRow}>
              <Users size={15} className={styles.detailIcon} />
              <span className={styles.detailText}>
                {community} • {motherTongue}
              </span>
            </div>
          </div>

          {/* About Me Quote */}
          {aboutMeText && (
            <p className={styles.aboutQuote}>
              "{aboutMeText.length > 85 ? `${aboutMeText.substring(0, 85)}...` : aboutMeText}"
            </p>
          )}

          {/* Action Buttons */}
          <div className={styles.cardActions}>
            <Link to={`/profile/${profile.id}`} className={styles.viewBtn}>
              <Eye size={15} />
              <span>{language === 'mr' ? 'प्रोफाइल पहा' : 'View Profile'}</span>
            </Link>

            <button
              type="button"
              className={`${styles.interestBtn} ${interestStatus === 'pending' || interestStatus === 'accepted' ? styles.interestSent : ''}`}
              onClick={handleOpenInterest}
              disabled={interestStatus === 'pending' || interestStatus === 'accepted'}
            >
              {interestStatus === 'pending' || interestStatus === 'accepted' ? (
                <>
                  <CheckCircle2 size={15} />
                  <span>{language === 'mr' ? 'पसंती पाठवली' : 'Interest Sent'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>{language === 'mr' ? 'पसंती कळवा' : 'Express Interest'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ExpressInterestModal
        isOpen={isInterestModalOpen}
        onClose={() => setIsInterestModalOpen(false)}
        profile={profile}
        onInterestSent={() => setInterestStatus('pending')}
      />

      <ReportProfileModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        profile={profile}
      />

      <BlockProfileModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        profile={profile}
        onProfileBlocked={() => {
          if (onBlock) onBlock(profile.id);
        }}
      />
    </>
  );
};

export const ProfileCardSkeleton: React.FC = () => {
  return (
    <div className={`${styles.card} ${styles.skeletonCard}`}>
      <div className={styles.skeletonMedia} />
      <div className={styles.cardBody}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonSubtitle} />
        <div className={styles.skeletonRow} />
        <div className={styles.skeletonRow} />
        <div className={styles.skeletonRow} />
        <div className={styles.skeletonActions} />
      </div>
    </div>
  );
};
