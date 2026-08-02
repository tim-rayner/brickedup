# Drizzle as schema source of truth

We need one durable definition of Postgres tables before onboarding and discovery lock us into divergent Zod vs SQL shapes.

**Decision:** Own tables, enums, uniqueness, migrations, and RLS in `packages/shared/db` (`@repo/db`). Derive product Zod in `packages/shared/domain` via `drizzle-zod` + refinements. Mobile depends on `@repo/domain` only and never opens Postgres. `profiles` / `matching_preferences` / `profile_locations` share the User uuid as PK; WGS84 lives in `profile_locations` (own-row RLS). Version RLS policies with tables: own-row CRUD, plus cross-user select of active Profiles and their photos/themes/sets when the viewer User is `active`.

**Why:** Hand-maintained Zod drifted from persistence as soon as Supabase landed. Shared PKs simplify RLS (`auth.uid() = id`). Splitting Profile location keeps display location public without leaking coordinates through discovery selects.

## Status

accepted

## Considered options

- Zod-first in `@repo/domain` with Drizzle mirroring by hand — rejected; two sources of truth
- Zod generated inside `@repo/db` — rejected; validation/product rules belong in domain
- Expo app connecting with `DATABASE_URL` — rejected; credential exposure
- Fail-closed RLS with no policies yet — rejected in favour of versioned own-row + discovery read policies alongside table creation
