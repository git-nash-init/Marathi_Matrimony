import React, { useEffect, useState } from 'react';
import { Ban, LogOut, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from '../common/Button';
import { brandConfig } from '../../config/brand.config';

/**
 * Replaces the site with an explanation when an admin has blocked this account. The database already
 * refuses everything for a blocked account; this only tells the person why, and how to get help.
 */
export const AccountBlockedGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const [blocked, setBlocked] = useState(false);
  const mr = language === 'mr';
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      setBlocked(false);
      return;
    }
    let active = true;
    const check = () => {
      (supabase.rpc as any)('get_my_account_status').then(({ data }: { data: { blocked?: boolean } | null }) => {
        if (active && data) setBlocked(Boolean(data.blocked));
      });
    };
    check();
    window.addEventListener('focus', check);
    return () => {
      active = false;
      window.removeEventListener('focus', check);
    };
  }, [userId]);

  if (!blocked) return <>{children}</>;

  return (
    <div role="alert" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 480, background: 'var(--color-surface-pure)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 28, textAlign: 'center' }}>
        <Ban size={36} color="var(--color-danger)" />
        <h1 style={{ fontSize: '1.25rem', margin: '12px 0 8px', color: 'var(--color-ink)' }}>
          {mr ? 'आपले खाते ब्लॉक केले आहे' : 'Your account has been blocked'}
        </h1>
        <p style={{ margin: '0 0 16px', color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
          {mr
            ? 'आमच्या पथकाने हे खाते थांबवले आहे, त्यामुळे आपले प्रोफाइल इतरांना दिसत नाही. ही चूक वाटत असल्यास आमच्याशी संपर्क साधा.'
            : 'Our team has stopped this account, so your profile is not visible to anyone. If you think this is a mistake, please contact us.'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          <a href={`tel:${brandConfig.phone.replace(/\s+/g, '')}`} className="btn btn-primary btn-sm">
            <Phone size={15} /> {brandConfig.phone}
          </a>
          <Button variant="outline" size="sm" icon={<LogOut size={15} />} onClick={() => void signOut()}>
            {mr ? 'लॉग आउट' : 'Sign out'}
          </Button>
        </div>
      </div>
    </div>
  );
};
