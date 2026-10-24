import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div 
      className={`site-wrapper ${isHomePage ? 'has-hero-top' : ''}`} 
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <ScrollToTop />
      <Header />
      <main style={{ flexGrow: 1, paddingTop: isHomePage ? 0 : '96px' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
