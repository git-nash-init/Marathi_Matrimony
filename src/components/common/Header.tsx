import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { shortlistService } from '../../services/shortlist.service';
import {
  VerifiedShieldIcon,
  WhatsAppCrestIcon,
  ShortlistBookmarkIcon
} from './CulturalIcons';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { t, brandName, language } = useLanguage();
  const { isAuthenticated, user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [shortlistCount, setShortlistCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync shortlist counter
  useEffect(() => {
    let isMounted = true;
    shortlistService.getShortlistedIds().then((ids) => {
      if (isMounted) setShortlistCount(ids.length);
    });
    const unsubscribe = shortlistService.subscribe(() => {
      shortlistService.getShortlistedIds().then((ids) => {
        if (isMounted) setShortlistCount(ids.length);
      });
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

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
    { to: '/how-it-works', label: t.nav.howItWorks },
    { to: '/about', label: t.nav.aboutUs },
    { to: '/contact', label: t.nav.contact }
  ];

  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      {/* Top micro bar with cultural trust badge and verified helpline */}
      <div className={styles.topMicroBar}>
        <div className="container">
          <div className={styles.topMicroContent}>
            <span className={styles.topBadge}>
              <VerifiedShieldIcon size={14} className={styles.topIcon} color="#F5EBDD" />
              <span>{language === 'mr' ? '१००% पडताळणी झालेले ९६ कुळी मराठा प्रोफाइल्स' : '100% Verified 96 Kuli Maratha Profiles'}</span>
            </span>
            <div className={styles.topRight}>
              <a
                href="https://wa.me/917208659356"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.supportLink}
                aria-label="WhatsApp Helpline"
              >
                <WhatsAppCrestIcon size={14} color="#25D366" />
                <span>+91 72086 59356</span>
              </a>
            </div>
          </div>
        </div>
      </div>

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
                <span className={styles.brandSub}>{t.topBar.brandSub}</span>
              </div>
            </Link>

            {/* Desktop Navigation Links - Centered, Uncluttered, Spaced */}
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
                <ShortlistBookmarkIcon size={18} color="var(--color-oxblood)" />
                {shortlistCount > 0 && (
                  <span className={styles.shortlistBadge}>{shortlistCount}</span>
                )}
              </Link>

              <LanguageSwitcher variant="header" />
              
              {isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Link to="/dashboard" className={styles.userProfilePill}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className={styles.mobileDrawerBackdrop}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className={styles.mobileDrawer}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.mobileDrawerHeader}>
              <div className={styles.logo}>
                <div className={styles.logoIcon}>
                  <img
                    src="/images/brand/logo.png"
                    alt={brandName}
                    className={styles.brandLogoImg}
                  />
                </div>
                <span className={styles.brandTitle} style={{ fontSize: '1.15rem' }}>{brandName}</span>
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
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className={styles.mobileAuthActions}>
              {isAuthenticated ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link to="/dashboard" className={styles.mobileUserLink}>
                    {t.nav.dashboard} ({displayName})
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={styles.mobileLogoutBtn}
                  >
                    {t.dashboard.logoutBtn}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link to="/login" className={styles.mobileLoginBtn}>
                    {t.nav.login}
                  </Link>
                  <Link to="/register" className={styles.mobileRegisterBtn}>
                    {t.nav.registerFree}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
