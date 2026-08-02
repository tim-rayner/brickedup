# Email confirmation required before Onboarding

Sign-up must establish a real mailbox before Profile work begins.

**Decision:** Keep Supabase Auth email confirmation enabled. After `signUp`, the app shows an OTP entry screen; the member enters the 6-digit `{{ .Token }}` from the Confirm sign up email and the client calls `verifyOtp({ type: 'signup' })`. Unconfirmed Users do not enter Onboarding. Deep-link confirmation was rejected after testing — default templates omit the OTP, and link prefetching / Expo redirect setup is fragile on mobile.

**Why:** Dating accounts tied to throwaway or mistyped emails are costly. In-app OTP matches common dating-app UX and does not depend on custom URL schemes for the first-run finish line. The Confirm sign up template **must** include `{{ .Token }}` (see `supabase/templates/confirmation.html`).

## Status

accepted
