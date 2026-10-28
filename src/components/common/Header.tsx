import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationBell } from './NotificationBell';
import { shortlistService } from '../../services/shortlist.service';
import { ShortlistBookmarkIcon } from './CulturalIcons';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { t, brandName, language } = useLanguage();
  const { isAuthenticated, user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [shortlistCount, setShortlistCount] = useState(0);

  const isHomePage = location.pathname === '/';
  const isTransparent = isHomePage && !isScrolled;

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const userProfileId = profile?.id || user?.id;

  // Sync shortlist counter strictly for current user
  useEffect(() => {
    let isMounted = true;
    shortlistService.getShortlistedIds(userProfileId).then((ids) => {
      if (isMounted) setShortlistCount(ids.length);
    });
    const unsubscribe = shortlistService.subscribe(() => {
      shortlistService.getShortlistedIds(userProfileId).then((ids) => {
        if (isMounted) setShortlistCount(ids.length);
      });
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [userProfileId]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  // Streamlined, uncluttered desktop navigation links
  const desktopNavLinks = [
    { to: '/search', label: language === 'mr' ? 'स्थळे शोधा' : 'Matches' },
    { to: '/success-stories', label: language === 'mr' ? 'विवाहगाथा' : 'Stories' },
    { to: '/membership', label: language === 'mr' ? 'योजना' : 'Plans' },
    { to: '/wedding-services', label: language === 'mr' ? 'लग्न सेवा' : 'Services' },
    { to: '/contact', label: language === 'mr' ? 'संपर्क' : 'Contact' },
  ];

  // Full navigation links for the mobile drawer
  const mobileNavLinks = [
    { to: '/', label: t.nav.home },
    { to: '/search', label: t.nav.search },
    { to: '/shortlist', label: t.shortlist?.title || (language === 'mr' ? 'शॉर्टलिस्ट स्थळे' : 'Shortlisted') },
    { to: '/success-stories', label: t.nav.successStories },
    { to: '/membership', label: t.nav.membership },
    { to: '/wedding-services', label: language === 'mr' ? 'लग्न सेवा' : 'Wedding Services' },
    { to: '/admin', label: language === 'mr' ? 'प्रशासन (Admin)' : 'Admin Portal' },
    { to: '/how-it-works', label: t.nav.howItWorks },
    { to: '/about', label: t.nav.aboutUs },
    { to: '/contact', label: t.nav.contact }
  ];

  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member');
  const avatarUrl = (profile as any)?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <header 
      className={`
        ${styles.header} 
        ${isScrolled ? styles.scrolled : ''} 
        ${isHomePage ? styles.homeHeader : styles.innerHeader} 
        ${isTransparent ? styles.transparentMode : styles.solidMode}
      `}
    >
      {/* Main Navigation Bar with Glassmorphism */}
      <div className={styles.mainNav}>
        <div className="container">
          <div className={styles.navWrapper}>
            {/* Logo */}
            <Link to="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <img
                  src="/images/brand/logo.png"
                  alt={brandName}
                  className={styles.brandLogoImg}
                />
              </div>
              <div className={styles.logoTextGroup}>
                <span className={styles.brandTitle}>{brandName}</span>
              </div>
            </Link>

            {/* Desktop Navigation Links - Centered, Uncluttered, Spaced with Glassmorphism */}
            <nav className={styles.desktopNav} aria-label="Main Navigation">
              {desktopNavLinks.map(link => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Cluster */}
            <div className={styles.rightActions}>
              {/* Shortlist Icon with Counter */}
              <Link
                to="/shortlist"
                className={styles.shortlistBtn}
                title={language === 'mr' ? 'शॉर्टलिस्ट स्थळे' : 'Shortlisted Profiles'}
                aria-label="Shortlist"
              >
                <ShortlistBookmarkIcon 
                  size={18} 
                  color={isTransparent ? '#DFC17B' : 'var(--color-oxblood)'} 
                />
                {shortlistCount > 0 && (
                  <span className={styles.shortlistBadge}>{shortlistCount}</span>
                )}
              </Link>

              {/* Notification Bell with unread counter & real-time popup */}
              <NotificationBell isTransparent={isTransparent} />

              {/* Compact 'आ / A' Glass Language Switcher */}
              <LanguageSwitcher variant="header" isGlass={isTransparent} />
              
              {isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Link to="/dashboard" className={styles.userProfilePill}>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1.5px solid var(--color-gold, #C59A45)',
                          flexShrink: 0
                        }}
                      />
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    )}
                    <span>{displayName}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={styles.logoutBtn}
                    title={t.dashboard.logoutBtn}
                    aria-label={t.dashboard.logoutBtn}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  </button>
                </div>
              ) : (
                <div className={styles.authButtonsGroup}>
                  <Link to="/login" className={styles.loginLink}>
                    {t.nav.login}
                  </Link>
                  <Link to="/register" className={styles.registerBtn}>
                    {t.nav.registerFree}
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                className={styles.hamburgerBtn}
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer portaled to document.body so it escapes header backdrop-filter & stacking context */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div
          className={styles.mobileDrawerBackdrop}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className={styles.mobileDrawer}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            <div className={styles.mobileDrawerHeader}>
              <div className={styles.drawerLogoWrap}>
                <div className={styles.drawerLogoIcon}>
                  <img
                    src="/images/brand/logo.png"
                    alt={brandName}
                    className={styles.brandLogoImg}
                  />
                </div>
                <span className={styles.drawerBrandTitle}>{brandName}</span>
              </div>
              <button
                type="button"
                className={styles.drawerCloseBtn}
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className={styles.mobileLangSection}>
              <LanguageSwitcher variant="inline" />
            </div>

            <nav className={styles.mobileNavLinks} aria-label="Mobile Navigation">
              {mobileNavLinks.map(link => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`${styles.mobileNavLink} ${isActive ? styles.active : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className={styles.mobileAuthActions}>
              {isAuthenticated ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link 
                    to="/dashboard" 
                    className={styles.mobileUserLink}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1.5px solid var(--color-gold, #C59A45)',
                          flexShrink: 0
                        }}
                      />
                    ) : null}
                    <span>{t.nav.dashboard} ({displayName})</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className={styles.mobileLogoutBtn}
                  >
                    {t.dashboard.logoutBtn}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link 
                    to="/login" 
                    className={styles.mobileLoginBtn}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.login}
                  </Link>
                  <Link 
                    to="/register" 
                    className={styles.mobileRegisterBtn}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.registerFree}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
