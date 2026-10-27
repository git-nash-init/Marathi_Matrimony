import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: 'silver' | 'diamond' | 'platinum';
  description: string;
  price: number;
  discounted_price?: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

export interface ActiveSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  payment_id?: string;
  plan?: SubscriptionPlan;
}

export type SubscriptionFeature =
  | 'unlock_surname'
  | 'unlock_email'
  | 'unlock_phone'
  | 'unlock_address'
  | 'unlock_documents'
  | 'view_who_viewed_me'
  | 'view_contact_viewers'
  | 'recommendations'
  | 'priority_listing';

// Feature access matrix by plan slug
const PLAN_FEATURES: Record<string, SubscriptionFeature[]> = {
  silver: [
    'unlock_surname',
    'unlock_email',
    'unlock_phone',
    'unlock_address',
    'view_who_viewed_me',
    'recommendations',
  ],
  diamond: [
    'unlock_surname',
    'unlock_email',
    'unlock_phone',
    'unlock_address',
    'unlock_documents',
    'view_who_viewed_me',
    'view_contact_viewers',
    'recommendations',
    'priority_listing',
  ],
  platinum: [
    'unlock_surname',
    'unlock_email',
    'unlock_phone',
    'unlock_address',
    'unlock_documents',
    'view_who_viewed_me',
    'view_contact_viewers',
    'recommendations',
    'priority_listing',
  ],
};

// Plan display info
export const PLAN_DISPLAY_INFO: Record<string, {
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  label_en: string;
  label_mr: string;
  months: number;
}> = {
  silver: {
    emoji: '🥈',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    label_en: 'Silver',
    label_mr: 'सिल्व्हर',
    months: 3,
  },
  diamond: {
    emoji: '💎',
    color: '#1E40AF',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    label_en: 'Diamond',
    label_mr: 'डायमंड',
    months: 12,
  },
  platinum: {
    emoji: '👑',
    color: '#7B191E',
    bgColor: '#FEF3C7',
    borderColor: '#F59E0B',
    label_en: 'Platinum',
    label_mr: 'प्लॅटिनम',
    months: 18,
  },
};

export const FEATURE_TRANSLATIONS: Record<string, string> = {
  'View 25 Verified Phone Numbers': '२५ पडताळणी केलेले फोन नंबर पहा',
  'Direct WhatsApp & Email Contact': 'थेट व्हॉट्सअ‍ॅप व ई-मेल संपर्क',
  'See Who Viewed Your Profile': 'माझी प्रोफाइल कोणी पाहिली ते पहा',
  'Advanced Search Filters': 'प्रगत शोध व कुळ फिल्टर्स',
  'View 60 Verified Phone Numbers': '६० पडताळणी केलेले फोन नंबर पहा',
  'View 150 Verified Phone Numbers': '१५० पडताळणी केलेले फोन नंबर पहा',
  'Unlimited Direct Messages': 'अमर्यादित थेट संदेश व चॅट',
  'Kundali & Gun Milan Report': 'कुंडली व सविस्तर गुणमेलन अहवाल',
  'See Who Viewed Your Contact Number': 'माझा फोन नंबर कोणी पाहिला ते पहा',
  'Unlock Profile Documents': 'ओळखपत्र व कागदपत्रे अनलॉक करा',
  'Dedicated Relationship Manager': 'समर्पित वैयक्तिक मॅचमेकर सहाय्य',
  'VIP Profile Spotlight': 'सर्च रिझल्टमध्ये व्हीआयपी प्राधान्य',
};

export const localizePlanFeature = (feat: string, lang: string): string => {
  if (lang === 'mr') {
    return FEATURE_TRANSLATIONS[feat] || feat;
  }
  return feat;
};

// ─── Cache ────────────────────────────────────────────────────────────────────

let _cachedSubscription: ActiveSubscription | null | undefined = undefined;
let _cachedPlans: SubscriptionPlan[] | null = null;
let _cacheTime = 0;
const CACHE_TTL_MS = 60_000; // 1 minute

// ─── Service ──────────────────────────────────────────────────────────────────

export const subscriptionService = {
  // Invalidate cache (call after payment)
  invalidateCache() {
    _cachedSubscription = undefined;
    _cachedPlans = null;
    _cacheTime = 0;
  },

  // Fetch all active plans
  async fetchPlans(): Promise<SubscriptionPlan[]> {
    if (_cachedPlans && Date.now() - _cacheTime < CACHE_TTL_MS) {
      return _cachedPlans;
    }

    if (!isSupabaseConfigured()) {
      return getMockPlans();
    }

    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error || !data) {
        console.warn('Plans fetch error:', error?.message);
        return getMockPlans();
      }

      _cachedPlans = data as unknown as SubscriptionPlan[];
      _cacheTime = Date.now();
      return _cachedPlans;
    } catch (err) {
      console.warn('Plans fetch failed:', err);
      return getMockPlans();
    }
  },

  // Get user's currently active subscription
  async getActiveSubscription(userId?: string): Promise<ActiveSubscription | null> {
    if (!userId) return null;

    if (_cachedSubscription !== undefined && Date.now() - _cacheTime < CACHE_TTL_MS) {
      return _cachedSubscription;
    }

    if (!isSupabaseConfigured()) {
      // Check local demo subscription
      const localSub = localStorage.getItem('mm_demo_subscription');
      if (localSub) {
        try {
          const sub = JSON.parse(localSub) as ActiveSubscription;
          if (sub.status === 'active' && new Date(sub.end_date) > new Date()) {
            _cachedSubscription = sub;
            return sub;
          }
        } catch {}
      }
      _cachedSubscription = null;
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, plan:subscription_plans(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .order('end_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('Subscription fetch error:', error.message);
        _cachedSubscription = null;
        return null;
      }

      _cachedSubscription = data as unknown as ActiveSubscription | null;
      _cacheTime = Date.now();
      return _cachedSubscription;
    } catch (err) {
      console.warn('Subscription fetch failed:', err);
      _cachedSubscription = null;
      return null;
    }
  },

  // Check if user has a specific feature
  async hasFeature(userId: string | undefined, feature: SubscriptionFeature): Promise<boolean> {
    if (!userId) return false;
    const sub = await this.getActiveSubscription(userId);
    if (!sub) return false;

    const planSlug = (sub.plan?.slug || '') as string;
    const features = PLAN_FEATURES[planSlug] || [];
    return features.includes(feature);
  },

  // Get current plan slug
  async getCurrentPlanSlug(userId: string | undefined): Promise<string | null> {
    if (!userId) return null;
    const sub = await this.getActiveSubscription(userId);
    return sub?.plan?.slug || null;
  },

  // Create a payment record and activate subscription (dummy flow)
  async processPayment(params: {
    userId: string;
    planId: string;
    planSlug: string;
    amount: number;
    paymentMethod: string;
    durationDays: number;
  }): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    const { userId, planId, planSlug, amount, paymentMethod, durationDays } = params;

    if (!isSupabaseConfigured()) {
      // Demo mode: save to localStorage
      const sub: ActiveSubscription = {
        id: `demo-${Date.now()}`,
        user_id: userId,
        plan_id: planId,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + durationDays * 86400000).toISOString(),
        plan: {
          id: planId,
          name: `${planSlug.charAt(0).toUpperCase() + planSlug.slice(1)} Plan`,
          slug: planSlug as any,
          description: '',
          price: amount,
          duration_days: durationDays,
          features: [],
          is_active: true,
          sort_order: 1,
        },
      };
      localStorage.setItem('mm_demo_subscription', JSON.stringify(sub));
      this.invalidateCache();
      return { success: true, subscriptionId: sub.id };
    }

    try {
      // 1. Insert payment record
      const fakeTransactionId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;
      const { data: payment, error: payErr } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          plan_id: planId,
          gateway: 'dummy',
          gateway_payment_id: fakeTransactionId,
          amount,
          currency: 'INR',
          status: 'completed',
          payment_method: paymentMethod,
          paid_at: new Date().toISOString(),
          raw_response: { transaction_id: fakeTransactionId, mode: 'dummy' },
        } as any)
        .select()
        .single();

      if (payErr || !payment) {
        return { success: false, error: payErr?.message || 'Payment insert failed' };
      }

      // 2. Insert subscription
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + durationDays * 86400000);

      const { data: sub, error: subErr } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          payment_id: payment.id,
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        } as any)
        .select()
        .single();

      if (subErr || !sub) {
        return { success: false, error: subErr?.message || 'Subscription creation failed' };
      }

      this.invalidateCache();
      return { success: true, subscriptionId: (sub as any).id };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Unknown error' };
    }
  },

  // Track a profile view
  async trackProfileView(viewerProfileId: string, viewedProfileId: string): Promise<void> {
    if (!isSupabaseConfigured() || !viewerProfileId || !viewedProfileId) return;
    if (viewerProfileId === viewedProfileId) return;

    try {
      await supabase.from('profile_views').insert({
        viewer_profile_id: viewerProfileId,
        viewed_profile_id: viewedProfileId,
      } as any);
    } catch (err) {
      // silent fail — tracking is non-critical
    }
  },

  // Get profiles I have viewed (my history)
  async getProfilesViewedByMe(viewerProfileId: string, limit = 50): Promise<string[]> {
    if (!isSupabaseConfigured() || !viewerProfileId) return [];

    try {
      const { data, error } = await supabase
        .from('profile_views')
        .select('viewed_profile_id, created_at')
        .eq('viewer_profile_id', viewerProfileId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];
      // Return unique profile IDs preserving order
      const seen = new Set<string>();
      return (data as any[])
        .map((r) => r.viewed_profile_id)
        .filter((id: string) => {
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
    } catch {
      return [];
    }
  },

  // Get who has viewed my profile
  async getWhoViewedMyProfile(myProfileId: string, limit = 50): Promise<string[]> {
    if (!isSupabaseConfigured() || !myProfileId) return [];

    try {
      const { data, error } = await supabase
        .from('profile_views')
        .select('viewer_profile_id, created_at')
        .eq('viewed_profile_id', myProfileId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];
      const seen = new Set<string>();
      return (data as any[])
        .map((r) => r.viewer_profile_id)
        .filter((id: string) => {
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
    } catch {
      return [];
    }
  },
};

// ─── Mock data for demo mode ──────────────────────────────────────────────────

function getMockPlans(): SubscriptionPlan[] {
  return [
    {
      id: 'plan-silver',
      name: 'Silver Plan',
      slug: 'silver',
      description: 'Perfect for 3-month membership with full contact access',
      price: 1000,
      duration_days: 90,
      features: [
        'Unlock Surname, Email, Phone & Address',
        'View who visited your profile (30 days)',
        'Send unlimited interests',
        'View contact numbers unlocked by you',
        'Recommendation profiles',
      ],
      is_active: true,
      sort_order: 1,
    },
    {
      id: 'plan-diamond',
      name: 'Diamond Plan',
      slug: 'diamond',
      description: 'Best value — full year membership with premium features',
      price: 2500,
      duration_days: 365,
      features: [
        'Everything in Silver',
        'Unlock Documents section',
        'See who viewed your contact number',
        'Priority placement in search results',
        'Advanced matchmaking algorithm',
        'Unlimited profile view history',
      ],
      is_active: true,
      sort_order: 2,
    },
    {
      id: 'plan-platinum',
      name: 'Platinum Plan',
      slug: 'platinum',
      description: 'Ultimate 18-month plan with dedicated support',
      price: 3000,
      duration_days: 548,
      features: [
        'Everything in Diamond',
        'Dedicated relationship manager',
        'Profile highlighted in recommendations',
        'Unlimited contact unlocks per day',
        'Early access to new premium profiles',
        'Priority customer support',
        'WhatsApp assistance',
      ],
      is_active: true,
      sort_order: 3,
    },
  ];
}
