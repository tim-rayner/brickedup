# Edge Function–scoped auth with `@supabase/server`

We need a durable auth path for Bricked Up before sign-up and onboarding UI lock in a client-only Supabase pattern.

**Decision:** Treat Supabase Edge Functions wrapped with `@supabase/server` as the auth-scoped API surface for app operations (caller JWT verified per request; RLS-respecting client from context). Sign-up and sign-in run on-device via `@supabase/supabase-js` Auth; the mobile app holds and refreshes the session. Privileged or mutative product flows (User row, Profile draft, onboarding writes) go through those functions rather than calling the Data API ad hoc from the client as the primary pattern.

**Why:** Matches the current Supabase server-package guidance for header/Bearer auth, keeps credential exchange on the Auth client where sessions belong, keeps authorization checks off the client for product mutations, and leaves a clear place for onboarding writes that must stay consistent with User / Profile rules.

## Status

accepted

## Considered options

- Client-primary `@supabase/supabase-js` Data API with RLS only — rejected for v1 API shape; still used on-device for Auth session lifecycle (`signUp` / `signIn` / refresh)
- Custom Edge Function wrappers around sign-up/sign-in — rejected; credential exchange stays on the Auth client
- Cookie/`@supabase/ssr` — rejected; Expo is not a cookie SSR host
