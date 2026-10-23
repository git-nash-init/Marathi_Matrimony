import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export const SUPABASE_URL = import.meta.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

// Fast timeout fetch wrapper to prevent hanging when Supabase host is unreachable
const timedFetch: typeof fetch = (input, init = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  if (init.signal) {
    init.signal.addEventListener('abort', () => controller.abort());
  }

  return fetch(input, { ...init, signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
};

// Typed Supabase client instance (Client-safe public anon key only)
export const supabase = createClient<Database>(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder',
  {
    global: {
      fetch: timedFetch,
    },
  }
);

// Storage bucket identifiers blueprint
export const STORAGE_BUCKETS = {
  PROFILE_PHOTOS: 'profile-photos',
  HOROSCOPE_DOCS: 'horoscope-docs',
  IDENTITY_DOCS: 'identity-docs'
} as const;
