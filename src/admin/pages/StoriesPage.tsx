import React, { useCallback, useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/common/FormInput';
import { FormTextarea } from '../../components/common/FormTextarea';
import { Modal } from '../../components/common/Modal';
import { describeError, EmptyState } from '../../components/states/UiStates';
import { storiesService, Story } from '../../services/content.service';
import { DataColumn, DataTable } from '../components/DataTable';
import styles from './adminPages.module.css';

const blank: Partial<Story> = { consent_confirmed: false, is_published: false, sort_order: 0 };

export const StoriesPage: React.FC = () => {
  const { language } = useLanguage();
  const { success } = useToast();
  const mr = language === 'mr';
  const [rows, setRows] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [editing, setEditing] = useState<Partial<Story> | null>(null);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await storiesService.adminList());
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const start = (story: Partial<Story>) => {
    setEditing(story);
    setTouched(false);
    setFailure(null);
    setPhotoError(null);
  };
  const set = (patch: Partial<Story>) => setEditing((c) => ({ ...c, ...patch }));

  const required = (value: string | null | undefined) =>
    touched && !value?.trim() ? (mr ? 'हे आवश्यक आहे.' : 'This is required.') : undefined;

  const failureText = (err: unknown) => {
    const message = (err as { message?: string })?.message;
    if ((err as { code?: string })?.code === '22023' && message) return message;
    const generic = describeError(err, language);
    return `${generic.what} ${generic.fix}`;
  };

  const persist = async (story: Partial<Story>, done: string) => {
    setBusy(true);
    setFailure(null);
    try {
      await storiesService.save(story.id ?? null, story);
      success(done);
      setEditing(null);
      void load();
    } catch (err) {
      setFailure(failureText(err));
    } finally {
      setBusy(false);
    }
  };

  const save = (publish: boolean) => {
    if (!editing) return;
    setTouched(true);
    const complete = ['couple_names_en', 'couple_names_mr', 'story_en', 'story_mr'].every((k) => String((editing as any)[k] ?? '').trim());
    if (!complete) return;
    if (publish && !editing.consent_confirmed) {
      setFailure(mr ? 'प्रकाशित करण्यापूर्वी जोडप्याची संमती निश्चित करा.' : 'Please confirm the couple agreed before publishing.');
      return;
    }
    void persist({ ...editing, is_published: publish }, publish
      ? (mr ? 'प्रकाशित केले. वेबसाइटवर दिसेल.' : 'Published. It now shows on the website.')
      : (mr ? 'मसुदा जतन केला.' : 'Saved. It is not on the website.'));
  };

  const pickPhoto = async (file: File) => {
    const problem = storiesService.photoProblem(file, mr);
    setPhotoError(problem);
    if (problem) return;
    setUploading(true);
    try {
      set({ photo_url: await storiesService.uploadPhoto(file) });
    } catch {
      setPhotoError(mr ? 'फोटो अपलोड झाला नाही. पुन्हा प्रयत्न करा.' : 'The photo did not upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const columns: DataColumn<Story>[] = [
    {
      key: 'couple',
      header: mr ? 'जोडपे' : 'Couple',
      render: (r) => (
        <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {r.photo_url && <img src={r.photo_url} alt="" width={44} height={44} style={{ borderRadius: 8, objectFit: 'cover' }} />}
          <span>
            <strong>{mr ? r.couple_names_mr : r.couple_names_en}</strong>
            <div className={styles.muted}>{mr ? r.location_mr : r.location_en}</div>
          </span>
        </span>
      ),
    },
    {
      key: 'status',
      header: mr ? 'स्थिती' : 'Status',
      render: (r) => (r.is_published
        ? <span className={`${styles.badge} ${styles.badgeGood}`}>{mr ? 'प्रकाशित' : 'Published'}</span>
        : <span className={styles.badge}>{mr ? 'मसुदा' : 'Not published'}</span>),
    },
    {
      key: 'consent',
      header: mr ? 'संमती' : 'Consent',
      render: (r) => (r.consent_confirmed
        ? (mr ? 'होय' : 'Confirmed')
        : <span className={`${styles.badge} ${styles.badgeWarn}`}>{mr ? 'बाकी' : 'Needed'}</span>),
    },
    {
      key: 'actions',
      header: '',
      width: '190px',
      render: (r) => (
        <span style={{ display: 'flex', gap: 6 }}>
          <Button variant="outline" size="sm" onClick={() => start(r)}>{mr ? 'संपादित' : 'Edit'}</Button>
          {r.is_published && (
            <Button variant="outline" size="sm" disabled={busy}
              onClick={() => void persist({ ...r, is_published: false }, mr ? 'वेबसाइटवरून काढले.' : 'Taken off the website.')}>
              {mr ? 'लपवा' : 'Hide'}
            </Button>
          )}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.cardHead}>
        <div>
          <h1 className={styles.title}>{mr ? 'विवाहगाथा' : 'Success Stories'}</h1>
          <p className={styles.subtitle} style={{ marginBottom: 0 }}>
            {mr ? 'फक्त संमती दिलेल्या जोडप्यांच्या खऱ्या कथा.' : 'Real stories only, from couples who have agreed. The section stays hidden until one is published.'}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => start(blank)}>{mr ? 'नवीन कथा' : 'Add story'}</Button>
      </div>

      <div style={{ marginTop: 16 }}>
        <DataTable
          caption={mr ? 'कथा' : 'Stories'}
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          loading={loading}
          error={error}
          onRetry={() => void load()}
          page={0}
          pageSize={Math.max(rows.length, 1)}
          total={rows.length}
          onPageChange={() => undefined}
          empty={
            <EmptyState
              icon={<Heart size={30} />}
              title={mr ? 'अद्याप कथा नाहीत' : 'No stories yet'}
              description={mr ? 'पहिली कथा प्रकाशित होईपर्यंत हा विभाग वेबसाइटवर दिसत नाही.' : 'This section stays off the website until the first story is published.'}
              action={{ label: mr ? 'पहिली कथा जोडा' : 'Add the first story', onClick: () => start(blank) }}
            />
          }
        />
      </div>

      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.id ? (mr ? 'कथा संपादित करा' : 'Edit story') : (mr ? 'नवीन कथा' : 'Add story')}>
        {editing && (
          <div style={{ display: 'grid', gap: 12 }}>
            <FormInput id="story-names-en" label="Couple's names (English)" required maxLength={120} value={editing.couple_names_en ?? ''} error={required(editing.couple_names_en)} onChange={(e) => set({ couple_names_en: e.target.value })} />
            <FormInput id="story-names-mr" label="जोडप्याची नावे (मराठी)" required maxLength={120} value={editing.couple_names_mr ?? ''} error={required(editing.couple_names_mr)} onChange={(e) => set({ couple_names_mr: e.target.value })} />
            <FormTextarea id="story-en" label="Story (English)" required rows={4} maxLength={3000} value={editing.story_en ?? ''} error={required(editing.story_en)} onChange={(e) => set({ story_en: e.target.value })} />
            <FormTextarea id="story-mr" label="कथा (मराठी)" required rows={4} maxLength={3000} value={editing.story_mr ?? ''} error={required(editing.story_mr)} onChange={(e) => set({ story_mr: e.target.value })} />
            <FormInput id="story-location-en" label="Place (English)" maxLength={120} value={editing.location_en ?? ''} onChange={(e) => set({ location_en: e.target.value })} />
            <FormInput id="story-location-mr" label="ठिकाण (मराठी)" maxLength={120} value={editing.location_mr ?? ''} onChange={(e) => set({ location_mr: e.target.value })} />
            <FormInput id="story-date" label={mr ? 'विवाह दिनांक' : 'Wedding date'} type="date" value={editing.wedding_date ?? ''} onChange={(e) => set({ wedding_date: e.target.value })} />

            <div>
              <label htmlFor="story-photo" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: 4 }}>
                {mr ? 'फोटो (JPG, PNG, WebP, ५ MB पर्यंत)' : 'Photo (JPG, PNG, WebP, up to 5 MB)'}
              </label>
              {editing.photo_url && <img src={editing.photo_url} alt="" width={110} height={110} style={{ borderRadius: 8, objectFit: 'cover', display: 'block', marginBottom: 6 }} />}
              <input id="story-photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void pickPhoto(f); e.target.value = ''; }} />
              {uploading && <p className={styles.muted}>{mr ? 'अपलोड होत आहे...' : 'Uploading...'}</p>}
              {photoError && <p role="alert" className={styles.formError}>{photoError}</p>}
            </div>

            <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={Boolean(editing.consent_confirmed)} onChange={(e) => set({ consent_confirmed: e.target.checked })} />
              {mr
                ? 'या जोडप्याने त्यांची नावे, कथा व फोटो वेबसाइटवर वापरण्यास संमती दिली आहे.'
                : 'This couple has agreed to their names, story and photo being shown on the website.'}
            </label>

            {failure && <p role="alert" className={styles.formError}>{failure}</p>}
            <div className={styles.formActions} style={{ marginTop: 0 }}>
              <Button variant="primary" size="sm" disabled={busy || uploading} onClick={() => save(true)}>{mr ? 'प्रकाशित करा' : 'Publish'}</Button>
              <Button variant="outline" size="sm" disabled={busy || uploading} onClick={() => save(false)}>{mr ? 'मसुदा जतन करा' : 'Save without publishing'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
