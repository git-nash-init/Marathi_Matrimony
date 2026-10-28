import { supabase } from '../lib/supabase';

export type InterestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'withdrawn';

export interface InterestRow {
  id: string;
  status: InterestStatus;
  sentAt: string;
  profileUuid: string;
  profileCode: string;
  firstName: string;
  age: number | null;
  city: string | null;
  occupation: string | null;
  avatarUrl: string | null;
}

export interface InterestResult {
  success: boolean;
  status?: InterestStatus;
  code?: 'AUTH_REQUIRED' | 'SELF' | 'NOT_FOUND' | 'BLOCKED' | 'LIMIT_REACHED' | 'NOT_WITHDRAWABLE' | 'NOT_RESPONDABLE' | 'ERROR';
  message?: string;
  limit?: number;
  used?: number;
}

const toRow = (r: any): InterestRow => ({
  id: r.id,
  status: r.status,
  sentAt: r.sent_at,
  profileUuid: r.profile_uuid,
  profileCode: r.profile_code,
  firstName: r.first_name,
  age: r.age ?? null,
  city: r.city ?? null,
  occupation: r.occupation ?? null,
  avatarUrl: r.avatar_url ?? null,
});

const toResult = (data: any, error: { message: string } | null): InterestResult => {
  if (error) return { success: false, code: 'ERROR', message: error.message };
  return {
    success: Boolean(data?.success),
    status: data?.status,
    code: data?.code,
    message: data?.error,
    limit: data?.limit,
    used: data?.used,
  };
};

// Fired after any interest change so cards, the dashboard and the quota counter refresh.
const notifyChanged = (receiverProfileId: string, status: InterestStatus) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('mm:interest_changed', { detail: { receiverProfileId, status } }));
  if (status === 'withdrawn') {
    window.dispatchEvent(new CustomEvent('mm:interest_withdrawn', { detail: { receiverProfileId } }));
  }
};

// Sent interests are cached for the card-level status lookups (one query for the whole page).
let sentCache: { at: number; byReceiver: Map<string, InterestStatus> } | null = null;
let sentInFlight: Promise<Map<string, InterestStatus>> | null = null;
const CACHE_MS = 15_000;

export const interestService = {
  async getSent(): Promise<InterestRow[]> {
    const { data, error } = await supabase.rpc('get_my_interests', { p_direction: 'sent' });
    if (error || !Array.isArray(data)) return [];
    return (data as any[]).map(toRow);
  },

  async getReceived(): Promise<InterestRow[]> {
    const { data, error } = await supabase.rpc('get_my_interests', { p_direction: 'received' });
    if (error || !Array.isArray(data)) return [];
    return (data as any[]).map(toRow);
  },

  async getInterestStatus(receiverProfileId: string): Promise<InterestStatus | null> {
    if (!sentCache || Date.now() - sentCache.at > CACHE_MS) {
      // One request serves every card on the page.
      sentInFlight ??= this.getSent().then((sent) => {
        const byReceiver = new Map(sent.map((r) => [r.profileUuid, r.status] as [string, InterestStatus]));
        sentCache = { at: Date.now(), byReceiver };
        sentInFlight = null;
        return byReceiver;
      });
      return (await sentInFlight).get(receiverProfileId) ?? null;
    }
    return sentCache.byReceiver.get(receiverProfileId) ?? null;
  },

  async sendInterest(receiverProfileId: string, message?: string): Promise<InterestResult> {
    const { data, error } = await supabase.rpc('send_interest', {
      p_receiver: receiverProfileId,
      ...(message ? { p_message: message } : {}),
    });
    const res = toResult(data, error);
    if (res.success) {
      sentCache = null;
      notifyChanged(receiverProfileId, 'pending');
    }
    return res;
  },

  async withdrawInterest(receiverProfileId: string): Promise<InterestResult> {
    const { data, error } = await supabase.rpc('withdraw_interest', { p_receiver: receiverProfileId });
    const res = toResult(data, error);
    if (res.success) {
      sentCache = null;
      notifyChanged(receiverProfileId, 'withdrawn');
    }
    return res;
  },

  async respondToInterest(interestId: string, accept: boolean): Promise<InterestResult> {
    const { data, error } = await supabase.rpc('respond_to_interest', {
      p_interest_id: interestId,
      p_accept: accept,
    });
    return toResult(data, error);
  },
};
