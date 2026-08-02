import { isAuthRetryableFetchError } from '@supabase/supabase-js';

/**
 * supabase-js falls back to `JSON.stringify(rawResponse)` for 5xx auth errors
 * (see AuthRetryableFetchError), which leaks internals like the project URL.
 * Swap those for a generic message and keep the real error in the console.
 */
export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (isAuthRetryableFetchError(error)) {
    console.error('Auth request failed', error);
    return 'Something went wrong on our end. Please try again in a moment.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  console.error('Unexpected auth error', error);
  return fallback;
}
