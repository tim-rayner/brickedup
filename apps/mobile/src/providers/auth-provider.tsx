import type { Session, User } from '@supabase/supabase-js';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { bootstrapAccount, type BootstrapResponse } from '@/lib/api';
import { supabase } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  user: User | null;
  bootstrap: BootstrapResponse | null;
  loading: boolean;
  accountLoading: boolean;
  refreshBootstrap: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  const access_token = params.access_token;
  const refresh_token = params.refresh_token;
  if (!access_token || !refresh_token) return null;

  const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) throw error;
  return data.session;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [bootstrap, setBootstrap] = useState<BootstrapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountLoading, setAccountLoading] = useState(false);
  const url = Linking.useURL();

  const refreshBootstrap = async () => {
    const result = await bootstrapAccount();
    setBootstrap(result);
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!url) return;
    createSessionFromUrl(url).catch((error) => {
      console.warn('Failed to create session from URL', error);
    });
  }, [url]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!session) {
        setBootstrap(null);
        setAccountLoading(false);
        return;
      }
      setAccountLoading(true);
      try {
        const result = await bootstrapAccount();
        if (!cancelled) setBootstrap(result);
      } catch (error) {
        console.warn('bootstrap failed', error);
        if (!cancelled) setBootstrap(null);
      } finally {
        if (!cancelled) setAccountLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [session, session?.user?.id]);

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    bootstrap,
    loading,
    accountLoading,
    refreshBootstrap,
    signOut: async () => {
      await supabase.auth.signOut();
      setBootstrap(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
