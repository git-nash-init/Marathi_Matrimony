import React, { useCallback, useEffect, useState } from 'react';
import { LifeBuoy } from 'lucide-react';
import { Button } from '../common/Button';
import { FormTextarea } from '../common/FormTextarea';
import { Skeleton } from '../common/Skeleton';
import { describeError, EmptyState, ErrorState } from '../states/UiStates';
import { useToast } from '../../context/ToastContext';
import { MyTicket, supportService } from '../../services/support.service';

const STATUS: Record<string, { en: string; mr: string }> = {
  PENDING: { en: 'Received', mr: 'मिळाले' },
  IN_PROGRESS: { en: 'We are looking into it', mr: 'तपासणी सुरू' },
  RESOLVED: { en: 'Resolved', mr: 'निकाली' },
};

/** The member's own requests and our replies. */
export const SupportTab: React.FC<{ language: string }> = ({ language }) => {
  const mr = language === 'mr';
  const { success } = useToast();
  const [tickets, setTickets] = useState<MyTicket[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [failure, setFailure] = useState<{ id: string; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setTickets(await supportService.myTickets());
      setError(null);
    } catch (err) {
      setError(err);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (error && !tickets) return <ErrorState error={error} onRetry={() => void load()} />;
  if (!tickets) return <Skeleton height={140} borderRadius={12} />;
  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={<LifeBuoy size={30} />}
        title={mr ? 'अद्याप कोणतीही विनंती नाही' : 'No requests yet'}
        description={mr ? 'काही अडचण असल्यास आम्हाला लिहा. उत्तर येथे दिसेल.' : 'If something is wrong, write to us. Our reply appears here.'}
        action={{ label: mr ? 'आमच्याशी संपर्क साधा' : 'Contact us', to: '/contact' }}
      />
    );
  }

  const fmt = (iso: string) => new Date(iso).toLocaleString(mr ? 'mr-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const send = async (id: string) => {
    const body = (drafts[id] ?? '').trim();
    if (!body) {
      setFailure({ id, text: mr ? 'संदेश लिहा.' : 'Please write a message.' });
      return;
    }
    setBusy(id);
    setFailure(null);
    try {
      await supportService.replyMine(id, body);
      setDrafts((d) => ({ ...d, [id]: '' }));
      success(mr ? 'पाठवले. आमचे पथक उत्तर देईल.' : 'Sent. Our team will reply here.');
      await load();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (!code && err instanceof Error) setFailure({ id, text: err.message });
      else {
        const generic = describeError(err, language as 'en' | 'mr');
        setFailure({ id, text: `${generic.what} ${generic.fix}` });
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {tickets.map((t) => {
        const status = STATUS[t.status] ?? STATUS.IN_PROGRESS;
        return (
          <section key={t.id} style={{ background: 'var(--color-surface-pure)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>
              <strong>{t.subject}</strong>
              <span style={{ fontSize: '0.84rem', color: 'var(--color-ink-muted)' }}>{mr ? status.mr : status.en}</span>
            </div>
            <p style={{ margin: '6px 0', whiteSpace: 'pre-wrap', fontSize: '0.92rem' }}>{t.message}</p>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)' }}>{fmt(t.created_at)}</div>
            {t.messages.map((m) => (
              <div key={m.id} style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: m.sender === 'admin' ? 'var(--color-border-light)' : 'transparent', border: m.sender === 'admin' ? 'none' : '1px solid var(--color-border-light)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{m.sender === 'admin' ? (mr ? 'आमचे पथक' : 'Our team') : (mr ? 'आपण' : 'You')} <span style={{ fontWeight: 400, color: 'var(--color-ink-muted)' }}>{fmt(m.created_at)}</span></div>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{m.body}</div>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <FormTextarea id={`ticket-${t.id}`} label={mr ? 'पुढील संदेश' : 'Add a message'} rows={2} maxLength={4000} value={drafts[t.id] ?? ''}
                error={failure?.id === t.id ? failure.text : undefined} onChange={(e) => setDrafts((d) => ({ ...d, [t.id]: e.target.value }))} />
              <div style={{ marginTop: 8 }}>
                <Button variant="outline" size="sm" disabled={busy === t.id} onClick={() => void send(t.id)}>
                  {busy === t.id ? (mr ? 'पाठवत आहे...' : 'Sending...') : (mr ? 'पाठवा' : 'Send')}
                </Button>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};
