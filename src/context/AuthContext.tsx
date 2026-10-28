import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PROFILE_COLUMNS, fetchMyPrivateFields } from '../lib/profileColumns';
import { Database } from '../types/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileRow | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasProfile: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ data: { user: User | null; session: Session | null }; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ data: { user: User | null; session: Session | null }; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ data: unknown; error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ data: unknown; error: AuthError | null }>;
  resendVerificationEmail: (email: string) => Promise<{ data: unknown; error: AuthError | null }>;
  refreshProfile: () => Promise<ProfileRow | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  const fetchProfileForUser = useCallback(async (userId: string): Promise<ProfileRow | null> => {
    if (!isConfigured) return null;
    try {
      const { data: row, error } = await supabase
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Could not fetch user profile:', error.message);
        return null;
      }
      const data = row ? ({ ...(row as object), ...(await fetchMyPrivateFields()) } as ProfileRow) : null;
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }, [isConfigured]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      return await fetchProfileForUser(user.id);
    }
    setProfile(null);
    return null;
  }, [user?.id, fetchProfileForUser]);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Check for dev test user in development mode
    const devMock = typeof window !== 'undefined' ? localStorage.getItem('dev_mock_user') : null;
    if (devMock && import.meta.env.DEV) {
      try {
        const parsedMock = JSON.parse(devMock);
        setUser(parsedMock);
        setSession({ user: parsedMock, access_token: 'dev-token', token_type: 'bearer', expires_in: 3600 } as any);
        setLoading(false);
        return;
      } catch (_e) {}
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        fetchProfileForUser(session.user.id).finally(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }).catch((err) => {
      console.warn('Error retrieving session:', err);
      setLoading(false);
    });

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user?.id) {
        await fetchProfileForUser(newSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured, fetchProfileForUser]);

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    if (!isConfigured) {
      throw new Error('Supabase is not configured');
    }
    const redirectUrl = `${window.location.origin}/verify-email`;
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata || {}
      }
    });
    return result;
  };

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      throw new Error('Supabase is not configured');
    }
    const result = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (result.data.user?.id) {
      await fetchProfileForUser(result.data.user.id);
    }
    return result;
  };

  const signOut = async () => {
    if (!isConfigured) {
      return { error: null };
    }
    const result = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    return result;
  };

  const resetPasswordForEmail = async (email: string) => {
    if (!isConfigured) {
      throw new Error('Supabase is not configured');
    }
    const redirectUrl = `${window.location.origin}/reset-password`;
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
  };

  const updatePassword = async (password: string) => {
    if (!isConfigured) {
      throw new Error('Supabase is not configured');
    }
    return await supabase.auth.updateUser({
      password
    });
  };

  const resendVerificationEmail = async (email: string) => {
    if (!isConfigured) {
      throw new Error('Supabase is not configured');
    }
    const redirectUrl = `${window.location.origin}/verify-email`;
    return await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    isAuthenticated: Boolean(user && session),
    hasProfile: Boolean(profile),
    isConfigured,
    signUp,
    signIn,
    signOut,
    resetPasswordForEmail,
    updatePassword,
    resendVerificationEmail,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
