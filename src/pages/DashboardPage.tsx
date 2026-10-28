import React, { useState } from 'react';
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
import { PLAN_DISPLAY_INFO } from '../services/subscription.service';
import { PremiumFeature, useSubscription } from '../context/SubscriptionContext';
import {
  MatchmakingTab,
  RecommendationsTab,
  ViewedByMeTab,
  WhoViewedMeTab,
  InterestsTab,
  ContactViewersTab,
  ContactsByMeTab,
  NewProfilesTab,
  ConciergeCard,
} from '../components/premium/DashboardTabs';
import dashStyles from './DashboardPage.module.css';

// ── Tab definitions ──────────────────────────────────────────────────────────

type TabKey =
  | 'matchmaking'
  | 'recommendations'
  | 'new_profiles'
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
  /** Feature that unlocks the tab (checked in the database); undefined = free */
  feature?: PremiumFeature;
  /** Plan name shown in the upgrade prompt */
  planLabel?: string;
}

const TABS: Tab[] = [
  { key: 'matchmaking',    label_en: 'Matchmaking',         label_mr: 'जुळवाजुळव',         icon: <Sparkles size={16} />,   feature: 'matchmaking',          planLabel: 'Silver' },
  { key: 'recommendations',label_en: 'Recommendations',     label_mr: 'शिफारसी',            icon: <Star size={16} />,       feature: 'recommendations',      planLabel: 'Silver' },
  { key: 'new_profiles',   label_en: 'New Profiles',        label_mr: 'नवीन प्रोफाइल',      icon: <Sparkles size={16} /> },
  { key: 'viewed_by_me',   label_en: 'Profiles I Viewed',   label_mr: 'मी पाहिलेल्या',      icon: <Eye size={16} /> },
  { key: 'who_viewed_me',  label_en: 'Who Viewed Me',       label_mr: 'माझी प्रोफाइल पाहणारे', icon: <UserCheck size={16} />,  feature: 'view_who_viewed_me',   planLabel: 'Silver' },
  { key: 'interests',      label_en: 'Interests',           label_mr: 'पसंती',              icon: <Heart size={16} /> },
  { key: 'contact_viewers',label_en: 'Contact Viewers',     label_mr: 'फोन पाहणारे',        icon: <PhoneCall size={16} />,  feature: 'view_contact_viewers', planLabel: 'Diamond' },
  { key: 'contacts_by_me', label_en: 'Contacts I Viewed',   label_mr: 'मी पाहिलेले फोन',   icon: <Phone size={16} />,      feature: 'view_my_unlocks',      planLabel: 'Silver' },
];

// ── Main Component ────────────────────────────────────────────────────────────

export const DashboardPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>('interests');
  const [gateOpen, setGateOpen] = useState(false);
  const [gateReason, setGateReason] = useState('');
  const ent = useSubscription();

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member');

  const currentPlanSlug = ent.plan === 'none' ? null : ent.plan;
  const planInfo = currentPlanSlug ? PLAN_DISPLAY_INFO[currentPlanSlug] : null;
  const subLoading = ent.loading;
  const subscription = currentPlanSlug ? { plan: { name: `${planInfo?.label_en} Plan` } } : null;

  const hasAccess = (tab: Tab): boolean => !tab.feature || ent.has(tab.feature);

  const handleTabClick = (tab: Tab) => {
    if (!hasAccess(tab)) {
      setGateReason(
        language === 'mr'
          ? `"${tab.label_mr}" पाहण्यासाठी ${tab.planLabel} किंवा त्यावरील प्लॅन आवश्यक आहे.`
          : `"${tab.label_en}" requires a ${tab.planLabel} Plan or higher.`
      );
      setGateOpen(true);
      return;
    }
    setActiveTab(tab.key);
  };

  const endDate = ent.expiresAt
    ? new Date(ent.expiresAt).toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
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

        {ent.plan === 'platinum' && !ent.isAdmin && (
          <div style={{ marginBottom: 16 }}><ConciergeCard language={language} profileCode={profile?.profile_id} /></div>
        )}

        {/* ── Activity Panel ─────────────────────────────── */}
        <div className={dashStyles.activityPanel}>
          <div className={dashStyles.tabBar}>
            {TABS.map((tab) => {
              const unlocked = hasAccess(tab);
              const isActive = activeTab === tab.key && unlocked;
              return (
                <button
                  key={tab.key}
                  className={`${dashStyles.tabBtn} ${isActive ? dashStyles.tabBtnActive : ''} ${!unlocked ? dashStyles.tabBtnLocked : ''}`}
                  onClick={() => handleTabClick(tab)}
                  type="button"
                  title={!unlocked ? (language === 'mr' ? `${tab.planLabel} प्लॅन आवश्यक` : `Requires ${tab.planLabel} plan`) : undefined}
                >
                  {tab.icon}
                  <span>{language === 'mr' ? tab.label_mr : tab.label_en}</span>
                  {!unlocked && <Lock size={11} className={dashStyles.tabLockIcon} />}
                </button>
              );
            })}
          </div>

          <div className={dashStyles.tabContent}>
            {activeTab === 'matchmaking'    && <MatchmakingTab language={language} />}
            {activeTab === 'recommendations'&& <RecommendationsTab language={language} />}
            {activeTab === 'new_profiles'   && <NewProfilesTab language={language} />}
            {activeTab === 'viewed_by_me'   && <ViewedByMeTab language={language} onUpgrade={() => { setGateReason(language === 'mr' ? 'संपूर्ण इतिहासासाठी डायमंड प्लॅन आवश्यक आहे.' : 'Full view history requires a Diamond plan or higher.'); setGateOpen(true); }} />}
            {activeTab === 'who_viewed_me'  && <WhoViewedMeTab language={language} />}
            {activeTab === 'interests'      && <InterestsTab language={language} />}
            {activeTab === 'contact_viewers'&& <ContactViewersTab language={language} />}
            {activeTab === 'contacts_by_me' && <ContactsByMeTab language={language} />}
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

