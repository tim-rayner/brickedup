# Auth email templates (hosted Supabase)

Local CLI reads `supabase/templates/` via `config.toml`. **Hosted** projects need the same content pasted in the dashboard.

## Confirm sign up (required for OTP)

1. Open [Authentication → Email Templates → Confirm sign up](https://supabase.com/dashboard/project/_/auth/templates).
2. Set subject: `Your Bricked Up confirmation code`
3. Set body to **OTP only** — include `{{ .Token }}` and **do not** include `{{ .ConfirmationURL }}`:

```html
<h2>Confirm your Bricked Up account</h2>
<p>Enter this code in the app to confirm {{ .Email }}:</p>
<p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">{{ .Token }}</p>
<p>This code expires shortly. If you didn’t create an account, you can ignore this email.</p>
```

### Why no confirmation link?

If the template also has `{{ .ConfirmationURL }}`, some email clients / scanners open the link automatically (prefetch). That **consumes the same token** as the OTP, so entering the code in the app fails immediately with “Token has expired or is invalid”.

### App verification

The app verifies with `verifyOtp({ email, token, type: 'email' })`. Do not use deprecated `type: 'signup'` for verification.
