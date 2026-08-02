# Email confirmation required before Onboarding

Sign-up must establish a real mailbox before Profile work begins.

**Decision:** Keep Supabase Auth email confirmation enabled. After `signUp`, the app shows a “check your email” state; the confirmation link deep-links back into the Expo app (`scheme` / linking), establishes the session, then routes into Onboarding. Unconfirmed Users do not enter the Onboarding steps.

**Why:** Dating accounts tied to throwaway or mistyped emails are costly; deep linking is the native path for Auth redirects. Disabling confirmation was rejected for v1 despite slower first-run.

## Status

accepted
