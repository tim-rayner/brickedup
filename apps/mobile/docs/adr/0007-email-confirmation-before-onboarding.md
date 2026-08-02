# Email confirmation required before Onboarding

Sign-up must establish a real mailbox before Profile work begins.

**Decision:** Keep Supabase Auth email confirmation enabled. After `signUp`, the app shows an OTP entry screen; the member enters the code from `{{ .Token }}` and the client calls `verifyOtp({ type: 'email' })` (`signup` / `magiclink` types are deprecated for verification). Unconfirmed Users do not enter Onboarding. The Confirm sign up template must include `{{ .Token }}` and must **not** include `{{ .ConfirmationURL }}` — email-client link prefetch consumes the same token and makes the OTP fail immediately with “expired or invalid”.

**Why:** Dating accounts tied to throwaway or mistyped emails are costly. In-app OTP matches common dating-app UX and avoids fragile deep-link confirmation. See `supabase/templates/confirmation.html` and `docs/auth-email-templates.md`.

## Status

accepted
