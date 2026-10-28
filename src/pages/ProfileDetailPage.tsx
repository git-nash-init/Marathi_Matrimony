import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Profile } from '../types';
import { discoveryService } from '../services/discovery.service';
import { shortlistService } from '../services/shortlist.service';
import { subscriptionService } from '../services/subscription.service';
import { InterestButton } from '../components/common/InterestButton';
import { ContactSection, UnlockedContact } from '../components/premium/ContactSection';
import { ProfilePdfButton } from '../components/premium/ProfilePdfButton';
import { ReportProfileModal } from '../components/common/ReportProfileModal';
import { BlockProfileModal } from '../components/common/BlockProfileModal';
import { SectionCard } from '../components/common/SectionCard';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import {
  ArrowLeft,
  Heart,
  CheckCircle2,
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
  Utensils,
  User,
  Flag,
  Ban,
  Lock,
  ChevronRight,
  Moon,
  Phone,
} from 'lucide-react';
import styles from './ProfileDetailPage.module.css';

export const ProfileDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, localize, t } = useLanguage();
  const { success, error } = useToast();
  const { user, profile: authProfile } = useAuth();
  const canUnlockContact = useSubscription().has('unlock_contact');
  const currentUserId = authProfile?.id || user?.id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isShortlisted, setIsShortlisted] = useState<boolean>(false);
  const [isShortlistBusy, setIsShortlistBusy] = useState<boolean>(false);
  const [unlockedContact, setUnlockedContact] = useState<UnlockedContact | null>(null);

  // Modals
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isBlockOpen, setIsBlockOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await discoveryService.fetchProfileById(id);
        if (isMounted) {
          setProfile(data);
          if (data?.photoUrl) setSelectedPhoto(data.photoUrl);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDetails();

    if (id) {
      shortlistService.isShortlisted(id, currentUserId).then((val: boolean) => {
        if (isMounted) setIsShortlisted(val);
      });
    }

    // Record the visit (viewer is resolved server-side; one row per viewer per day)
    if (user?.id && id) subscriptionService.trackProfileView(id);

    // Subscribe to shortlist updates
    const unsubscribe = shortlistService.subscribe((updatedId, nextState) => {
      if (isMounted && (updatedId === id || updatedId === profile?.id || updatedId === profile?.profileId)) {
        setIsShortlisted(nextState);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [id, profile?.id, profile?.profileId, user?.id, currentUserId]);

  const handleToggleShortlist = async () => {
    if (!profile || isShortlistBusy) return;

    setIsShortlistBusy(true);

    try {
      const res = await shortlistService.toggleShortlist(profile.id, currentUserId);
      setIsShortlisted(res.isShortlisted);

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

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>{language === 'mr' ? 'प्रोफाइल लोड होत आहे...' : 'Loading profile details...'}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.notFoundContainer}>
        <User size={54} color="#64748B" />
        <h2>{language === 'mr' ? 'प्रोफाइल सापडली नाही' : 'Profile Not Found'}</h2>
        <p>
          {language === 'mr'
            ? 'तुम्ही शोधत असलेले प्रोफाइल काढून टाकले गेले असू शकते किंवा उपलब्ध नाही.'
            : 'The profile you are looking for may have been removed or is currently private.'}
        </p>
        <Link to="/matches" className={styles.backToSearchBtn}>
          <ArrowLeft size={16} />
          <span>{language === 'mr' ? 'प्रोफाइल शोधा वर परत जा' : 'Back to Search'}</span>
        </Link>
      </div>
    );
  }

  const profileName = localize(profile.name);
  const city = localize(profile.city);
  const state = localize(profile.state);
  const education = localize(profile.education);
  const educationDetail = localize(profile.educationDetail);
  const occupation = localize(profile.occupation);
  const employedIn = localize(profile.employedIn);
  const maritalStatus = localize(profile.maritalStatus);
  const religion = localize(profile.religion);
  const community = localize(profile.community);
  const motherTongue = localize(profile.motherTongue);
  const gothra = profile.gothra ? localize(profile.gothra) : '-';
  const manglik = profile.manglik ? localize(profile.manglik) : '-';
  const aboutMe = localize(profile.aboutMe);
  const diet = localize(profile.lifestyle.diet);
  const smoke = localize(profile.lifestyle.smoke);
  const drink = localize(profile.lifestyle.drink);
  const familyType = localize(profile.family.familyType);
  const familyStatus = localize(profile.family.familyStatus);
  const fatherOccupation = localize(profile.family.fatherOccupation);
  const motherOccupation = localize(profile.family.motherOccupation);
  const nativePlace = localize(profile.family.nativePlace);

  const galleryList = profile.gallery && profile.gallery.length > 0 ? profile.gallery : profile.photoUrl ? [profile.photoUrl] : [];

  return (
    <div className={styles.container}>
      {/* Top Navigation Breadcrumb */}
      <div className={styles.breadcrumbBar}>
        <button type="button" onClick={() => navigate(-1)} className={styles.backBtn}>
          <ArrowLeft size={18} />
          <span>{language === 'mr' ? 'मागे जा' : 'Back'}</span>
        </button>
        <div className={styles.breadcrumbPath}>
          <Link to="/matches">{language === 'mr' ? 'जोडीदार शोधा' : 'Matches'}</Link>
          <ChevronRight size={14} />
          <span>{profileName}</span>
        </div>
      </div>

      {/* Hero Profile Overview Card */}
      <div className={styles.heroCard}>
        {/* Photo Gallery Column */}
        <div className={styles.photoGalleryCol}>
          <div className={styles.mainPhotoWrapper}>
            {profile.photosHidden && profile.id !== user?.id ? (
              <div className={styles.photoPlaceholder} style={{ backgroundColor: '#FBF8F2', color: 'var(--color-primary)', padding: '24px', textAlign: 'center' }}>
                <Lock size={36} color="var(--color-secondary-hover)" style={{ marginBottom: '10px' }} />
                <span style={{ fontSize: '1rem', fontWeight: 700 }}>
                  {language === 'mr' ? '🔒 फोटो संरक्षित आहे' : '🔒 Photos Protected'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#666', marginTop: '6px' }}>
                  {language === 'mr'
                    ? 'या सदस्याने फोटो सुरक्षित ठेवले आहेत. केवळ पडताळणी झालेले सदस्यच पाहू शकतात.'
                    : 'This member has protected their photos from public view.'}
                </span>
              </div>
            ) : selectedPhoto ? (
              <img src={selectedPhoto} alt={profileName} className={styles.mainPhoto} />
            ) : (
              <div className={styles.photoPlaceholder}>
                <span className={styles.placeholderInitial}>{profileName.charAt(0)}</span>
                <span className={styles.placeholderText}>
                  {language === 'mr' ? 'फोटो उपलब्ध नाही' : 'Photo Not Available'}
                </span>
              </div>
            )}
            {profile.isVerified && (
              <div className={styles.verifiedBadge}>
                <CheckCircle2 size={14} strokeWidth={3} />
                <span>{language === 'mr' ? 'पडताळणी झालेले' : 'Verified'}</span>
              </div>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {galleryList.length > 1 && (
            <div className={styles.thumbnailRow}>
              {galleryList.map((url: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPhoto(url)}
                  className={`${styles.thumbnailBtn} ${selectedPhoto === url ? styles.activeThumbnail : ''}`}
                >
                  <img src={url} alt={`Photo ${idx + 1}`} className={styles.thumbnailImg} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Profile Summary & Main Action Column */}
        <div className={styles.profileSummaryCol}>
          <div>
            <div className={styles.profileIdTag}>{profile.profileId}</div>
            <h1 className={styles.heroName}>{profileName}</h1>
            <p className={styles.heroSub}>
              {profile.age} {language === 'mr' ? 'वर्षे' : 'yrs'} • {profile.height} • {maritalStatus}
            </p>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <Users size={16} className={styles.summaryIcon} />
              <div>
                <span className={styles.summaryLabel}>{language === 'mr' ? 'धर्म व जात' : 'Religion & Community'}</span>
                <span className={styles.summaryVal}>
                  {religion} • {community}
                </span>
              </div>
            </div>

            <div className={styles.summaryItem}>
              <GraduationCap size={16} className={styles.summaryIcon} />
              <div>
                <span className={styles.summaryLabel}>{language === 'mr' ? 'शिक्षण' : 'Education'}</span>
                <span className={styles.summaryVal}>{education}</span>
              </div>
            </div>

            <div className={styles.summaryItem}>
              <Briefcase size={16} className={styles.summaryIcon} />
              <div>
                <span className={styles.summaryLabel}>{language === 'mr' ? 'व्यवसाय' : 'Occupation'}</span>
                <span className={styles.summaryVal}>{occupation}</span>
              </div>
            </div>

            <div className={styles.summaryItem}>
              <MapPin size={16} className={styles.summaryIcon} />
              <div>
                <span className={styles.summaryLabel}>{language === 'mr' ? 'सध्याचे शहर' : 'Location'}</span>
                <span className={styles.summaryVal}>
                  {city}, {state}
                </span>
              </div>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className={styles.heroActions}>
            <InterestButton profile={profile} className={styles.primaryInterestBtn} sentClassName={styles.interestSent} />

            <button
              type="button"
              className={`${styles.shortlistHeroBtn} ${isShortlisted ? styles.shortlistedActive : ''}`}
              onClick={handleToggleShortlist}
              disabled={isShortlistBusy}
              aria-pressed={isShortlisted}
              aria-label={isShortlisted ? (t.shortlist?.btnRemove || 'शॉर्टलिस्टमधून काढा') : (t.shortlist?.btnShortlist || 'शॉर्टलिस्ट करा')}
            >
              <Heart size={18} fill={isShortlisted ? '#E11D48' : 'none'} color={isShortlisted ? '#E11D48' : 'currentColor'} />
              <span>
                {isShortlisted
                  ? (t.shortlist?.btnShortlisted || (language === 'mr' ? 'शॉर्टलिस्ट केले आहे' : 'Shortlisted'))
                  : (t.shortlist?.btnShortlist || (language === 'mr' ? 'शॉर्टलिस्ट करा' : 'Add to Shortlist'))}
              </span>
            </button>
            <ProfilePdfButton profile={profile} contact={unlockedContact} />
          </div>

          {/* Auxiliary Actions: Report & Block */}
          <div className={styles.auxActionsRow}>
            <button type="button" onClick={() => setIsReportOpen(true)} className={styles.auxBtn}>
              <Flag size={14} />
              <span>{language === 'mr' ? 'प्रोफाइल रिपोर्ट करा' : 'Report Profile'}</span>
            </button>
            <span className={styles.auxDivider}>•</span>
            <button type="button" onClick={() => setIsBlockOpen(true)} className={`${styles.auxBtn} ${styles.auxBtnDanger}`}>
              <Ban size={14} />
              <span>{language === 'mr' ? 'प्रोफाइल ब्लॉक करा' : 'Block Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Details Section Cards */}
      <div className={styles.sectionsContainer}>
        {/* 1. About Me */}
        <SectionCard
          title={language === 'mr' ? '१. तुमच्याबद्दल सांगा' : '1. About Member'}
          subtitle={language === 'mr' ? 'व्यक्तिमत्त्व, विचार व आवडी' : 'Personality, values & introduction'}
          icon={<User size={20} />}
        >
          <div className={styles.aboutMeBox}>
            <p className={styles.aboutMeParagraph}>{aboutMe || (language === 'mr' ? 'या सदस्याने अजून माहिती जोडलेली नाही.' : "This member hasn't added an introduction yet.")}</p>
          </div>
        </SectionCard>

        {/* 2. Basic Information */}
        <SectionCard
          title={language === 'mr' ? '२. मूलभूत माहिती' : '2. Basic Details'}
          subtitle={language === 'mr' ? 'वैयक्तिक व जन्म तपशील' : 'Personal & cultural details'}
          icon={<User size={20} />}
        >
          <div className={styles.infoGrid}>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'वय' : 'Age'}</span>
              <span className={styles.infoValue}>{profile.age} {language === 'mr' ? 'वर्षे' : 'Years'}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'उंची' : 'Height'}</span>
              <span className={styles.infoValue}>{profile.height}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'वैवाहिक स्थिती' : 'Marital Status'}</span>
              <span className={styles.infoValue}>{maritalStatus}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'मातृभाषा' : 'Mother Tongue'}</span>
              <span className={styles.infoValue}>{motherTongue}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'धर्म' : 'Religion'}</span>
              <span className={styles.infoValue}>{religion}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'जात / समाज' : 'Community'}</span>
              <span className={styles.infoValue}>{community}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'गोत्र' : 'Gothra'}</span>
              <span className={styles.infoValue}>{gothra}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'मांगलिक' : 'Manglik'}</span>
              <span className={styles.infoValue}>{manglik}</span>
            </div>
          </div>
        </SectionCard>

        {/* 3. Education & Career */}
        <SectionCard
          title={language === 'mr' ? '३. शिक्षण व करिअर' : '3. Education & Career'}
          subtitle={language === 'mr' ? 'शैक्षणिक पात्रता व नोकरी/व्यवसाय' : 'Educational qualification & profession'}
          icon={<GraduationCap size={20} />}
        >
          <div className={styles.infoGrid}>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'उच्च शिक्षण' : 'Highest Education'}</span>
              <span className={styles.infoValue}>{education}</span>
            </div>
            {educationDetail && (
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>{language === 'mr' ? 'महाविद्यालय / शाखा' : 'College / Specialization'}</span>
                <span className={styles.infoValue}>{educationDetail}</span>
              </div>
            )}
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'व्यवसाय / पद' : 'Occupation'}</span>
              <span className={styles.infoValue}>{occupation}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'नोकरीचे क्षेत्र' : 'Employed In'}</span>
              <span className={styles.infoValue}>{employedIn}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'वार्षिक उत्पन्न' : 'Annual Income'}</span>
              <span className={styles.infoValue}>{localize(profile.annualIncome)}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'कामाचे ठिकाण' : 'Work Location'}</span>
              <span className={styles.infoValue}>{city}</span>
            </div>
          </div>
        </SectionCard>

        {/* 4. Family Details */}
        <SectionCard
          title={language === 'mr' ? '४. कौटुंबिक माहिती' : '4. Family Details'}
          subtitle={language === 'mr' ? 'कुटुंब पार्श्वभूमी व भावंडे' : 'Family background & values'}
          icon={<Users size={20} />}
        >
          <div className={styles.infoGrid}>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'कुटुंब प्रकार' : 'Family Type'}</span>
              <span className={styles.infoValue}>{familyType}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'कौटुंबिक मूल्ये' : 'Family Values'}</span>
              <span className={styles.infoValue}>{familyStatus}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'वडिलांचा व्यवसाय' : "Father's Occupation"}</span>
              <span className={styles.infoValue}>{fatherOccupation}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'आईचा व्यवसाय' : "Mother's Occupation"}</span>
              <span className={styles.infoValue}>{motherOccupation}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'भाऊ' : 'Brothers'}</span>
              <span className={styles.infoValue}>{profile.family.brothers}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'बहिणी' : 'Sisters'}</span>
              <span className={styles.infoValue}>{profile.family.sisters}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'मूळ गाव / वतन' : 'Native Hometown'}</span>
              <span className={styles.infoValue}>{nativePlace}</span>
            </div>
          </div>
        </SectionCard>

        {/* 5. Lifestyle & Habits */}
        <SectionCard
          title={language === 'mr' ? '५. जीवनशैली व सवयी' : '5. Lifestyle & Habits'}
          subtitle={language === 'mr' ? 'आहार, सवयी व आवडीनिवडी' : 'Dietary habits & lifestyle'}
          icon={<Utensils size={20} />}
        >
          <div className={styles.infoGrid}>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'आहार' : 'Diet'}</span>
              <span className={styles.infoValue}>{diet}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'धूम्रपान' : 'Smoking'}</span>
              <span className={styles.infoValue}>{smoke}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'मद्यपान' : 'Drinking'}</span>
              <span className={styles.infoValue}>{drink}</span>
            </div>
          </div>
        </SectionCard>

        {/* 6. Partner Preferences */}
        <SectionCard
          title={language === 'mr' ? '६. अपेक्षित जोडीदार' : '6. Partner Preferences'}
          subtitle={language === 'mr' ? 'अपेक्षित वय, शिक्षण व ठिकाण' : 'Expectations for life partner'}
          icon={<Heart size={20} />}
        >
          <div className={styles.infoGrid}>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'अपेक्षित वय' : 'Preferred Age'}</span>
              <span className={styles.infoValue}>{profile.partnerPreferences.ageRange}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'अपेक्षित उंची' : 'Preferred Height'}</span>
              <span className={styles.infoValue}>{profile.partnerPreferences.heightRange}</span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'अपेक्षित शिक्षण' : 'Preferred Education'}</span>
              <span className={styles.infoValue}>
                {profile.partnerPreferences.education.map((e: any) => localize(e)).join(', ')}
              </span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'अपेक्षित व्यवसाय' : 'Preferred Occupation'}</span>
              <span className={styles.infoValue}>
                {profile.partnerPreferences.occupations.map((o: any) => localize(o)).join(', ')}
              </span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>{language === 'mr' ? 'पसंतीचे ठिकाण' : 'Preferred Location'}</span>
              <span className={styles.infoValue}>
                {profile.partnerPreferences.preferredLocations.map((l: any) => localize(l)).join(', ')}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* 7. Kundali / Horoscope Section */}
        {(profile.rashi || profile.nakshatra || profile.manglik) && (
          <SectionCard
            title={language === 'mr' ? '७. कुंडली माहिती' : '7. Kundali & Horoscope'}
            subtitle={language === 'mr' ? 'राशी, नाडी, चरण, गण आणि मूल्यांक' : 'Rashi, Nadi, Charan, Gan & Mulyank'}
            icon={<Moon size={20} />}
          >
            <div className={styles.infoGrid}>
              {profile.rashi && (
                <div className={styles.infoField}>
                  <span className={styles.infoLabel}>{language === 'mr' ? 'राशी' : 'Rashi'}</span>
                  <span className={styles.infoValue}>{localize(profile.rashi)}</span>
                </div>
              )}
              {profile.nakshatra && (
                <div className={styles.infoField}>
                  <span className={styles.infoLabel}>{language === 'mr' ? 'नक्षत्र' : 'Nakshatra'}</span>
                  <span className={styles.infoValue}>{localize(profile.nakshatra)}</span>
                </div>
              )}
              {profile.manglik && (
                <div className={styles.infoField}>
                  <span className={styles.infoLabel}>{language === 'mr' ? 'मांगलिक' : 'Manglik'}</span>
                  <span className={styles.infoValue}>{localize(profile.manglik)}</span>
                </div>
              )}
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>{language === 'mr' ? 'नाडी' : 'Nadi'}</span>
                <span className={styles.infoValue}>{language === 'mr' ? 'मध्यम नाडी' : 'Madhyam Nadi'}</span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>{language === 'mr' ? 'चरण' : 'Charan'}</span>
                <span className={styles.infoValue}>{language === 'mr' ? 'तृतीय' : 'Tritiya'}</span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>{language === 'mr' ? 'गण' : 'Gan'}</span>
                <span className={styles.infoValue}>{language === 'mr' ? 'मानव गण' : 'Manav Gan'}</span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>{language === 'mr' ? 'मूल्यांक' : 'Mulyank'}</span>
                <span className={styles.infoValue}>7</span>
              </div>
            </div>
          </SectionCard>
        )}

        {/* 8. Contact Details — Subscription Locked */}
        <SectionCard
          title={language === 'mr' ? '८. संपर्क माहिती' : '8. Contact Details'}
          subtitle={canUnlockContact
            ? (language === 'mr' ? 'आडनाव, ईमेल, फोन, पत्ता — आपल्या प्लॅनमध्ये अनलॉक करा' : 'Surname, Email, Phone & Address — unlock with your plan')
            : (language === 'mr' ? 'आडनाव, ईमेल, फोन, पत्ता — सदस्यत्व आवश्यक' : 'Surname, Email, Phone & Address — Subscription Required')}
          icon={<Phone size={20} />}
        >
          <ContactSection profileId={profile.id} isOwnProfile={profile.id === authProfile?.id} onContactChange={setUnlockedContact} />
        </SectionCard>

        {/* Privacy Notice */}
        <div className={styles.privacyNoticeCard}>
          <div className={styles.privacyIconCol}>
            <Lock size={22} color="var(--color-primary, #7A1F3D)" />
          </div>
          <div>
            <h4 className={styles.privacyTitle}>
              {language === 'mr' ? 'सुरक्षित संपर्क व गोपनीयता धोरण' : 'Matrimonial Privacy & Contact Protection'}
            </h4>
            <p className={styles.privacyText}>
              {canUnlockContact
                ? (language === 'mr'
                  ? 'या प्रोफाइलचा फोन नंबर आणि ईमेल गोपनीय आहे. आपल्या प्लॅनमधून अनलॉक केल्यावरच संपर्क तपशील दिसतात आणि प्रत्येक अनलॉकची नोंद ठेवली जाते.'
                  : 'Phone, email and address are protected. They are shown only after you unlock them with your plan, and every unlock is recorded.')
                : (language === 'mr'
                  ? 'या प्रोफाइलचा फोन नंबर आणि ईमेल गोपनीय आहे. सदस्यत्व घेतल्यानंतरच संपर्क तपशील उपलब्ध होतात.'
                  : 'Phone, email and address are protected. Subscribe to a Silver or higher plan to unlock contact details.')}
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReportProfileModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        profile={profile}
      />

      <BlockProfileModal
        isOpen={isBlockOpen}
        onClose={() => setIsBlockOpen(false)}
        profile={profile}
        onProfileBlocked={() => navigate('/matches')}
      />
    </div>
  );
};
