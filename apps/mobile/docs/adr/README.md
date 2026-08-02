# Architecture Decision Records (mobile-primary)

Most Bricked Up ADRs live here because the mobile app is the primary product surface today.

Monorepo-wide decisions that cannot live here go in [`../../../docs/adr/`](../../../docs/adr/).

## When to add an ADR

All three must be true:

1. **Hard to reverse** — changing your mind later is costly
2. **Surprising without context** — a future reader will wonder why this path was chosen
3. **Real trade-off** — genuine alternatives existed and one was picked for specific reasons

If any criterion is missing, do not create an ADR. Capture vocabulary in `CONTEXT.md` instead; capture how-to in `AGENTS.md`.

## Format

Files: `NNNN-slug.md` (sequential). Prefer a short title and 1–3 sentences of context, decision, and why. Optional status / options / consequences only when they add value.

See [0001-ai-context-and-adr-layout.md](./0001-ai-context-and-adr-layout.md) for the foundational layout decision.

## Records

- [0001](./0001-ai-context-and-adr-layout.md) — AI context + ADR layout
- [0002](./0002-edge-function-scoped-auth.md) — Edge Functions + `@supabase/server`
- [0003](./0003-onboarding-equals-active-profile.md) — Onboarding finishes at active Profile
- [0004](./0004-optional-afol-signals-for-activation.md) — Optional themes / top sets
- [0005](./0005-auto-approve-onboarding-photos.md) — Auto-approve Onboarding photos
- [0006](./0006-location-gps-with-typeahead-fallback.md) — GPS + Nominatim typeahead
- [0007](./0007-email-confirmation-before-onboarding.md) — Email confirmation (link + OTP `{{ .Token }}`)
- [0008](./0008-top-sets-free-text-v1.md) — Free-text top sets for v1
