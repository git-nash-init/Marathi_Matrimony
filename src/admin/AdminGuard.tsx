import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorState, PermissionDenied } from '../components/states/UiStates';
import { AdminRole, AdminSessionContext, useAdminAccess } from './adminAccess';
import { MfaChallenge, MfaEnroll } from './components/MfaPanels';

const Centered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--color-bg)' }}>
    <div style={{ width: '100%', maxWidth: 560 }}>{children}</div>
  </div>
);

/**
 * Decides what an admin route shows. This is for the interface only: the database refuses every
 * admin read and write from anyone who isn't allowed, whatever the browser shows.
 */
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const { info, error, loading, refresh } = useAdminAccess();
  const location = useLocation();
  const mr = language === 'mr';

  const session = useMemo(
    () => (info?.is_admin && info.role ? { role: info.role, info, refresh } : null),
    [info, refresh],
  );

  if (authLoading || (loading && !info)) {
    return (
      <Centered>
        <div aria-label={mr ? 'तपासत आहे' : 'Checking access'} style={{ display: 'grid', gap: 12 }}>
          <Skeleton height={28} width="60%" borderRadius={8} />
          <Skeleton height={120} borderRadius={12} />
        </div>
      </Centered>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (error) return <Centered><ErrorState error={error} onRetry={refresh} /></Centered>;
  if (!info?.is_admin || !session) {
    return <Centered><PermissionDenied backTo="/dashboard" backLabel={mr ? 'डॅशबोर्डवर जा' : 'Go to your dashboard'} /></Centered>;
  }

  // Anyone with a factor must use it, even before the requirement is turned on for everyone.
  if (info.has_verified_factor && info.aal !== 'aal2') {
    return <Centered><MfaChallenge onDone={refresh} /></Centered>;
  }
  if (info.mfa_required && !info.has_verified_factor) {
    return <Centered><MfaEnroll onDone={refresh} required /></Centered>;
  }

  return <AdminSessionContext.Provider value={session}>{children}</AdminSessionContext.Provider>;
};

export const RoleGate: React.FC<{ role: AdminRole; allowed: AdminRole[]; children: React.ReactNode }> = ({ role, allowed, children }) => {
  const { language } = useLanguage();
  if (allowed.includes(role)) return <>{children}</>;
  return (
    <PermissionDenied
      message={language === 'mr' ? 'आपल्या प्रशासक भूमिकेला या विभागाचा प्रवेश नाही.' : 'Your admin role does not include this section.'}
      backTo="/admin"
      backLabel={language === 'mr' ? 'डॅशबोर्डवर जा' : 'Go to admin dashboard'}
    />
  );
};
