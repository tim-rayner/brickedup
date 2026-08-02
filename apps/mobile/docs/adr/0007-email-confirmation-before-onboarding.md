# Email confirmation required before Onboarding

Sign-up must establish a real mailbox before Profile work begins.

**Decision:** Keep Supabase Auth email confirmation enabled. After `signUp`, the app shows a “check your email” state offering two ways to complete confirmation from the same email: tapping the confirmation link, which deep-links back into the Expo app (`scheme` / linking) and establishes the session, or entering the 6-digit OTP code Supabase includes in the same email (`supabase.auth.verifyOtp({ type: 'signup' })`), with a resend action (`supabase.auth.resend`). Unconfirmed Users do not enter the Onboarding steps. The Confirm sign up template **must** include `{{ .Token }}` (see `supabase/templates/confirmation.html` and `docs/auth-email-templates.md`) — default hosted templates only ship `{{ .ConfirmationURL }}`, which leaves the in-app code field unusable.

**Why:** Dating accounts tied to throwaway or mistyped emails are costly; deep linking is the native path for Auth redirects. Disabling confirmation was rejected for v1 despite slower first-run. The link alone is untestable on a simulator/emulator, which has no real mailbox to receive and tap it from — the OTP code has no deep-link dependency, so it can be read from Supabase's local Inbucket testing UI (or a real inbox on another device) and typed in by hand.

## Status

accepted
