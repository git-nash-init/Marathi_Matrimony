import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

const REQUEST_TIMEOUT_MS = 15000;
const UPLOAD_TIMEOUT_MS = 120000; // A 5 MB photo on a slow connection needs far longer than a query.

const isUpload = (input: RequestInfo | URL, init: RequestInit): boolean => {
  const method = (init.method || 'GET').toUpperCase();
  return (method === 'POST' || method === 'PUT') && String(input).includes('/storage/v1/object/');
};

// Timeout wrapper so a dead connection fails with a clear error instead of hanging forever.
const timedFetch: typeof fetch = (input, init = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    try {
      controller.abort(new Error('Network request timed out'));
    } catch {
      controller.abort();
    }
  }, isUpload(input, init) ? UPLOAD_TIMEOUT_MS : REQUEST_TIMEOUT_MS);

  if (init.signal) {
    init.signal.addEventListener('abort', () => {
      try {
        controller.abort(init.signal?.reason);
      } catch {
        controller.abort();
      }
    });
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
