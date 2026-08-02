# Architecture Decision Records (monorepo-wide)

Prefer [`../../apps/mobile/docs/adr/`](../../apps/mobile/docs/adr/) for almost all decisions.

Use this folder only when a decision is:

1. Hard to reverse
2. Surprising without context
3. The result of a real trade-off

…and it is clearly about the monorepo/workspace itself (e.g. package boundaries, Turbo/pnpm policy), not the mobile product surface.

Same numbering and short format as the mobile ADR README.

## Records

- [0001-user-and-profile-schemas.md](./0001-user-and-profile-schemas.md) — User vs Profile split, shared `@repo/domain` package, activation rules
- [0002-drizzle-as-schema-source-of-truth.md](./0002-drizzle-as-schema-source-of-truth.md) — `@repo/db` owns Drizzle/RLS; domain Zod derived; shared PKs; Profile location split
