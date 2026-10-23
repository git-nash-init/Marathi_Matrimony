import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from './Button';
import {
  VerifiedShieldIcon,
  WhatsAppCrestIcon
} from './CulturalIcons';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { t, brandName, language } = useLanguage();
  const { isAuthenticated, user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const navLinks = [
    { to: '/', label: t.nav.home },
    { to: '/search', label: t.nav.search },
    { to: '/shortlist', label: t.shortlist?.title || (language === 'mr' ? 'शॉर्टलिस्ट' : 'Shortlist') },
    { to: '/how-it-works', label: t.nav.howItWorks },
    { to: '/success-stories', label: t.nav.successStories },
    { to: '/membership', label: t.nav.membership },
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
              <VerifiedShieldIcon size={15} className={styles.topIcon} color="#F4EBD9" />
              <span>{language === 'mr' ? '१००% पडताळणी केलेले ९६ कुळी मराठा प्रोफाइल्स' : '100% Verified 96 Kuli Maratha Profiles'}</span>
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

      {/* Main Navigation Bar */}
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

            {/* Desktop Navigation Links */}
            <nav className={styles.desktopNav} aria-label="Main Navigation">
              {navLinks.map(link => {
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

            {/* Right Action Buttons */}
            <div className={styles.rightActions}>
              <LanguageSwitcher variant="header" />
              
              {isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Link
                    to="/dashboard"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>{displayName}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      padding: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
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
                <>
                  <Link to="/login" className={styles.loginLink}>
                    {t.nav.login}
                  </Link>
                  <Button to="/register" variant="primary" size="sm">
                    {t.nav.registerFree}
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className={styles.hamburgerBtn}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? t.nav.close : t.nav.menu}
            >
              {mobileMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={styles.mobileDrawerBackdrop} onClick={() => setMobileMenuOpen(false)}>
          <div className={styles.mobileDrawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mobileDrawerHeader}>
              <div className={styles.logo}>
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
              </div>
              <button
                type="button"
                className={styles.drawerCloseBtn}
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className={styles.mobileLangSection}>
              <LanguageSwitcher variant="header" />
            </div>

            <nav className={styles.mobileNavLinks}>
              {navLinks.map(link => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`${styles.mobileNavLink} ${isActive ? styles.mobileActive : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className={`${styles.mobileNavLink} ${location.pathname === '/dashboard' ? styles.mobileActive : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.dashboard.title}
                </Link>
              )}
            </nav>

            <div className={styles.mobileAuthButtons}>
              {isAuthenticated ? (
                <>
                  <Button to="/dashboard" variant="primary" fullWidth onClick={() => setMobileMenuOpen(false)}>
                    {t.dashboard.title} ({displayName})
                  </Button>
                  <Button variant="outline" fullWidth onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                    {t.dashboard.logoutBtn}
                  </Button>
                </>
              ) : (
                <>
                  <Button to="/login" variant="outline" fullWidth onClick={() => setMobileMenuOpen(false)}>
                    {t.nav.login}
                  </Button>
                  <Button to="/register" variant="primary" fullWidth onClick={() => setMobileMenuOpen(false)}>
                    {t.nav.registerFree}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
