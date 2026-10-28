import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  Crown,
  Heart,
  Bookmark,
  Search,
  LogOut,
  AlertTriangle,
  Clock,
  Eye,
  Phone,
  Star,
  Sparkles,
  Lock,
  ChevronRight,
  UserCheck,
  PhoneCall,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { SubscriptionGate } from '../components/common/SubscriptionGate';
import {
  subscriptionService,
  ActiveSubscription,
  PLAN_DISPLAY_INFO,
} from '../services/subscription.service';
import { mockProfiles } from '../data/mockProfiles';
import { Profile } from '../types';
import { interestService } from '../services/interest.service';
import { discoveryService } from '../services/discovery.service';
import dashStyles from './DashboardPage.module.css';

// ── Tab definitions ──────────────────────────────────────────────────────────

type TabKey =
  | 'matchmaking'
  | 'recommendations'
  | 'viewed_by_me'
  | 'who_viewed_me'
  | 'interests'
  | 'contact_viewers'
  | 'contacts_by_me';

interface Tab {
  key: TabKey;
  label_en: string;
  label_mr: string;
  icon: React.ReactNode;
  requiresPlan: 'free' | 'silver' | 'diamond';
}

const TABS: Tab[] = [
  { key: 'matchmaking',    label_en: 'Matchmaking',         label_mr: 'जुळवाजुळव',         icon: <Sparkles size={16} />,   requiresPlan: 'free' },
  { key: 'recommendations',label_en: 'Recommendations',     label_mr: 'शिफारसी',            icon: <Star size={16} />,       requiresPlan: 'silver' },
  { key: 'viewed_by_me',   label_en: 'Profiles I Viewed',   label_mr: 'मी पाहिलेल्या',      icon: <Eye size={16} />,        requiresPlan: 'free' },
  { key: 'who_viewed_me',  label_en: 'Who Viewed Me',       label_mr: 'माझी प्रोफाइल पाहणारे', icon: <UserCheck size={16} />,  requiresPlan: 'silver' },
  { key: 'interests',      label_en: 'Interests',           label_mr: 'पसंती',              icon: <Heart size={16} />,      requiresPlan: 'free' },
  { key: 'contact_viewers',label_en: 'Contact Viewers',     label_mr: 'फोन पाहणारे',        icon: <PhoneCall size={16} />,  requiresPlan: 'diamond' },
  { key: 'contacts_by_me', label_en: 'Contacts I Viewed',   label_mr: 'मी पाहिलेले फोन',   icon: <Phone size={16} />,      requiresPlan: 'silver' },
];

// ── Main Component ────────────────────────────────────────────────────────────

export const DashboardPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>('matchmaking');
  const [subscription, setSubscription] = useState<ActiveSubscription | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateReason, setGateReason] = useState('');

  // Enforce opposite gender for matrimonial matching
  const userGender = profile?.gender?.toLowerCase() || (user?.user_metadata?.gender as 'male' | 'female' | undefined);
  const targetOppositeGender: 'male' | 'female' | undefined =
    userGender === 'male' ? 'female' : userGender === 'female' ? 'male' : undefined;

  const [oppositeProfiles, setOppositeProfiles] = useState<Profile[]>(() => {
    if (!targetOppositeGender) return mockProfiles;
    return mockProfiles.filter((p) => p.gender === targetOppositeGender);
  });

  useEffect(() => {
    let isMounted = true;
    discoveryService
      .fetchProfiles({
        gender: targetOppositeGender,
        pageSize: 40,
        userProfileId: profile?.id,
      })
      .then((res) => {
        if (isMounted && res.profiles && res.profiles.length > 0) {
          setOppositeProfiles(res.profiles);
        }
      })
      .catch((err) => {
        console.warn('Dashboard discovery fetch error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [targetOppositeGender, profile?.id]);

  const matchProfiles = useMemo(() => oppositeProfiles.slice(0, 6), [oppositeProfiles]);
  const recoProfiles = useMemo(() => oppositeProfiles.slice(1, 5), [oppositeProfiles]);
  const viewedProfiles = useMemo(() => oppositeProfiles.slice(0, 4), [oppositeProfiles]);
  const interestProfiles = useMemo(() => oppositeProfiles.slice(0, 3), [oppositeProfiles]);

  const loadSubscription = useCallback(async () => {
    if (!user) return;
    setSubLoading(true);
    const sub = await subscriptionService.getActiveSubscription(user.id);
    setSubscription(sub);
    setSubLoading(false);
  }, [user]);

  useEffect(() => { loadSubscription(); }, [loadSubscription]);

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member');

  const currentPlanSlug = subscription?.plan?.slug || null;
  const planInfo = currentPlanSlug ? PLAN_DISPLAY_INFO[currentPlanSlug] : null;

  const hasAccess = (required: Tab['requiresPlan']): boolean => {
    if (required === 'free') return true;
    if (!currentPlanSlug) return false;
    const order: Record<string, number> = { silver: 1, diamond: 2, platinum: 3 };
    return (order[currentPlanSlug] || 0) >= (order[required] || 0);
  };

  const handleTabClick = (tab: Tab) => {
    if (!hasAccess(tab.requiresPlan)) {
      const planNamesMr: Record<string, string> = { silver: 'सिल्व्हर', diamond: 'डायमंड' };
      const planNamesEn: Record<string, string> = { silver: 'Silver', diamond: 'Diamond' };
      setGateReason(
        language === 'mr'
          ? `"${tab.label_mr}" पाहण्यासाठी ${planNamesMr[tab.requiresPlan] || tab.requiresPlan} किंवा त्यावरील प्लॅन आवश्यक आहे.`
          : `"${tab.label_en}" requires a ${planNamesEn[tab.requiresPlan] || tab.requiresPlan} Plan or higher.`
      );
      setGateOpen(true);
      return;
    }
    setActiveTab(tab.key);
  };

  const endDate = subscription?.end_date
    ? new Date(subscription.end_date).toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className={dashStyles.page}>
      <div className={dashStyles.container}>

        {/* ── Welcome Header ──────────────────────────────────── */}
        <div className={dashStyles.welcomeCard}>
          <div className={dashStyles.welcomeLeft}>
            <div className={dashStyles.avatarCircle}>
              {(profile as any)?.avatar_url ? (
                <img
                  src={(profile as any).avatar_url}
                  alt={displayName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className={dashStyles.welcomeNameRow}>
                <h2 className={dashStyles.welcomeName}>
                  {language === 'mr' ? 'स्वागत,' : 'Welcome,'} {displayName}!
                </h2>
                {profile?.verification_status === 'verified' && (
                  <span className={dashStyles.verifiedBadge}>
                    <ShieldCheck size={12} />
                    {t.dashboard.statusVerified}
                  </span>
                )}
              </div>
              <p className={dashStyles.welcomeSub}>
                {user?.email}
                {profile?.profile_id && ` • ID: ${profile.profile_id}`}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut size={16} style={{ marginRight: 6 }} />
            {t.dashboard.logoutBtn}
          </Button>
        </div>

        {/* ── Profile Status Banners ──────────────────────────── */}
        {profile?.profile_status === 'pending_approval' && (
          <div className={`${dashStyles.banner} ${dashStyles.bannerBlue}`}>
            <Clock size={22} />
            <div>
              <strong>{language === 'mr' ? 'प्रोफाइल तपासणी प्रक्रियेत' : 'Profile Under Review'}</strong>
              <p>{language === 'mr' ? 'सामान्यतः २४ तासांत पडताळणी पूर्ण होते.' : 'Admin verification usually completes within 24 hours.'}</p>
            </div>
            <Button to="/profile/edit" variant="outline" size="sm">{t.dashboard.editProfileBtn}</Button>
          </div>
        )}
        {(!profile || profile.profile_status === 'draft') && (
          <div className={`${dashStyles.banner} ${dashStyles.bannerAmber}`}>
            <AlertTriangle size={22} />
            <div>
              <strong>{t.dashboard.profileIncompleteTitle}</strong>
              <p>{t.dashboard.profileIncompleteDesc}</p>
            </div>
            <Button to={profile ? '/profile/edit' : '/profile/create'} variant="primary" size="sm">
              {profile ? t.dashboard.editProfileBtn : t.dashboard.createProfileBtn}
            </Button>
          </div>
        )}

        {/* ── Stats Row ────────────────────────────────────────── */}
        <div className={dashStyles.statsRow}>
          {/* Account Status */}
          <div className={dashStyles.statCard}>
            <div className={dashStyles.statTop}>
              <span className={dashStyles.statLabel}>{t.dashboard.accountStatus}</span>
              <User size={18} color="var(--color-primary)" />
            </div>
            <div className={dashStyles.statVal}>
              {profile?.profile_status === 'approved'
                ? (language === 'mr' ? 'सक्रिय' : 'Active')
                : profile?.profile_status === 'pending_approval'
                ? (language === 'mr' ? 'तपासणी सुरू' : 'Under Review')
                : (language === 'mr' ? 'मसुदा' : 'Draft')}
            </div>
          </div>

          {/* Verification */}
          <div className={dashStyles.statCard}>
            <div className={dashStyles.statTop}>
              <span className={dashStyles.statLabel}>{t.dashboard.verificationStatus}</span>
              <ShieldCheck size={18} color="var(--color-primary)" />
            </div>
            <div className={dashStyles.statVal} style={{ color: profile?.verification_status === 'verified' ? '#15803D' : profile?.verification_status === 'rejected' ? '#DC2626' : '#D97706' }}>
              {profile?.verification_status === 'verified'
                ? (language === 'mr' ? 'पडताळणी झालेले' : 'Verified')
                : profile?.verification_status === 'rejected'
                ? (language === 'mr' ? 'अस्वीकृत' : 'Rejected')
                : (language === 'mr' ? 'प्रतीक्षेत' : 'Pending')}
            </div>
          </div>

          {/* Membership */}
          <div className={dashStyles.statCard} style={planInfo ? { background: planInfo.bgColor, borderColor: planInfo.borderColor } : undefined}>
            <div className={dashStyles.statTop}>
              <span className={dashStyles.statLabel}>{t.dashboard.membershipPlan}</span>
              <Crown size={18} color="#C59A45" />
            </div>
            {subLoading ? (
              <div className={dashStyles.statSkeleton} />
            ) : subscription && planInfo ? (
              <div>
                <div className={dashStyles.statVal} style={{ color: planInfo.color }}>
                  {planInfo.emoji} {language === 'mr' ? planInfo.label_mr : (subscription.plan?.name || 'Premium')}
                </div>
                {endDate && (
                  <div className={dashStyles.statMeta}>
                    <Calendar size={11} />
                    <span>{language === 'mr' ? `वैधता: ${endDate} पर्यंत` : `Valid till ${endDate}`}</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className={dashStyles.statVal}>{language === 'mr' ? 'मोफत' : 'Free'}</span>
                <Link to="/membership" className={dashStyles.upgradeLink}>
                  {t.dashboard.upgradeBtn} <ChevronRight size={12} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── 7-Tab Activity Panel ─────────────────────────────── */}
        <div className={dashStyles.activityPanel}>
          <div className={dashStyles.tabBar}>
            {TABS.map((tab) => {
              const unlocked = hasAccess(tab.requiresPlan);
              const isActive = activeTab === tab.key && unlocked;
              return (
                <button
                  key={tab.key}
                  className={`${dashStyles.tabBtn} ${isActive ? dashStyles.tabBtnActive : ''} ${!unlocked ? dashStyles.tabBtnLocked : ''}`}
                  onClick={() => handleTabClick(tab)}
                  type="button"
                  title={!unlocked ? (language === 'mr' ? `${tab.requiresPlan === 'silver' ? 'सिल्व्हर' : 'डायमंड'} प्लॅन आवश्यक` : `Requires ${tab.requiresPlan} plan`) : undefined}
                >
                  {tab.icon}
                  <span>{language === 'mr' ? tab.label_mr : tab.label_en}</span>
                  {!unlocked && <Lock size={11} className={dashStyles.tabLockIcon} />}
                </button>
              );
            })}
          </div>

          <div className={dashStyles.tabContent}>
            {activeTab === 'matchmaking'    && <MatchmakingTab language={language} profiles={matchProfiles} />}
            {activeTab === 'recommendations'&& <RecommendationsTab language={language} profiles={recoProfiles} />}
            {activeTab === 'viewed_by_me'   && <ViewedByMeTab language={language} profiles={viewedProfiles} />}
            {activeTab === 'who_viewed_me'  && <WhoViewedMeTab language={language} profiles={interestProfiles} />}
            {activeTab === 'interests'      && <InterestsTab language={language} profiles={interestProfiles} />}
            {activeTab === 'contact_viewers'&& <ContactViewersTab language={language} profiles={interestProfiles} />}
            {activeTab === 'contacts_by_me' && <ContactsByMeTab language={language} profiles={viewedProfiles} />}
          </div>
        </div>

        {/* ── Quick Actions ─────────────────────────────────────── */}
        <div className={dashStyles.quickActions}>
          <Link to="/search" className={dashStyles.actionCard}>
            <div className={dashStyles.actionIcon} style={{ background: '#EDE9FE', color: '#7C3AED' }}>
              <Search size={22} />
            </div>
            <div className={dashStyles.actionText}>
              <strong>{t.nav.search}</strong>
              <span>{t.searchPage.subtitle}</span>
            </div>
            <ChevronRight size={18} className={dashStyles.actionArrow} />
          </Link>
          <Link to="/shortlists" className={dashStyles.actionCard}>
            <div className={dashStyles.actionIcon} style={{ background: '#FEF3C7', color: '#D97706' }}>
              <Bookmark size={22} />
            </div>
            <div className={dashStyles.actionText}>
              <strong>{t.dashboard.myShortlists}</strong>
              <span>{t.dashboard.shortlistsDesc}</span>
            </div>
            <ChevronRight size={18} className={dashStyles.actionArrow} />
          </Link>
          <Link to="/membership" className={dashStyles.actionCard}>
            <div className={dashStyles.actionIcon} style={{ background: '#FEE2E2', color: '#E11D48' }}>
              <Crown size={22} />
            </div>
            <div className={dashStyles.actionText}>
              <strong>
                {subscription
                  ? (language === 'mr' ? 'सदस्यत्व व्यवस्थापन' : 'Manage Subscription')
                  : (language === 'mr' ? 'प्लॅन अपग्रेड करा' : 'Upgrade Plan')}
              </strong>
              <span>
                {subscription
                  ? (language === 'mr' ? `${subscription.plan?.name} सक्रिय` : `${subscription.plan?.name} active`)
                  : (language === 'mr' ? 'सिल्व्हर, डायमंड, प्लॅटिनम' : 'Silver, Diamond, Platinum')}
              </span>
            </div>
            <ChevronRight size={18} className={dashStyles.actionArrow} />
          </Link>
          <Link to="/admin" className={dashStyles.actionCard}>
            <div className={dashStyles.actionIcon} style={{ background: '#E0F2FE', color: '#0284C7' }}>
              <ShieldCheck size={22} />
            </div>
            <div className={dashStyles.actionText}>
              <strong>{language === 'mr' ? 'प्रशासन व पडताळणी' : 'Admin & Verifications'}</strong>
              <span>{language === 'mr' ? 'सर्व प्रोफाइल्स, आधार पडताळणी व मंजुरी' : 'Review & approve all profiles'}</span>
            </div>
            <ChevronRight size={18} className={dashStyles.actionArrow} />
          </Link>
        </div>
      </div>

      <SubscriptionGate
        isOpen={gateOpen}
        onClose={() => setGateOpen(false)}
        reason={gateReason}
      />
    </div>
  );
};

// ── Tab Panels ────────────────────────────────────────────────────────────────

const ProfileMiniCard: React.FC<{ p: any; lang: string }> = ({ p, lang }) => (
  <Link to={`/profile/${p.id}`} className={dashStyles.miniCard}>
    <div className={dashStyles.miniPhoto}>
      {p.photoUrl
        ? <img src={p.photoUrl} alt={p.name?.en || ''} />
        : <div className={dashStyles.miniPhotoPlaceholder}>{(p.name?.en || 'M').charAt(0)}</div>
      }
    </div>
    <div className={dashStyles.miniInfo}>
      <div className={dashStyles.miniName}>{lang === 'mr' ? p.name?.mr : p.name?.en}</div>
      <div className={dashStyles.miniMeta}>
        {p.age} {lang === 'mr' ? 'वर्षे' : 'yrs'} • {lang === 'mr' ? p.city?.mr : p.city?.en}
      </div>
      <div className={dashStyles.miniSub}>{lang === 'mr' ? p.occupation?.mr : p.occupation?.en}</div>
    </div>
    <div className={dashStyles.miniArrow}><ChevronRight size={16} /></div>
  </Link>
);

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className={dashStyles.emptyState}>
    <div className={dashStyles.emptyIcon}>{icon}</div>
    <h3 className={dashStyles.emptyTitle}>{title}</h3>
    <p className={dashStyles.emptyDesc}>{desc}</p>
  </div>
);

const MatchmakingTab: React.FC<{ language: string; profiles: Profile[] }> = ({ language: lang, profiles }) => (
  <div>
    <div className={dashStyles.tabHeader}>
      <Sparkles size={18} />
      <div>
        <h3>{lang === 'mr' ? 'जुळवाजुळव प्रोफाइल' : 'Matchmaking Profiles'}</h3>
        <p>{lang === 'mr' ? 'तुमच्या प्राधान्यांवर आधारित जुळलेले प्रोफाइल' : 'Profiles matched based on your partner preferences'}</p>
      </div>
    </div>
    <div className={dashStyles.miniCardList}>
      {profiles.map((p) => <ProfileMiniCard key={p.id} p={p} lang={lang} />)}
    </div>
  </div>
);

const RecommendationsTab: React.FC<{ language: string; profiles: Profile[] }> = ({ language: lang, profiles }) => (
  <div>
    <div className={dashStyles.tabHeader}>
      <Star size={18} />
      <div>
        <h3>{lang === 'mr' ? 'शिफारस केलेल्या प्रोफाइल' : 'Recommended Profiles'}</h3>
        <p>{lang === 'mr' ? 'आमच्या तज्ज्ञांनी तुमच्यासाठी निवडलेल्या प्रोफाइल' : 'Hand-picked profiles selected by our experts for you'}</p>
      </div>
    </div>
    <div className={dashStyles.miniCardList}>
      {profiles.map((p) => <ProfileMiniCard key={p.id} p={p} lang={lang} />)}
    </div>
  </div>
);

const ViewedByMeTab: React.FC<{ language: string; profiles: Profile[] }> = ({ language: lang, profiles }) => (
  <div>
    <div className={dashStyles.tabHeader}>
      <Eye size={18} />
      <div>
        <h3>{lang === 'mr' ? 'मी पाहिलेल्या प्रोफाइल' : 'Profiles Viewed by Me'}</h3>
        <p>{lang === 'mr' ? 'तुम्ही नुकत्याच पाहिलेल्या प्रोफाइलचा इतिहास' : 'History of profiles you have recently browsed'}</p>
      </div>
    </div>
    {profiles.length === 0 ? (
      <EmptyState
        icon={<Eye size={32} />}
        title={lang === 'mr' ? 'अजून कोणताही इतिहास नाही' : 'No browsing history yet'}
        desc={lang === 'mr' ? 'इथे तुमचा इतिहास पाहण्यासाठी स्थळे शोधणे सुरू करा.' : 'Start browsing profiles to see your history here.'}
      />
    ) : (
      <div className={dashStyles.miniCardList}>
        {profiles.map((p) => <ProfileMiniCard key={p.id} p={p} lang={lang} />)}
      </div>
    )}
  </div>
);

const WhoViewedMeTab: React.FC<{ language: string; profiles: Profile[] }> = ({ language: lang, profiles }) => (
  <div>
    <div className={dashStyles.tabHeader}>
      <UserCheck size={18} />
      <div>
        <h3>{lang === 'mr' ? 'माझी प्रोफाइल कोणी पाहिली' : 'Who Viewed My Profile'}</h3>
        <p>{lang === 'mr' ? 'गेल्या ३० दिवसांत तुमची प्रोफाइल पाहणारे सदस्य' : 'Members who visited your profile in the last 30 days'}</p>
      </div>
    </div>
    <div className={dashStyles.miniCardList}>
      {profiles.map((p) => <ProfileMiniCard key={p.id} p={p} lang={lang} />)}
    </div>
  </div>
);

const InterestsTab: React.FC<{ language: string; profiles: Profile[] }> = ({ language: lang }) => {
  const { user, profile } = useAuth();
  const [subTab, setSubTab] = useState<'received' | 'sent'>('received');
  const [sentItems, setSentItems] = useState<{ profile: Profile; status: string; sentAt: string }[]>([]);
  const [receivedItems, setReceivedItems] = useState<{ profile: Profile; status: string; receivedAt: string; id: string }[]>([]);

  useEffect(() => {
    const userProfileId = profile?.id || user?.id;

    // 1. Sent: profiles that the current user expressed interest to
    const rawSent = interestService.getSentInterests(userProfileId);
    const mappedSent = rawSent
      .map((item) => {
        const found = mockProfiles.find((p) => p.id === item.receiverProfileId || p.profileId === item.receiverProfileId);
        if (!found) return null;
        return { profile: found, status: item.status, sentAt: item.sentAt };
      })
      .filter(Boolean) as { profile: Profile; status: string; sentAt: string }[];
    setSentItems(mappedSent);

    // 2. Received: interests sent to the current user by candidates
    const rawReceived = interestService.getReceivedInterests(userProfileId);
    const mappedReceived = rawReceived
      .map((item) => {
        const found = mockProfiles.find((p) => p.id === item.senderProfileId || p.profileId === item.senderProfileId);
        if (!found) return null;
        return { profile: found, status: item.status, receivedAt: item.receivedAt, id: item.id };
      })
      .filter(Boolean) as { profile: Profile; status: string; receivedAt: string; id: string }[];
    setReceivedItems(mappedReceived);
  }, [profile?.id, user?.id, subTab]);

  const handleRespond = async (interestId: string, candidateProfileId: string, newStatus: 'accepted' | 'declined') => {
    const userProfileId = profile?.id || user?.id || '';
    await interestService.respondToInterest(interestId, userProfileId, newStatus, candidateProfileId);
    setReceivedItems((prev) =>
      prev.map((i) => (i.id === interestId ? { ...i, status: newStatus } : i))
    );
  };

  return (
    <div>
      <div className={dashStyles.tabHeader}>
        <Heart size={18} />
        <div>
          <h3>{lang === 'mr' ? 'पसंती / Express Interest' : 'Interests'}</h3>
          <p>{lang === 'mr' ? 'मिळालेल्या व पाठवलेल्या पसंती' : 'Interests received and sent by you'}</p>
        </div>
      </div>
      <div className={dashStyles.subTabs}>
        <button
          className={`${dashStyles.subTab} ${subTab === 'received' ? dashStyles.subTabActive : ''}`}
          onClick={() => setSubTab('received')}
        >
          {lang === 'mr' ? 'मिळालेल्या पसंती' : 'Received'} ({receivedItems.length})
        </button>
        <button
          className={`${dashStyles.subTab} ${subTab === 'sent' ? dashStyles.subTabActive : ''}`}
          onClick={() => setSubTab('sent')}
        >
          {lang === 'mr' ? 'पाठवलेल्या पसंती' : 'Sent'} ({sentItems.length})
        </button>
      </div>

      {subTab === 'sent' && (
        sentItems.length === 0 ? (
          <EmptyState
            icon={<Heart size={32} />}
            title={lang === 'mr' ? 'अजून कोणतीही पसंती पाठवलेली नाही' : 'No interests sent yet'}
            desc={lang === 'mr' ? 'स्थळे शोधा आणि आपल्या पसंतीच्या स्थळांना "पसंती दर्शवा" (Express Interest) वर क्लिक करा.' : 'Explore compatible matches and express interest to start a conversation.'}
          />
        ) : (
          <div className={dashStyles.miniCardList}>
            {sentItems.map((item) => (
              <div key={item.profile.id} className={dashStyles.interestRow}>
                <ProfileMiniCard p={item.profile} lang={lang} />
                <div className={dashStyles.interestStatus}>
                  <span className={dashStyles.statusSent}>
                    {item.status === 'accepted'
                      ? (lang === 'mr' ? 'स्वीकारले' : 'Accepted')
                      : item.status === 'declined'
                      ? (lang === 'mr' ? 'नकार दिला' : 'Declined')
                      : (lang === 'mr' ? 'पाठवले • प्रतीक्षेत' : 'Sent • Pending')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {subTab === 'received' && (
        receivedItems.length === 0 ? (
          <EmptyState
            icon={<Heart size={32} />}
            title={lang === 'mr' ? 'अजून कोणतीही पसंती मिळालेली नाही' : 'No interests received yet'}
            desc={lang === 'mr' ? 'आपले प्रोफाइल पूर्ण आणि सक्रिय ठेवा, जेणेकरून सुयोग्य स्थळे आपल्या प्रोफाइलमध्ये पसंती दर्शवू शकतील.' : 'Keep your profile complete and verified so matching candidates can connect with you.'}
          />
        ) : (
          <div className={dashStyles.miniCardList}>
            {receivedItems.map((item) => (
              <div key={item.profile.id} className={dashStyles.interestRow}>
                <ProfileMiniCard p={item.profile} lang={lang} />
                <div className={dashStyles.interestStatus}>
                  <span className={item.status === 'accepted' ? dashStyles.statusSent : dashStyles.statusPending}>
                    {item.status === 'accepted'
                      ? (lang === 'mr' ? 'स्वीकारले' : 'Accepted')
                      : item.status === 'declined'
                      ? (lang === 'mr' ? 'नकार दिला' : 'Declined')
                      : (lang === 'mr' ? 'प्रतीक्षेत' : 'Pending')}
                  </span>
                  {item.status === 'pending' && (
                    <div className={dashStyles.interestActions}>
                      <button
                        className={dashStyles.acceptBtn}
                        onClick={() => handleRespond(item.id, item.profile.id, 'accepted')}
                      >
                        {lang === 'mr' ? 'स्वीकारा' : 'Accept'}
                      </button>
                      <button
                        className={dashStyles.declineBtn}
                        onClick={() => handleRespond(item.id, item.profile.id, 'declined')}
                      >
                        {lang === 'mr' ? 'नकार द्या' : 'Decline'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

const ContactViewersTab: React.FC<{ language: string; profiles: Profile[] }> = ({ language: lang, profiles }) => (
  <div>
    <div className={dashStyles.tabHeader}>
      <PhoneCall size={18} />
      <div>
        <h3>{lang === 'mr' ? 'माझा फोन नंबर कोणी पाहिला' : 'Who Viewed My Contact Number'}</h3>
        <p>{lang === 'mr' ? 'तुमचा फोन नंबर अनलॉक केलेले सदस्य' : 'Members who have unlocked your phone number'}</p>
      </div>
    </div>
    <div className={dashStyles.miniCardList}>
      {profiles.slice(0, 2).map((p) => (
        <div key={p.id} className={dashStyles.contactViewRow}>
          <ProfileMiniCard p={p} lang={lang} />
          <span className={dashStyles.viewedOnTag}>
            <Clock size={11} /> {lang === 'mr' ? 'आत्ताच' : 'Just now'}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const ContactsByMeTab: React.FC<{ language: string; profiles: Profile[] }> = ({ language: lang, profiles }) => (
  <div>
    <div className={dashStyles.tabHeader}>
      <Phone size={18} />
      <div>
        <h3>{lang === 'mr' ? 'मी पाहिलेले फोन नंबर' : 'Contact Numbers Viewed by Me'}</h3>
        <p>{lang === 'mr' ? 'तुम्ही अनलॉक केलेले फोन नंबर' : 'Phone numbers you have unlocked'}</p>
      </div>
    </div>
    <div className={dashStyles.miniCardList}>
      {profiles.slice(0, 3).map((p) => (
        <div key={p.id} className={dashStyles.contactViewRow}>
          <ProfileMiniCard p={p} lang={lang} />
          <div className={dashStyles.unlockedContact}>
            <Phone size={12} />
            <span>+91 98765 •••••</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
