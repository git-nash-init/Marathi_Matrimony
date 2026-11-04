import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'support';

export interface AdminInfo {
  is_admin: boolean;
  role?: AdminRole;
  mfa_required?: boolean;
  aal?: string;
  has_verified_factor?: boolean;
}

// Shared across the header, dashboard card and guard, so each page load asks the server once.
let cache: { userId: string; info: AdminInfo } | null = null;

/**
 * Asks the database who this user is. The answer only drives what the interface shows:
 * every admin read and write is enforced again by RLS and the admin_* functions.
 */
export const useAdminAccess = () => {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const [info, setInfo] = useState<AdminInfo | null>(cache && cache.userId === userId ? cache.info : null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(!(cache && cache.userId === userId));

  const load = useCallback(async (force = false) => {
    if (!userId) {
      cache = null;
      setInfo(null);
      setLoading(false);
      return;
    }
    if (!force && cache?.userId === userId) {
      setInfo(cache.info);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: rpcError } = await supabase.rpc('get_admin_context');
    if (rpcError) {
      setError(rpcError);
      setInfo(null);
    } else {
      const next = (data ?? { is_admin: false }) as unknown as AdminInfo;
      cache = { userId, info: next };
      setError(null);
      setInfo(next);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);

  return {
    info,
    isAdmin: Boolean(info?.is_admin),
    error,
    loading: authLoading || loading,
    refresh: useCallback(() => load(true), [load]),
  };
};

export interface AdminSession {
  role: AdminRole;
  info: AdminInfo;
  refresh: () => Promise<void>;
}

export const AdminSessionContext = createContext<AdminSession | null>(null);

export const useAdminSession = (): AdminSession => {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) throw new Error('useAdminSession must be used inside AdminGuard');
  return ctx;
};
