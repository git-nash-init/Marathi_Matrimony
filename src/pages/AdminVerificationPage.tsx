import { AdminInquiries } from '../components/premium/AdminInquiries';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Users,
  Settings,
  ExternalLink,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../context/ToastContext';
import { adminService, AdminProfileItem } from '../services/admin.service';
import styles from './AdminVerificationPage.module.css';

export const AdminVerificationPage: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();

  const [profiles, setProfiles] = useState<AdminProfileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'verified' | 'draft' | 'rejected'>('all');
  const [autoVerify, setAutoVerify] = useState<boolean>(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Load profiles
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('Failed to load admin profiles:', err);
      showToast(
        language === 'mr' ? 'प्रोफाइल्स लोड करण्यात अडचण आली.' : 'Failed to load profiles.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [language, showToast]);

  useEffect(() => {
    loadData();
    adminService.getAutoVerifySetting().then(setAutoVerify);
  }, [loadData]);

  // Handle auto-verify setting toggle (platform-wide, enforced in the database)
  const handleToggleAutoVerify = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setAutoVerify(val);
    if (!(await adminService.setAutoVerifySetting(val))) {
      setAutoVerify(!val);
      showToast(language === 'mr' ? 'सेटिंग जतन करता आली नाही.' : 'Could not save the setting.', 'error');
      return;
    }
    showToast(
      val
        ? (language === 'mr' ? 'आधार स्वयंचलित मंजुरी सुरू केली.' : 'Auto-verify on Aadhaar enabled.')
        : (language === 'mr' ? 'आधार स्वयंचलित मंजुरी बंद केली (मॅन्युअल तपासणी सुरू).' : 'Manual verification queue enabled.'),
      'info'
    );
  };

  // One-click approve and verify
  const handleApprove = async (p: AdminProfileItem) => {
    setActionInProgress(p.id);
    const res = await adminService.approveProfile(p.id);
    setActionInProgress(null);

    if (res.success) {
      showToast(
        language === 'mr'
          ? `${p.first_name} ${p.last_name} ची प्रोफाइल मंजूर व पडताळणी झाली!`
          : `Approved and verified ${p.first_name} ${p.last_name}!`,
        'success'
      );
      loadData();
    } else {
      showToast(res.error || 'Failed to approve', 'error');
    }
  };

  // Reject profile
  const handleReject = async (p: AdminProfileItem) => {
    setActionInProgress(p.id);
    const res = await adminService.rejectProfile(p.id);
    setActionInProgress(null);

    if (res.success) {
      showToast(
        language === 'mr' ? 'प्रोफाइल नाकारली.' : 'Profile rejected.',
        'info'
      );
      loadData();
    } else {
      showToast(res.error || 'Failed to reject', 'error');
    }
  };

  // Batch approve all pending
  const handleBatchApprove = async () => {
    if (!window.confirm(language === 'mr' ? 'सर्व प्रलंबित प्रोफाइल्स मंजूर करायच्या आहेत का?' : 'Approve all pending profiles?')) {
      return;
    }
    setLoading(true);
    const res = await adminService.batchApprovePending();
    setLoading(false);

    if (res.success) {
      showToast(
        language === 'mr'
          ? `${res.count} प्रलंबित प्रोफाइल्स यशस्वीरित्या मंजूर केल्या!`
          : `Successfully approved ${res.count} pending profiles!`,
        'success'
      );
      loadData();
    } else {
      showToast('Batch approve failed', 'error');
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = profiles.length;
    const pending = profiles.filter(
      (p) => p.profile_status === 'pending_approval' || p.verification_status === 'pending'
    ).length;
    const verified = profiles.filter((p) => p.verification_status === 'verified').length;
    const draft = profiles.filter((p) => p.profile_status === 'draft').length;
    return { total, pending, verified, draft };
  }, [profiles]);

  // Filtered profiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      // Tab filter
      if (activeTab === 'pending') {
        if (p.profile_status !== 'pending_approval' && p.verification_status !== 'pending') return false;
      } else if (activeTab === 'verified') {
        if (p.verification_status !== 'verified') return false;
      } else if (activeTab === 'draft') {
        if (p.profile_status !== 'draft') return false;
      } else if (activeTab === 'rejected') {
        if (p.profile_status !== 'rejected' && p.verification_status !== 'rejected') return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
        const profId = (p.profile_id || '').toLowerCase();
        const aadhaar = (p.aadhaar_number || '').toLowerCase();
        const city = (p.city || '').toLowerCase();
        return fullName.includes(q) || profId.includes(q) || aadhaar.includes(q) || city.includes(q);
      }

      return true;
    });
  }, [profiles, activeTab, search]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Top Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>
              <ShieldCheck size={32} />
              {language === 'mr' ? 'प्रशासन व प्रोफाइल पडताळणी केंद्र' : 'Admin Verification & Moderation Hub'}
            </h1>
            <p>
              {language === 'mr'
                ? 'सनईबंध सदस्य आधार पडताळणी, फोटो मंजुरी आणि प्रोफाइल स्थिती व्यवस्थापन.'
                : 'Systematic member Aadhaar verification, photo moderation, and approval center.'}
            </p>
          </div>

          <div className={styles.headerRight}>
            <Link to="/dashboard" className={styles.btnView}>
              <ArrowLeft size={16} />
              {language === 'mr' ? 'डॅशबोर्डवर परत जा' : 'Back to Dashboard'}
            </Link>
            <button onClick={loadData} className={styles.btnView} title="Refresh list">
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              {language === 'mr' ? 'ताजे करा' : 'Refresh'}
            </button>
            {stats.pending > 0 && (
              <button onClick={handleBatchApprove} className={styles.btnApprove}>
                <Sparkles size={16} />
                {language === 'mr' ? `सर्व प्रलंबित मंजूर करा (${stats.pending})` : `Approve All Pending (${stats.pending})`}
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#EDE9FE', color: '#7C3AED' }}>
              <Users size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{language === 'mr' ? 'एकूण नोंदणी' : 'Total Profiles'}</span>
              <span className={styles.statValue}>{stats.total}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#FEF3C7', color: '#D97706' }}>
              <Clock size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{language === 'mr' ? 'प्रलंबित पडताळणी' : 'Pending Review'}</span>
              <span className={styles.statValue}>{stats.pending}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#DCFCE7', color: '#15803D' }}>
              <CheckCircle2 size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{language === 'mr' ? 'पडताळणी झालेले / सक्रिय' : 'Verified & Active'}</span>
              <span className={styles.statValue}>{stats.verified}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#F1F5F9', color: '#64748B' }}>
              <Settings size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{language === 'mr' ? 'अपूर्ण / मसुदा' : 'Draft / Incomplete'}</span>
              <span className={styles.statValue}>{stats.draft}</span>
            </div>
          </div>
        </div>

        {/* System Auto-Verify Policy Box */}
        <div className={styles.settingsBox}>
          <div className={styles.settingsContent}>
            <h3>
              <Settings size={20} color="var(--color-primary)" />
              {language === 'mr'
                ? 'आधार क्रमांकासह स्वयंचलित पडताळणी (Auto-Approve Policy)'
                : 'Auto-Approve on Aadhaar Submission Policy'}
            </h3>
            <p>
              {autoVerify
                ? (language === 'mr'
                    ? 'चालू: वापरकर्त्याने १२ अंकी आधार क्रमांक प्रविष्ट करताच प्रोफाइल तात्काळ "Verified" होते आणि विरुद्ध लिंगाच्या सदस्यांना दिसू लागते.'
                    : 'Active: When members enter their 12-digit Aadhaar, their profile is instantly Confirmed & Verified, appearing to opposite gender matches immediately.')
                : (language === 'mr'
                    ? 'बंद: सर्व नवीन प्रोफाइल्स प्रशासकीय तपासणीसाठी (Under Review) थांबतील आणि तुम्ही स्वतः "मंजूर करा" बटण दाबल्यावरच सक्रिय होतील.'
                    : 'Manual: New profiles stay in "Under Review" pending queue until administrator manually clicks Approve.')}
            </p>
          </div>

          <div className={styles.switchWrapper}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: autoVerify ? '#15803D' : '#64748B' }}>
              {autoVerify
                ? (language === 'mr' ? 'स्वयंचलित मंजुरी चालू' : 'Auto-Approve ON')
                : (language === 'mr' ? 'मॅन्युअल तपासणी' : 'Manual Queue')}
            </span>
            <label className={styles.toggleSwitch}>
              <input type="checkbox" checked={autoVerify} onChange={handleToggleAutoVerify} />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>

        {/* Toolbar & Tabs */}
        <div className={styles.toolbar}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('all')}
            >
              {language === 'mr' ? 'सर्व' : 'All'}
              <span className={styles.tabCount}>{stats.total}</span>
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              <Clock size={14} />
              {language === 'mr' ? 'प्रलंबित' : 'Pending'}
              <span className={styles.tabCount}>{stats.pending}</span>
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'verified' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('verified')}
            >
              <CheckCircle2 size={14} />
              {language === 'mr' ? 'पडताळणी झालेले' : 'Verified'}
              <span className={styles.tabCount}>{stats.verified}</span>
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'draft' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('draft')}
            >
              {language === 'mr' ? 'मसुदा' : 'Draft'}
              <span className={styles.tabCount}>{stats.draft}</span>
            </button>
          </div>

          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={language === 'mr' ? 'नाव, आयडी, आधार किंवा शहर शोधा...' : 'Search name, ID, Aadhaar, city...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Profiles List */}
        {loading ? (
          <div className={styles.emptyState}>
            <RefreshCw size={32} className="spin" style={{ margin: '0 auto 12px', display: 'block', color: 'var(--color-primary)' }} />
            <p>{language === 'mr' ? 'प्रोफाइल्स लोड होत आहेत...' : 'Loading member profiles...'}</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className={styles.emptyState}>
            <ShieldCheck size={48} style={{ margin: '0 auto 12px', display: 'block', color: '#94A3B8' }} />
            <h3>{language === 'mr' ? 'कोणतीही प्रोफाइल आढळली नाही' : 'No Profiles Found'}</h3>
            <p>
              {language === 'mr'
                ? 'निवडलेल्या निकषांनुसार किंवा शोध परिणामांमध्ये कोणतीही प्रोफाइल उपलब्ध नाही.'
                : 'No profiles match the selected filters or search terms.'}
            </p>
          </div>
        ) : (
          <div className={styles.profileList}>
            {filteredProfiles.map((p) => {
              const isVerified = p.verification_status === 'verified';
              const isPending = p.verification_status === 'pending' || p.profile_status === 'pending_approval';
              const isRejected = p.profile_status === 'rejected' || p.verification_status === 'rejected';

              return (
                <div key={p.id} className={styles.profileCard}>
                  <div className={styles.profileLeft}>
                    {p.avatar_url ? (
                      <img
                        src={p.avatar_url}
                        alt={`${p.first_name} ${p.last_name}`}
                        className={styles.avatar}
                      />
                    ) : (
                      <div className={styles.avatar}>
                        {(p.first_name || 'M').charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className={styles.profileDetails}>
                      <h4>
                        {p.first_name} {p.last_name}
                        <span
                          className={`${styles.genderBadge} ${
                            p.gender === 'female' ? styles.badgeFemale : styles.badgeMale
                          }`}
                        >
                          {p.gender === 'female'
                            ? (language === 'mr' ? 'वधू (Bride)' : 'Bride')
                            : (language === 'mr' ? 'वर (Groom)' : 'Groom')}
                        </span>
                      </h4>

                      <div className={styles.profileMeta}>
                        <span><strong>ID:</strong> {p.profile_id}</span>
                        {p.city && <span>• {p.city}, {p.state || 'Maharashtra'}</span>}
                        {p.occupation && <span>• {p.occupation}</span>}
                        {Array.isArray(p.photos) && p.photos.length > 0 && (
                          <span>• {p.photos.length} {language === 'mr' ? 'छायाचित्रे' : 'photos'}</span>
                        )}
                      </div>

                      {p.aadhaar_number ? (
                        <div className={styles.aadhaarRow}>
                          <ShieldCheck size={14} />
                          <span>Aadhaar: {p.aadhaar_number}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                          {language === 'mr' ? 'आधार क्रमांक प्रविष्ट केलेला नाही' : 'No Aadhaar provided'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.statusGroup}>
                    <div
                      className={`${styles.statusPill} ${
                        isVerified
                          ? styles.statusApproved
                          : isRejected
                          ? styles.statusRejected
                          : isPending
                          ? styles.statusPending
                          : styles.statusDraft
                      }`}
                    >
                      {isVerified ? (
                        <>
                          <CheckCircle2 size={14} />
                          {language === 'mr' ? 'पडताळणी पूर्ण (Verified)' : 'Verified & Confirmed'}
                        </>
                      ) : isRejected ? (
                        <>
                          <XCircle size={14} />
                          {language === 'mr' ? 'अस्वीकृत (Rejected)' : 'Rejected'}
                        </>
                      ) : isPending ? (
                        <>
                          <Clock size={14} />
                          {language === 'mr' ? 'प्रतीक्षेत (Pending Review)' : 'Pending Review'}
                        </>
                      ) : (
                        language === 'mr' ? 'मसुदा (Draft)' : 'Draft'
                      )}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className={styles.actions}>
                    <Link to={`/profile/${p.id}`} className={styles.btnView} target="_blank">
                      <ExternalLink size={14} />
                      {language === 'mr' ? 'प्रोफाइल पहा' : 'View'}
                    </Link>

                    {!isVerified && (
                      <button
                        onClick={() => handleApprove(p)}
                        disabled={actionInProgress === p.id}
                        className={styles.btnApprove}
                      >
                        <CheckCircle2 size={16} />
                        {actionInProgress === p.id
                          ? (language === 'mr' ? 'मंजूर होत आहे...' : 'Approving...')
                          : (language === 'mr' ? 'मंजूर करा (Approve)' : 'Approve & Confirm')}
                      </button>
                    )}

                    {!isRejected && (
                      <button
                        onClick={() => handleReject(p)}
                        disabled={actionInProgress === p.id}
                        className={styles.btnReject}
                      >
                        <XCircle size={16} />
                        {language === 'mr' ? 'नाकारा' : 'Reject'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <AdminInquiries language={language} />
      </div>
    </div>
  );
};
