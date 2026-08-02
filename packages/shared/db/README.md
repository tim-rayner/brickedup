# `@repo/db`

Shared Postgres schema for Bricked Up (Drizzle ORM).

- **Source of truth** for table shapes, enums, uniqueness, and RLS policies
- Migrations live in `drizzle/`
- Runtime client: `createDb(databaseUrl)` — server/tooling only, never the Expo app

```ts
import { createDb, users, profiles } from '@repo/db';
```

Product Zod validation lives in `@repo/domain` (derived via `drizzle-zod`).

See [docs/adr/0002-drizzle-as-schema-source-of-truth.md](../../../docs/adr/0002-drizzle-as-schema-source-of-truth.md).

## Scripts

From repo root:

```bash
pnpm db:generate   # write SQL migration from schema changes
pnpm db:migrate    # apply migrations to DATABASE_URL
pnpm db:studio     # Drizzle Studio
```

Copy `.env.example` → `.env` and set `DATABASE_URL` (Supabase pooler or direct connection string).

If the password contains reserved URL characters (`&`, `@`, `#`, etc.), percent-encode them (e.g. `&` → `%26`).

## Apply migrations to Supabase

Prefer **`generate` + `migrate`** over `drizzle-kit push` so RLS policies in SQL are applied correctly.

1. In the [Supabase dashboard](https://supabase.com/dashboard) → **Project Settings → Database**, copy the connection string.
   - For Drizzle migrate, the **direct** connection (port `5432`) is often more reliable than the pooler (`6543`).
   - Use the `postgres` role password; never put this URL in the Expo app.
2. Put it in `packages/shared/db/.env` as `DATABASE_URL=...` (gitignored).
3. From the repo root:

```bash
pnpm db:generate   # only when schema TypeScript changed
pnpm db:migrate    # applies files under packages/shared/db/drizzle/
```

4. In Supabase → **Database → Migrations** (or Table Editor), confirm tables (`users`, `profiles`, …) and that RLS is enabled with the expected policies.
5. Optional: `pnpm db:studio` to browse via Drizzle Studio.

Do **not** re-run a migration that already applied unless you are resetting a throwaway project. For a clean local reset, use a fresh Supabase branch/project or drop public tables carefully (auth schema stays managed by Supabase).
