import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Auth will not work until they are set.',
  );
}

/**
 * Session storage: AsyncStorage on native; window.localStorage on web.
 * Avoids expo-sqlite/localStorage WASM issues on Expo web.
 */
const authStorage =
  Platform.OS === 'web'
    ? {
        getItem: (key: string) => {
          if (typeof window === 'undefined') return Promise.resolve(null);
          return Promise.resolve(window.localStorage.getItem(key));
        },
        setItem: (key: string, value: string) => {
          if (typeof window === 'undefined') return Promise.resolve();
          window.localStorage.setItem(key, value);
          return Promise.resolve();
        },
        removeItem: (key: string) => {
          if (typeof window === 'undefined') return Promise.resolve();
          window.localStorage.removeItem(key);
          return Promise.resolve();
        },
      }
    : AsyncStorage;

// Placeholder values keep createClient from throwing when env is unset (SSR / local UI).
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'placeholder-publishable-key',
  {
    auth: {
      storage: authStorage,
      autoRefreshToken: isSupabaseConfigured,
      persistSession: isSupabaseConfigured,
      detectSessionInUrl: false,
    },
  },
);
