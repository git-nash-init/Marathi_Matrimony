import React from 'react';
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
  Clock
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export const DashboardPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member');

  return (
    <div className="section" style={{ background: 'var(--color-bg)', minHeight: '80vh', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Welcome Header */}
        <div className="card" style={{ padding: '28px 32px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.4rem'
            }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--color-dark)', fontWeight: 800, margin: 0 }}>
                  {t.dashboard.welcome}, {displayName}!
                </h2>
                {profile?.verification_status === 'verified' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#DCFCE7', color: '#15803D', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                    <ShieldCheck size={12} /> {t.dashboard.statusVerified}
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                {user?.email} {profile?.profile_id && `• ID: ${profile.profile_id}`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut size={16} style={{ marginRight: '6px' }} />
              {t.dashboard.logoutBtn}
            </Button>
          </div>
        </div>

        {/* Profile Pending Review Banner */}
        {profile && profile.profile_status === 'pending_approval' && (
          <div className="card" style={{ padding: '24px 28px', marginBottom: '24px', background: '#EFF6FF', borderColor: '#BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', maxWidth: '650px' }}>
              <div style={{ color: '#2563EB', marginTop: '2px' }}>
                <Clock size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#1E40AF', fontWeight: 700, marginBottom: '4px' }}>
                  {profile.completion_percentage ? `${profile.completion_percentage}% ` : ''}
                  {language === 'mr' ? 'प्रोफाइल तपासणी प्रक्रियेत आहे' : 'Profile Under Admin Review'}
                </h3>
                <p style={{ color: '#1E3A8A', fontSize: '0.88rem', margin: 0 }}>
                  {language === 'mr'
                    ? 'आपली प्रोफाइल आमच्या प्रशासक टीमकडे पडताळणीसाठी सादर केली आहे. (सामान्यतः २४ तासांत पडताळणी पूर्ण होते).'
                    : 'Your profile has been submitted for admin verification (usually completes within 24 hours).'}
                </p>
              </div>
            </div>
            <Button to="/profile/edit" variant="outline" size="md">
              {t.dashboard.editProfileBtn}
            </Button>
          </div>
        )}

        {/* Profile Incomplete Banner if no profile or status is draft */}
        {(!profile || profile.profile_status === 'draft') && (
          <div className="card" style={{ padding: '24px 28px', marginBottom: '24px', background: '#FFFBEB', borderColor: '#FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', maxWidth: '600px' }}>
              <div style={{ color: '#D97706', marginTop: '2px' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#92400E', fontWeight: 700, marginBottom: '4px' }}>
                  {profile?.completion_percentage
                    ? `(${profile.completion_percentage}% ${language === 'mr' ? 'पूर्ण' : 'Complete'}) `
                    : ''}
                  {t.dashboard.profileIncompleteTitle}
                </h3>
                <p style={{ color: '#B45309', fontSize: '0.88rem', margin: 0 }}>
                  {t.dashboard.profileIncompleteDesc}
                </p>
              </div>
            </div>
            {!profile ? (
              <Button to="/profile/create" variant="primary" size="md">
                {t.dashboard.createProfileBtn}
              </Button>
            ) : (
              <Button to="/profile/edit" variant="primary" size="md">
                {t.dashboard.editProfileBtn}
              </Button>
            )}
          </div>
        )}

        {/* Overview Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {/* Account Status */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                {t.dashboard.accountStatus}
              </span>
              <User size={18} color="var(--color-primary)" />
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-dark)' }}>
              {profile?.profile_status === 'approved' ? t.dashboard.statusActive : t.dashboard.statusDraft}
            </div>
          </div>

          {/* Verification Status */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                {t.dashboard.verificationStatus}
              </span>
              <ShieldCheck size={18} color="var(--color-primary)" />
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: profile?.verification_status === 'verified' ? '#15803D' : '#D97706' }}>
              {profile?.verification_status === 'verified' ? t.dashboard.statusVerified : t.dashboard.statusUnverified}
            </div>
          </div>

          {/* Membership Plan */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                {t.dashboard.membershipPlan}
              </span>
              <Crown size={18} color="#C59A45" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-dark)' }}>{t.dashboard.planFree}</span>
              <Link to="/membership" style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                {t.dashboard.upgradeBtn}
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Search Profiles Card */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}>
                <Search size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: 'var(--color-dark)' }}>
                {t.nav.search}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
                {t.searchPage.subtitle}
              </p>
            </div>
            <Button to="/search" variant="primary" size="md" fullWidth>
              {t.nav.search}
            </Button>
          </div>

          {/* Interests Card */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: '#FEE2E2',
                color: '#E11D48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}>
                <Heart size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: 'var(--color-dark)' }}>
                {t.dashboard.myInterests}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
                {t.dashboard.interestsDesc}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button to="/search" variant="primary" size="md" fullWidth>
                <Heart size={16} style={{ marginRight: '6px' }} />
                {language === 'mr' ? 'पसंती पाठवलेली स्थळे पहा' : 'View Expressed Interests'}
              </Button>
              <Button to="/search" variant="outline" size="md" fullWidth>
                <Clock size={16} style={{ marginRight: '6px' }} />
                {t.dashboard.browseMatchesBtn}
              </Button>
            </div>
          </div>

          {/* Shortlists Card */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}>
                <Bookmark size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: 'var(--color-dark)' }}>
                {t.dashboard.myShortlists}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
                {t.dashboard.shortlistsDesc}
              </p>
            </div>
            <Button to="/shortlists" variant="outline" size="md" fullWidth>
              {t.dashboard.viewSavedBtn}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
