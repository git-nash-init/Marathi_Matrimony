import React, { useEffect, useState } from 'react';
import { Crown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  priority: boolean;
  created_at: string;
}

/** Contact inquiries for admins: Platinum members' (priority) inquiries are listed first and badged. */
export const AdminInquiries: React.FC<{ language: string }> = ({ language }) => {
  const mr = language === 'mr';
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase
      .from('contact_inquiries')
      .select('id, name, email, phone, subject, message, status, priority, created_at')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (!mounted) return;
        setRows((data ?? []) as Inquiry[]);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <section style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: '1.15rem', marginBottom: 12 }}>{mr ? 'संपर्क चौकशी' : 'Contact Inquiries'}</h2>
      {loading ? (
        <p>{mr ? 'लोड होत आहे…' : 'Loading…'}</p>
      ) : rows.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>{mr ? 'चौकशी नाही.' : 'No inquiries yet.'}</p>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {rows.map((r) => (
            <div key={r.id} style={{ background: '#fff', borderRadius: 10, padding: 14,
              border: r.priority ? '2px solid #C9A227' : '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {r.priority && (
                  <span style={{ background: '#C9A227', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 9px', borderRadius: 12 }}>
                    <Crown size={10} /> Platinum priority
                  </span>
                )}
                <strong>{r.subject}</strong>
                <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  {new Date(r.created_at).toLocaleString(mr ? 'mr-IN' : 'en-IN')} • {r.status}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', margin: '4px 0' }}>{r.name} • {r.email}{r.phone ? ` • ${r.phone}` : ''}</div>
              <div style={{ fontSize: '0.88rem', whiteSpace: 'pre-wrap' }}>{r.message}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
