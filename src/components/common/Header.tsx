import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShieldCheck, User, LogOut } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from './Button';
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
    { to: '/shortlist', label: t.shortlist?.title || (language === 'mr' ? 'माझी शॉर्टलिस्ट' : 'My Shortlist') },
    { to: '/how-it-works', label: t.nav.howItWorks },
    { to: '/success-stories', label: t.nav.successStories },
    { to: '/membership', label: t.nav.membership },
    { to: '/about', label: t.nav.aboutUs },
    { to: '/contact', label: t.nav.contact }
  ];

  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      {/* Top micro bar */}
      <div className={styles.topMicroBar}>
        <div className="container">
          <div className={styles.topMicroContent}>
            <span className={styles.topBadge}>
              <ShieldCheck size={14} className={styles.topIcon} />
              {t.topBar.verifiedBadge}
            </span>
            <div className={styles.topRight}>
              <span className={styles.supportPhone}>{t.topBar.helpline}</span>
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
                    <User size={16} />
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
                    <LogOut size={18} />
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
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
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
                <X size={24} />
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
