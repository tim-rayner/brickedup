import { FunctionsHttpError } from '@supabase/supabase-js';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export type BootstrapResponse = {
  user: {
    id: string;
    email: string;
    status: string;
    onboarding_completed_at: string | null;
  } | null;
  profile: { id: string; status: string } | null;
  onboardingComplete: boolean;
};

async function invokeFunction<T>(name: string, body?: Record<string, unknown>): Promise<T> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
  }
  const { data, error } = await supabase.functions.invoke(name, { body });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = await error.context.json().catch(() => null);
      if (payload && typeof payload === 'object') {
        if ('reasons' in payload && Array.isArray(payload.reasons)) {
          throw new Error(payload.reasons.join(', '));
        }
        if ('error' in payload && payload.error) {
          throw new Error(String(payload.error));
        }
      }
    }
    throw new Error(error.message);
  }

  if (data && typeof data === 'object' && 'error' in data && data.error) {
    throw new Error(String(data.error));
  }

  return data as T;
}

export function bootstrapAccount() {
  return invokeFunction<BootstrapResponse>('bootstrap', {});
}

export function saveOnboarding(body: Record<string, unknown>) {
  return invokeFunction<{ ok: boolean; reasons?: string[] }>('onboarding', body);
}

export type PlaceResult = {
  id: string;
  displayLocation: string;
  latitude: number;
  longitude: number;
};

export function searchPlaces(query: string) {
  return invokeFunction<{ results: PlaceResult[] }>('places', {
    action: 'search',
    query,
  });
}

export function reverseGeocode(latitude: number, longitude: number) {
  return invokeFunction<{
    displayLocation: string;
    latitude: number;
    longitude: number;
  }>('places', {
    action: 'reverse',
    latitude,
    longitude,
  });
}
