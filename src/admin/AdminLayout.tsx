import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { ArrowLeft, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { ADMIN_SECTIONS } from './navigation';
import { useAdminSession } from './adminAccess';
import styles from './AdminLayout.module.css';

export const AdminLayout: React.FC = () => {
  const { language, brandName } = useLanguage();
  const { signOut } = useAuth();
  const { role } = useAdminSession();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mr = language === 'mr';

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setDrawerOpen((open) => !open)}
          aria-label={mr ? 'मेनू' : 'Menu'}
          aria-expanded={drawerOpen}
        >
          {drawerOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <strong className={styles.brand}>{brandName} {mr ? 'प्रशासन' : 'Admin'}</strong>
        <div className={styles.topActions}>
          <LanguageSwitcher />
          <Link to="/" className={styles.topLink}>
            <ArrowLeft size={15} />
            <span>{mr ? 'वेबसाइट' : 'Website'}</span>
          </Link>
          <button type="button" className={styles.topLink} onClick={() => void handleSignOut()}>
            <LogOut size={15} />
            <span>{mr ? 'लॉग आउट' : 'Sign out'}</span>
          </button>
        </div>
      </header>

      {drawerOpen && <div className={styles.overlay} onClick={() => setDrawerOpen(false)} aria-hidden="true" />}

      <nav className={`${styles.sidebar} ${drawerOpen ? styles.sidebarOpen : ''}`} aria-label={mr ? 'प्रशासन मेनू' : 'Admin menu'}>
        {ADMIN_SECTIONS.filter((s) => s.roles.includes(role)).map((section) => (
          <NavLink
            key={section.path}
            to={section.path ? `/admin/${section.path}` : '/admin'}
            end={!section.path}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            <section.icon size={19} />
            <span>{mr ? section.mr : section.en}</span>
          </NavLink>
        ))}
      </nav>

      <main className={styles.content}>
        <ErrorBoundary inline key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
};
