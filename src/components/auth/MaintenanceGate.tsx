import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAdminAccess } from '../../admin/adminAccess';
import { settingsService } from '../../services/content.service';
import { brandConfig } from '../../config/brand.config';

/**
 * Shows a holding page while the site is in maintenance. Admins carry on, and the sign-in page stays
 * open so they can get in. If the setting cannot be read, the site stays open rather than going dark.
 */
export const MaintenanceGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useLanguage();
  const { info } = useAdminAccess();
  const { pathname } = useLocation();
  const [down, setDown] = useState(false);
  const mr = language === 'mr';

  useEffect(() => {
    let active = true;
    settingsService.getPublic().then((s) => { if (active) setDown(Boolean(s?.maintenance_mode)); }).catch(() => undefined);
    return () => { active = false; };
  }, [pathname]);

  const exempt = pathname.startsWith('/admin') || pathname === '/login' || info?.is_admin;
  if (!down || exempt) return <>{children}</>;

  return (
    <div role="status" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <Wrench size={36} color="var(--color-primary)" />
        <h1 style={{ fontSize: '1.3rem', margin: '12px 0 8px' }}>{mr ? 'थोड्या वेळासाठी काम सुरू आहे' : 'We are making some improvements'}</h1>
        <p style={{ margin: '0 0 8px', color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
          {mr
            ? 'आपली माहिती सुरक्षित आहे. कृपया थोड्या वेळाने पुन्हा या.'
            : 'Your information is safe. Please come back in a little while.'}
        </p>
        <p style={{ margin: 0, color: 'var(--color-ink-muted)' }}>{brandConfig.phone}</p>
      </div>
    </div>
  );
};
