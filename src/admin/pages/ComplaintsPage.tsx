import React, { useCallback, useEffect, useState } from 'react';
import { Crown, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState } from '../../components/states/UiStates';
import { DataColumn, DataTable } from '../components/DataTable';

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

const PAGE_SIZE = 20;

/** Contact requests, newest first, with Platinum members' inquiries on top. */
export const ComplaintsPage: React.FC = () => {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    const { data, error: queryError, count } = await supabase
      .from('contact_inquiries')
      .select('id, name, email, phone, subject, message, status, priority, created_at', { count: 'exact' })
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .range(targetPage * PAGE_SIZE, (targetPage + 1) * PAGE_SIZE - 1);
    if (queryError) {
      setError(queryError);
    } else {
      setRows((data ?? []) as Inquiry[]);
      setTotal(count ?? 0);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(page); }, [load, page]);

  const columns: DataColumn<Inquiry>[] = [
    {
      key: 'subject',
      header: mr ? 'विषय' : 'Subject',
      render: (r) => (
        <>
          {r.priority && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#C9A227', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '1px 8px', borderRadius: 12, marginBottom: 4 }}>
              <Crown size={10} /> Platinum
            </span>
          )}
          <div style={{ fontWeight: 600 }}>{r.subject}</div>
          <div style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', color: 'var(--color-ink-muted)', marginTop: 2 }}>{r.message}</div>
        </>
      ),
    },
    {
      key: 'from',
      header: mr ? 'पाठवणारे' : 'From',
      width: '240px',
      render: (r) => (
        <>
          <div>{r.name}</div>
          <div style={{ fontSize: '0.84rem', color: 'var(--color-ink-muted)', wordBreak: 'break-all' }}>{r.email}</div>
          {r.phone && <div style={{ fontSize: '0.84rem', color: 'var(--color-ink-muted)' }}>{r.phone}</div>}
        </>
      ),
    },
    { key: 'status', header: mr ? 'स्थिती' : 'Status', width: '100px', render: (r) => r.status },
    {
      key: 'date',
      header: mr ? 'दिनांक' : 'Date',
      width: '170px',
      render: (r) => new Date(r.created_at).toLocaleString(mr ? 'mr-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.35rem', margin: '0 0 4px' }}>{mr ? 'तक्रारी व मदत' : 'Complaints & Support'}</h1>
      <p style={{ margin: '0 0 16px', color: 'var(--color-ink-muted)', fontSize: '0.92rem' }}>
        {mr ? 'वेबसाइटवरून आलेल्या संपर्क विनंत्या.' : 'Contact requests sent through the website.'}
      </p>
      <DataTable
        caption={mr ? 'संपर्क विनंत्या' : 'Contact requests'}
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={loading}
        error={error}
        onRetry={() => void load(page)}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
        empty={
          <EmptyState
            icon={<MessageCircle size={30} />}
            title={mr ? 'अद्याप कोणतीही विनंती नाही' : 'No requests yet'}
            description={mr ? 'कोणी संपर्क फॉर्म भरल्यावर तो येथे दिसेल.' : 'When someone fills in the contact form, it appears here.'}
          />
        }
      />
    </div>
  );
};
