import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type PlanSlug = 'none' | 'silver' | 'diamond' | 'platinum';

export type PremiumFeature =
  | 'unlock_contact' | 'view_who_viewed_me' | 'unlimited_interests' | 'view_my_unlocks' | 'recommendations' | 'matchmaking'
  | 'unlock_documents' | 'view_contact_viewers' | 'priority_listing' | 'advanced_matchmaking' | 'unlimited_view_history' | 'download_pdf'
  | 'highlighted_profile' | 'unlimited_unlocks' | 'early_access' | 'priority_support';

export interface Entitlements {
  plan: PlanSlug;
  isAdmin: boolean;
  expiresAt: string | null;
  features: Partial<Record<PremiumFeature, boolean>>;
  unlocksToday: number;
  /** null = unlimited */
  unlockLimit: number | null;
  interestsThisMonth: number;
  /** null = unlimited */
  interestLimit: number | null;
}

const EMPTY: Entitlements = {
  plan: 'none', isAdmin: false, expiresAt: null, features: {},
  unlocksToday: 0, unlockLimit: 0, interestsThisMonth: 0, interestLimit: 5,
};

export const PLAN_RANK: Record<PlanSlug, number> = { none: 0, silver: 1, diamond: 2, platinum: 3 };

interface SubscriptionContextValue extends Entitlements {
  loading: boolean;
  has: (feature: PremiumFeature) => boolean;
  atLeast: (plan: PlanSlug) => boolean;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [ent, setEnt] = useState<Entitlements>(EMPTY);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setEnt(EMPTY);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.rpc('get_my_entitlements');
    if (error || !data) {
      setEnt(EMPTY);
    } else {
      const d = data as any;
      setEnt({
        plan: (d.plan as PlanSlug) ?? 'none',
        isAdmin: Boolean(d.is_admin),
        expiresAt: d.expires_at ?? null,
        features: d.features ?? {},
        unlocksToday: d.unlocks_today ?? 0,
        unlockLimit: d.unlock_limit ?? null,
        interestsThisMonth: d.interests_this_month ?? 0,
        interestLimit: d.interest_limit ?? null,
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    void refresh();
  }, [refresh]);

  // Quota counters change when interests are sent or withdrawn.
  useEffect(() => {
    const onChange = () => void refresh();
    window.addEventListener('mm:interest_changed', onChange);
    return () => window.removeEventListener('mm:interest_changed', onChange);
  }, [refresh]);

  const value = useMemo<SubscriptionContextValue>(() => ({
    ...ent,
    loading,
    has: (feature) => Boolean(ent.features[feature]),
    atLeast: (plan) => PLAN_RANK[ent.plan] >= PLAN_RANK[plan],
    refresh,
  }), [ent, loading, refresh]);

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export const useSubscription = (): SubscriptionContextValue => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
};
