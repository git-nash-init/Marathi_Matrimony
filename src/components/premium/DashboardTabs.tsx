import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock, Eye, Heart, Phone, PhoneCall, Sparkles, Star, UserCheck, Undo2, Crown, Mail, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { interestService, InterestRow } from '../../services/interest.service';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { SubscriptionGate } from '../common/SubscriptionGate';
import { brandConfig as BRAND_CONFIG } from '../../config/brand.config';
import dashStyles from '../../pages/DashboardPage.module.css';

// Row shape returned by the premium RPCs (see 008_premium_features.sql → profile_card_json)
export interface CardRow {
  id: string;
  profile_code: string;
  first_name: string;
  age: number | null;
  city: string | null;
  occupation: string | null;
  avatar_url: string | null;
  is_highlighted?: boolean;
  match_percent?: number;
  viewed_at?: string;
  view_count?: number;
  unlocked_at?: string;
  approved_at?: string;
  is_early_access?: boolean;
  last_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  whatsapp_number?: string | null;
  address_line?: string | null;
}

type Lang = { language: string };

const fmt = (iso: string | undefined, lang: string) =>
  iso ? new Date(iso).toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

function useRpcList<T>(fn: string, args?: Record<string, unknown>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const argKey = JSON.stringify(args ?? {});
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    supabase.rpc(fn as any, JSON.parse(argKey)).then(({ data: d, error }: any) => {
      if (!mounted) return;
      setData(error ? null : (d as T));
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [fn, argKey]);
  return { data, loading };
}

const MiniCard: React.FC<{ p: CardRow; lang: string; note?: React.ReactNode }> = ({ p, lang, note }) => (
  <Link
    to={`/profile/${p.id}`}
    className={dashStyles.miniCard}
    style={p.is_highlighted ? { border: '2px solid #C9A227', boxShadow: '0 0 0 3px rgba(201,162,39,0.18)' } : undefined}
  >
    <div className={dashStyles.miniPhoto}>
      {p.avatar_url
        ? <img src={p.avatar_url} alt={p.first_name} />
        : <div className={dashStyles.miniPhotoPlaceholder}>{(p.first_name || 'M').charAt(0)}</div>}
    </div>
    <div className={dashStyles.miniInfo}>
      <div className={dashStyles.miniName}>
        {p.first_name}
        {p.is_highlighted && (
          <span style={{ marginLeft: 8, fontSize: '0.68rem', background: '#C9A227', color: '#fff', padding: '2px 8px', borderRadius: 10, verticalAlign: 'middle' }}>
            <Crown size={10} style={{ marginRight: 3 }} />Platinum
          </span>
        )}
        {p.match_percent !== undefined && (
          <span style={{ marginLeft: 8, fontSize: '0.72rem', background: '#ECFDF5', color: '#047857', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
            {p.match_percent}% {lang === 'mr' ? 'जुळते' : 'match'}
          </span>
        )}
      </div>
      <div className={dashStyles.miniMeta}>
        {p.age ?? '—'} {lang === 'mr' ? 'वर्षे' : 'yrs'} • {p.city || '—'}
      </div>
      <div className={dashStyles.miniSub}>{p.occupation}</div>
      {note}
    </div>
    <div className={dashStyles.miniArrow}><ChevronRight size={16} /></div>
  </Link>
);

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className={dashStyles.emptyState}>
    <div className={dashStyles.emptyIcon}>{icon}</div>
    <h3 className={dashStyles.emptyTitle}>{title}</h3>
    <p className={dashStyles.emptyDesc}>{desc}</p>
  </div>
);

const Header: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className={dashStyles.tabHeader}>
    {icon}
    <div><h3>{title}</h3><p>{desc}</p></div>
  </div>
);

const Loading: React.FC<Lang> = ({ language }) => (
  <p style={{ padding: 16, color: 'var(--color-text-muted)' }}>{language === 'mr' ? 'लोड होत आहे…' : 'Loading…'}</p>
);

const ProfileList: React.FC<{ rows: CardRow[] | null; loading: boolean; lang: string; empty: { icon: React.ReactNode; title: string; desc: string }; note?: (r: CardRow) => React.ReactNode }> =
  ({ rows, loading, lang, empty, note }) => {
    if (loading) return <Loading language={lang} />;
    if (!rows || rows.length === 0) return <EmptyState {...empty} />;
    return <div className={dashStyles.miniCardList}>{rows.map((p) => <MiniCard key={p.id} p={p} lang={lang} note={note?.(p)} />)}</div>;
  };

export const MatchmakingTab: React.FC<Lang> = ({ language: lang }) => {
  const { data, loading } = useRpcList<CardRow[]>('get_recommendations', { p_limit: 6, p_offset: 0 });
  return (
    <div>
      <Header icon={<Sparkles size={18} />} title={lang === 'mr' ? 'जुळवाजुळव प्रोफाइल' : 'Matchmaking Profiles'}
        desc={lang === 'mr' ? 'तुमच्या प्राधान्यांवर आधारित जुळलेले प्रोफाइल' : 'Profiles matched based on your partner preferences'} />
      <ProfileList rows={data} loading={loading} lang={lang}
        empty={{ icon: <Sparkles size={32} />, title: lang === 'mr' ? 'सध्या जुळणारे प्रोफाइल नाहीत' : 'No matches yet', desc: lang === 'mr' ? 'तुमची प्राधान्ये अद्ययावत करा.' : 'Update your partner preferences to see matches.' }} />
    </div>
  );
};

export const RecommendationsTab: React.FC<Lang> = ({ language: lang }) => {
  const { data, loading } = useRpcList<CardRow[]>('get_recommendations', { p_limit: 20, p_offset: 0 });
  return (
    <div>
      <Header icon={<Star size={18} />} title={lang === 'mr' ? 'शिफारस केलेल्या प्रोफाइल' : 'Recommended Profiles'}
        desc={lang === 'mr' ? 'तुमच्या प्राधान्यांशी सर्वाधिक जुळणारे प्रोफाइल' : 'Profiles that best fit your preferences, ranked by match %'} />
      <ProfileList rows={data} loading={loading} lang={lang}
        empty={{ icon: <Star size={32} />, title: lang === 'mr' ? 'शिफारसी उपलब्ध नाहीत' : 'No recommendations yet', desc: lang === 'mr' ? 'नवीन प्रोफाइल आल्यावर येथे दिसतील.' : 'New matching profiles will appear here.' }} />
    </div>
  );
};

export const NewProfilesTab: React.FC<Lang> = ({ language: lang }) => {
  const { data, loading } = useRpcList<CardRow[]>('get_new_profiles');
  return (
    <div>
      <Header icon={<Sparkles size={18} />} title={lang === 'mr' ? 'नवीन प्रोफाइल' : 'New Profiles'}
        desc={lang === 'mr' ? 'गेल्या ७ दिवसांतील प्रोफाइल — प्लॅटिनम सदस्यांना ७२ तास आधी' : 'Approved in the last 7 days — Platinum members see them 72 hours early'} />
      <ProfileList rows={data} loading={loading} lang={lang}
        note={(p) => p.is_early_access ? (
          <span style={{ fontSize: '0.7rem', color: '#92400E', fontWeight: 700 }}>{lang === 'mr' ? 'लवकर प्रवेश' : 'Early access'}</span>
        ) : null}
        empty={{ icon: <Sparkles size={32} />, title: lang === 'mr' ? 'नवीन प्रोफाइल नाहीत' : 'No new profiles', desc: lang === 'mr' ? 'लवकरच येथे दिसतील.' : 'Check back soon.' }} />
    </div>
  );
};

export const ViewedByMeTab: React.FC<Lang & { onUpgrade: () => void }> = ({ language: lang, onUpgrade }) => {
  const { t } = useLanguage();
  const { data, loading } = useRpcList<{ items: CardRow[]; capped: boolean }>('get_my_viewed_profiles');
  return (
    <div>
      <Header icon={<Eye size={18} />} title={lang === 'mr' ? 'मी पाहिलेल्या प्रोफाइल' : 'Profiles Viewed by Me'}
        desc={lang === 'mr' ? 'तुम्ही नुकत्याच पाहिलेल्या प्रोफाइलचा इतिहास' : 'History of profiles you have recently browsed'} />
      <ProfileList rows={data?.items ?? null} loading={loading} lang={lang}
        note={(p) => p.viewed_at ? <span className={dashStyles.viewedOnTag}><Clock size={11} /> {fmt(p.viewed_at, lang)}</span> : null}
        empty={{ icon: <Eye size={32} />, title: lang === 'mr' ? 'अजून कोणताही इतिहास नाही' : 'No browsing history yet', desc: lang === 'mr' ? 'स्थळे शोधणे सुरू करा.' : 'Start browsing profiles to see your history here.' }} />
      {data?.capped && (
        <button type="button" onClick={onUpgrade} style={{ margin: '12px 0', color: 'var(--color-primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
          {t.premium.upgradeHistory}
        </button>
      )}
    </div>
  );
};

export const WhoViewedMeTab: React.FC<Lang> = ({ language: lang }) => {
  const { data, loading } = useRpcList<CardRow[]>('get_my_profile_visitors');
  return (
    <div>
      <Header icon={<UserCheck size={18} />} title={lang === 'mr' ? 'माझी प्रोफाइल कोणी पाहिली' : 'Who Viewed My Profile'}
        desc={lang === 'mr' ? 'गेल्या ३० दिवसांत तुमची प्रोफाइल पाहणारे सदस्य' : 'Members who visited your profile in the last 30 days'} />
      <ProfileList rows={data} loading={loading} lang={lang}
        note={(p) => <span className={dashStyles.viewedOnTag}><Clock size={11} /> {fmt(p.viewed_at, lang)}{(p.view_count ?? 0) > 1 ? ` • ${p.view_count}×` : ''}</span>}
        empty={{ icon: <UserCheck size={32} />, title: lang === 'mr' ? 'अजून कोणीही पाहिले नाही' : 'No visitors yet', desc: lang === 'mr' ? 'प्रोफाइल पूर्ण ठेवा.' : 'Keep your profile complete to attract visitors.' }} />
    </div>
  );
};

export const ContactViewersTab: React.FC<Lang> = ({ language: lang }) => {
  const { data, loading } = useRpcList<CardRow[]>('get_my_contact_viewers');
  return (
    <div>
      <Header icon={<PhoneCall size={18} />} title={lang === 'mr' ? 'माझा फोन नंबर कोणी पाहिला' : 'Who Viewed My Contact Number'}
        desc={lang === 'mr' ? 'तुमचे संपर्क तपशील अनलॉक केलेले सदस्य' : 'Members who have unlocked your contact details'} />
      <ProfileList rows={data} loading={loading} lang={lang}
        note={(p) => <span className={dashStyles.viewedOnTag}><Clock size={11} /> {fmt(p.unlocked_at, lang)}</span>}
        empty={{ icon: <PhoneCall size={32} />, title: lang === 'mr' ? 'अजून कोणीही नाही' : 'No one yet', desc: lang === 'mr' ? 'कोणी संपर्क अनलॉक केल्यावर येथे दिसेल.' : 'You will see members here once they unlock your contact.' }} />
    </div>
  );
};

export const ContactsByMeTab: React.FC<Lang> = ({ language: lang }) => {
  const { data, loading } = useRpcList<CardRow[]>('get_my_contact_unlocks');
  return (
    <div>
      <Header icon={<Phone size={18} />} title={lang === 'mr' ? 'मी पाहिलेले फोन नंबर' : 'Contact Numbers Viewed by Me'}
        desc={lang === 'mr' ? 'तुम्ही अनलॉक केलेले संपर्क तपशील' : 'Contact details you have unlocked'} />
      <ProfileList rows={data} loading={loading} lang={lang}
        note={(p) => (
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'grid', gap: 2, marginTop: 4 }}>
            <span>{p.last_name ? `${p.first_name} ${p.last_name}` : p.first_name}</span>
            {p.phone_number && <span><Phone size={11} /> {p.phone_number}</span>}
            {p.email && <span><Mail size={11} /> {p.email}</span>}
            {p.address_line && <span><MapPin size={11} /> {p.address_line}</span>}
            <span><Clock size={11} /> {fmt(p.unlocked_at, lang)}</span>
          </div>
        )}
        empty={{ icon: <Phone size={32} />, title: lang === 'mr' ? 'अजून काहीही अनलॉक केलेले नाही' : 'Nothing unlocked yet', desc: lang === 'mr' ? 'प्रोफाइलवर "संपर्क अनलॉक करा" वापरा.' : 'Use "Unlock contact" on a profile to see it here.' }} />
    </div>
  );
};

export const InterestsTab: React.FC<Lang> = ({ language: lang }) => {
  const { user } = useAuth();
  const toast = useToast();
  const mr = lang === 'mr';
  const [subTab, setSubTab] = useState<'received' | 'sent'>('received');
  const [sent, setSent] = useState<InterestRow[]>([]);
  const [received, setReceived] = useState<InterestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawTarget, setWithdrawTarget] = useState<InterestRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);

  const load = useCallback(async () => {
    const [s, r] = await Promise.all([interestService.getSent(), interestService.getReceived()]);
    setSent(s);
    setReceived(r);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const onChange = () => void load();
    window.addEventListener('mm:interest_changed', onChange);
    return () => window.removeEventListener('mm:interest_changed', onChange);
  }, [load, user?.id]);

  const confirmWithdraw = async () => {
    if (!withdrawTarget) return;
    setBusy(true);
    const res = await interestService.withdrawInterest(withdrawTarget.profileUuid);
    setBusy(false);
    setWithdrawTarget(null);
    if (res.success) toast.success(mr ? 'पसंती मागे घेतली.' : 'Interest withdrawn.');
    else toast.error(res.message || (mr ? 'पसंती मागे घेता आली नाही.' : 'Could not withdraw interest.'));
  };

  const sendAgain = async (row: InterestRow) => {
    const res = await interestService.sendInterest(row.profileUuid);
    if (res.success) toast.success(mr ? 'पसंती पुन्हा पाठवली.' : 'Interest sent again.');
    else if (res.code === 'LIMIT_REACHED') setGateOpen(true);
    else toast.error(res.message || (mr ? 'पाठवता आली नाही.' : 'Could not send interest.'));
  };

  const respond = async (row: InterestRow, accept: boolean) => {
    const res = await interestService.respondToInterest(row.id, accept);
    if (res.success) void load();
    else toast.error(res.message || (mr ? 'उत्तर देता आले नाही.' : 'Could not respond.'));
  };

  const toCard = (r: InterestRow): CardRow => ({
    id: r.profileUuid, profile_code: r.profileCode, first_name: r.firstName, age: r.age,
    city: r.city, occupation: r.occupation, avatar_url: r.avatarUrl,
  });

  const label = (status: string, dir: 'sent' | 'received') => {
    if (status === 'accepted') return mr ? 'स्वीकारले' : 'Accepted';
    if (status === 'declined') return mr ? 'नकार दिला' : 'Declined';
    if (status === 'withdrawn') return mr ? 'मागे घेतली' : 'Withdrawn';
    return dir === 'sent' ? (mr ? 'पाठवले • प्रतीक्षेत' : 'Sent • Pending') : (mr ? 'प्रतीक्षेत' : 'Pending');
  };

  return (
    <div>
      <Header icon={<Heart size={18} />} title={mr ? 'पसंती / Express Interest' : 'Interests'}
        desc={mr ? 'मिळालेल्या व पाठवलेल्या पसंती' : 'Interests received and sent by you'} />
      <div className={dashStyles.subTabs}>
        <button className={`${dashStyles.subTab} ${subTab === 'received' ? dashStyles.subTabActive : ''}`} onClick={() => setSubTab('received')}>
          {mr ? 'मिळालेल्या पसंती' : 'Received'} ({received.length})
        </button>
        <button className={`${dashStyles.subTab} ${subTab === 'sent' ? dashStyles.subTabActive : ''}`} onClick={() => setSubTab('sent')}>
          {mr ? 'पाठवलेल्या पसंती' : 'Sent'} ({sent.length})
        </button>
      </div>

      {loading ? <Loading language={lang} /> : subTab === 'sent' ? (
        sent.length === 0 ? (
          <EmptyState icon={<Heart size={32} />} title={mr ? 'अजून कोणतीही पसंती पाठवलेली नाही' : 'No interests sent yet'}
            desc={mr ? 'स्थळे शोधा आणि "पसंती कळवा" वर क्लिक करा.' : 'Explore matches and express interest to start a conversation.'} />
        ) : (
          <div className={dashStyles.miniCardList}>
            {sent.map((item) => (
              <div key={item.id} className={dashStyles.interestRow} style={item.status === 'withdrawn' ? { opacity: 0.75 } : undefined}>
                <MiniCard p={toCard(item)} lang={lang} />
                <div className={dashStyles.interestStatus}>
                  <span className={item.status === 'withdrawn' ? dashStyles.statusPending : dashStyles.statusSent}
                    style={item.status === 'withdrawn' ? { background: '#F3F4F6', color: '#6B7280' } : undefined}>
                    {label(item.status, 'sent')}
                  </span>
                  <div className={dashStyles.interestActions}>
                    {(item.status === 'pending' || item.status === 'accepted') && (
                      <button className={dashStyles.declineBtn} onClick={() => setWithdrawTarget(item)}>
                        <Undo2 size={12} /> {mr ? 'मागे घ्या' : 'Withdraw'}
                      </button>
                    )}
                    {(item.status === 'withdrawn' || item.status === 'declined') && (
                      <button className={dashStyles.acceptBtn} onClick={() => sendAgain(item)}>{mr ? 'पुन्हा पाठवा' : 'Send again'}</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        received.length === 0 ? (
          <EmptyState icon={<Heart size={32} />} title={mr ? 'अजून कोणतीही पसंती मिळालेली नाही' : 'No interests received yet'}
            desc={mr ? 'प्रोफाइल पूर्ण आणि सक्रिय ठेवा.' : 'Keep your profile complete and verified so matching candidates can connect with you.'} />
        ) : (
          <div className={dashStyles.miniCardList}>
            {received.map((item) => (
              <div key={item.id} className={dashStyles.interestRow}>
                <MiniCard p={toCard(item)} lang={lang} />
                <div className={dashStyles.interestStatus}>
                  <span className={item.status === 'accepted' ? dashStyles.statusSent : dashStyles.statusPending}>{label(item.status, 'received')}</span>
                  {item.status === 'pending' && (
                    <div className={dashStyles.interestActions}>
                      <button className={dashStyles.acceptBtn} onClick={() => respond(item, true)}>{mr ? 'स्वीकारा' : 'Accept'}</button>
                      <button className={dashStyles.declineBtn} onClick={() => respond(item, false)}>{mr ? 'नकार द्या' : 'Decline'}</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <ConfirmDialog
        isOpen={Boolean(withdrawTarget)}
        title={mr ? 'पसंती मागे घ्यायची?' : 'Withdraw interest?'}
        message={mr
          ? `${withdrawTarget?.firstName ?? ''} यांना कळवले जाईल की तुम्ही पसंती मागे घेतली. तुम्ही नंतर पुन्हा पाठवू शकता.`
          : `${withdrawTarget?.firstName ?? 'The member'} will be notified that you withdrew your interest. You can send it again later.`}
        confirmLabel={mr ? 'मागे घ्या' : 'Withdraw'}
        cancelLabel={mr ? 'रद्द करा' : 'Cancel'}
        busy={busy}
        onConfirm={confirmWithdraw}
        onCancel={() => setWithdrawTarget(null)}
      />
      <SubscriptionGate isOpen={gateOpen} onClose={() => setGateOpen(false)}
        reason={mr ? 'या महिन्याच्या ५ मोफत पसंती संपल्या आहेत.' : 'You have used all 5 free interests this month. Upgrade for unlimited interests.'} />
    </div>
  );
};

/** Platinum-only: shared support WhatsApp (relationship manager, priority support, WhatsApp help). */
export const ConciergeCard: React.FC<{ profileCode?: string | null }> = ({ profileCode }) => {
  const { t } = useLanguage();
  const text = encodeURIComponent(`Platinum member ${profileCode ?? ''}`.trim());
  const waBase = BRAND_CONFIG.social.whatsapp;
  const phone = BRAND_CONFIG.phone.replace(/\s+/g, '');
  return (
    <div style={{ border: '2px solid #C9A227', borderRadius: 14, padding: 18, background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
      <Crown size={28} color="#B7791F" />
      <div style={{ flex: '1 1 240px' }}>
        <strong>{t.premium.conciergeTitle}</strong>
        <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#78350F' }}>{t.premium.conciergeDesc}</p>
      </div>
      <a href={`${waBase}?text=${text}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">WhatsApp</a>
      <a href={`tel:${phone}`} className="btn btn-outline btn-sm">{t.premium.call}</a>
    </div>
  );
};
