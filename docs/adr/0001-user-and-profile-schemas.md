# User and Profile schemas

We need durable shapes for who can sign in versus what appears in discovery, before Supabase tables or onboarding UI lock us into a blob.

**Decision:** Separate `User` (account) from `Profile` (1:1); put domain types in `packages/shared/domain` (`@repo/domain`); use Supabase Auth as credential source with a thin `public.users` row for app status. Discovery requires both account and profile `active`. Matching/swipes/messages are out of scope for this pass.

**Why:** Dating flows need “account exists, profile incomplete,” account-level suspension without inventing profile states for bans, and shared types outside the Expo app once persistence lands. A single fat user document collapses those concerns.

## Status

accepted

## Schema summary

- **User** (`public.users`): `id` = `auth.users.id`, denormalized `email`, `status: active | suspended | deleted`, onboarding completion, timestamps. Soft-delete + delayed personal-data purge.
- **Profile** (1:1): `status: draft | active | paused | removed`; identity fields (display name, DOB 18+, gender `male | female`, bio, display location + hidden geo).
- **MatchingPreferences** (1:1): `interestedIn` male / female / both, age range, max distance — not mixed into Profile.
- **ProfilePhoto**: separate rows; `kind: gallery | collection`; ≥1 gallery + 1 collection to leave `draft`.
- **AFOL signals (required for active):** top 3 favourite themes (controlled list); top 3 sets (barcode-first, manual picker fallback); collection photo.
- **Out of scope:** swipes, matches, messages.

## Considered options

- Single `profiles` row owning auth + dating fields — rejected; bans, onboarding, and discovery payloads diverge too early
- Multi-profile per account — rejected for v1 complexity
- Barcode-only set entry — rejected; barcode-first with manual fallback so activation is not dead-ended
- Gender beyond male/female — rejected for v1 product choice; preferences are male, female, or both
- Domain types only inside `apps/mobile` — rejected; persistence and future surfaces need `packages/shared/domain`
