import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState, NoResults } from '../../components/states/UiStates';
import { AdminUserRow, adminUsersService } from '../../services/adminUsers.service';
import { DataColumn, DataTable } from '../components/DataTable';
import { StatusBadges } from '../components/StatusBadges';
import styles from './adminPages.module.css';

const PAGE_SIZE = 20;

export const UsersPage: React.FC = () => {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const [params] = useSearchParams();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState(params.get('status') || 'all');
  const [gender, setGender] = useState(params.get('gender') || 'all');
  const [verification, setVerification] = useState(params.get('verification') || 'all');
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const request = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => { setDebounced(search); setPage(0); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    const thisRequest = ++request.current;
    setLoading(true);
    try {
      const res = await adminUsersService.listUsers({ search: debounced, status, gender, verification, page, pageSize: PAGE_SIZE });
      if (thisRequest !== request.current) return;
      setRows(res.items);
      setTotal(res.total);
      setError(null);
    } catch (err) {
      if (thisRequest === request.current) setError(err);
    } finally {
      if (thisRequest === request.current) setLoading(false);
    }
  }, [debounced, status, gender, verification, page]);

  useEffect(() => { void load(); }, [load]);

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(mr ? 'mr-IN' : 'en-IN', { dateStyle: 'medium' }) : '—';

  const columns: DataColumn<AdminUserRow>[] = [
    {
      key: 'name',
      header: mr ? 'सदस्य' : 'Member',
      render: (r) => (
        <>
          <Link to={`/admin/users/${r.user_id}`} className={styles.nameLink}>
            {[r.first_name, r.last_name].filter(Boolean).join(' ') || (mr ? 'प्रोफाइल नाही' : 'No profile yet')}
          </Link>
          <div className={styles.muted}>
            {[r.profile_code, r.gender === 'female' ? (mr ? 'वधू' : 'Bride') : r.gender === 'male' ? (mr ? 'वर' : 'Groom') : null, r.age ? `${r.age}` : null, r.city]
              .filter(Boolean).join(' • ')}
          </div>
        </>
      ),
    },
    {
      key: 'contact',
      header: mr ? 'संपर्क' : 'Contact',
      render: (r) => (
        <>
          <div className={styles.breakAll}>{r.email ?? '—'}</div>
          {r.phone_number && <div className={styles.muted}>{r.phone_number}</div>}
        </>
      ),
    },
    {
      key: 'status',
      header: mr ? 'स्थिती' : 'Status',
      render: (r) => <StatusBadges row={r} />,
    },
    { key: 'plan', header: mr ? 'योजना' : 'Plan', render: (r) => r.plan_name ?? '—' },
    { key: 'joined', header: mr ? 'नोंदणी' : 'Joined', render: (r) => fmt(r.created_at) },
    { key: 'seen', header: mr ? 'शेवटचे लॉगिन' : 'Last sign-in', render: (r) => fmt(r.last_sign_in_at) },
  ];

  const filtered = status !== 'all' || gender !== 'all' || verification !== 'all';

  return (
    <div>
      <h1 className={styles.title}>{mr ? 'सदस्य व्यवस्थापन' : 'User Management'}</h1>
      <p className={styles.subtitle}>{mr ? 'सर्व नोंदणीकृत सदस्य.' : 'Everyone who has registered.'}</p>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <input
            className={styles.input}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={mr ? 'नाव, ईमेल, फोन, आयडी किंवा शहर शोधा' : 'Search name, email, phone, ID or city'}
            aria-label={mr ? 'सदस्य शोधा' : 'Search members'}
          />
        </div>
        <select className={styles.select} value={status} aria-label={mr ? 'स्थिती' : 'Status'} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
          <option value="all">{mr ? 'सर्व स्थिती' : 'All statuses'}</option>
          <option value="approved">{mr ? 'मंजूर' : 'Approved'}</option>
          <option value="pending_approval">{mr ? 'प्रलंबित' : 'Pending approval'}</option>
          <option value="draft">{mr ? 'मसुदा' : 'Draft'}</option>
          <option value="rejected">{mr ? 'नाकारलेले' : 'Rejected'}</option>
          <option value="inactive">{mr ? 'निष्क्रिय' : 'Inactive'}</option>
          <option value="blocked">{mr ? 'ब्लॉक केलेले' : 'Blocked'}</option>
          <option value="no_profile">{mr ? 'प्रोफाइल नाही' : 'No profile'}</option>
        </select>
        <select className={styles.select} value={gender} aria-label={mr ? 'लिंग' : 'Gender'} onChange={(e) => { setGender(e.target.value); setPage(0); }}>
          <option value="all">{mr ? 'वर व वधू' : 'Brides & grooms'}</option>
          <option value="female">{mr ? 'वधू' : 'Brides'}</option>
          <option value="male">{mr ? 'वर' : 'Grooms'}</option>
        </select>
        <select className={styles.select} value={verification} aria-label={mr ? 'पडताळणी' : 'Verification'} onChange={(e) => { setVerification(e.target.value); setPage(0); }}>
          <option value="all">{mr ? 'सर्व पडताळणी' : 'Any verification'}</option>
          <option value="verified">{mr ? 'पडताळलेले' : 'Verified'}</option>
          <option value="pending">{mr ? 'प्रलंबित' : 'Pending'}</option>
          <option value="unverified">{mr ? 'न पडताळलेले' : 'Unverified'}</option>
          <option value="rejected">{mr ? 'नाकारलेले' : 'Rejected'}</option>
        </select>
      </div>

      <DataTable
        caption={mr ? 'सदस्य' : 'Members'}
        columns={columns}
        rows={rows}
        rowKey={(r) => r.user_id}
        loading={loading}
        error={error}
        onRetry={() => void load()}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
        empty={debounced.trim() ? (
          <NoResults query={debounced.trim()} onClear={() => setSearch('')} />
        ) : (
          <EmptyState
            icon={<Users size={30} />}
            title={filtered ? (mr ? 'या निवडीत कोणी नाही' : 'Nobody matches these filters') : (mr ? 'अद्याप कोणी नोंदणी केलेली नाही' : 'Nobody has registered yet')}
            description={filtered ? (mr ? 'दुसरी निवड करून पहा.' : 'Try a different selection.') : (mr ? 'नवीन सदस्य येथे दिसतील.' : 'New members appear here.')}
            action={filtered ? {
              label: mr ? 'फिल्टर्स साफ करा' : 'Clear filters',
              onClick: () => { setStatus('all'); setGender('all'); setVerification('all'); },
            } : undefined}
          />
        )}
      />
    </div>
  );
};
