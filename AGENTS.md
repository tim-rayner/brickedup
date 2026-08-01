# Bricked Up — agent guide

Turborepo monorepo (`pnpm` + Turbo). Read domain language before inventing names.

## Before you code

1. Read [CONTEXT-MAP.md](./CONTEXT-MAP.md) to find the right context.
2. Read [CONTEXT.md](./CONTEXT.md) for product vocabulary. Do not redefine those terms in app code or docs.
3. For mobile work, also read [apps/mobile/AGENTS.md](./apps/mobile/AGENTS.md) and [apps/mobile/CONTEXT.md](./apps/mobile/CONTEXT.md).
4. Check existing ADRs under [apps/mobile/docs/adr/](./apps/mobile/docs/adr/) (primary) and [docs/adr/](./docs/adr/) (monorepo-wide only) before reversing a prior decision.

## Layout

| Path | Role |
|------|------|
| `apps/mobile` | Expo app — primary product surface today |
| `packages/shared/domain` | Shared domain schemas/types (`@repo/domain`) |
| `packages/theme` | Shared theme package (no separate context) |
| `packages/eslint-config` | Shared ESLint config |
| `packages/typescript-config` | Shared TSConfig |

## Commands

- Install: `pnpm install` from repo root
- Dev / build / lint / types: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm check-types` (Turbo)

## Context vs playbook vs ADR

- **CONTEXT.md** — ubiquitous language (glossary). No implementation.
- **AGENTS.md** — how agents should work in this repo.
- **docs/adr/** — hard-to-reverse decisions with real trade-offs. See the ADR README three-criteria rule.

## When to write an ADR

Only when all three are true: hard to reverse, surprising without context, and the result of a real trade-off. Prefer `apps/mobile/docs/adr/` unless the decision is clearly monorepo-wide.

## Cursor Cloud specific instructions

### Services

The mobile Expo app is the entire product; there is no backend, database, or other service. In the cloud VM the app can only be exercised via the **web** target (no iOS/Android simulators are available).

- Install deps: `pnpm install` from the repo root (Node 22 / pnpm 9 are preinstalled; the update script handles this on startup).
- Run (web): from `apps/mobile`, `npx expo start --web --port 8081`, or from the root `pnpm --filter mobile web`. Metro serves the web app on port `8081`. `pnpm dev` runs Turbo's persistent `dev` task, but that launches the interactive Expo CLI, so for web verification prefer running `expo start --web` directly.
- Lint: `pnpm lint` (root) or `pnpm --filter mobile lint` (`expo lint`).
- Type-check: `pnpm check-types` (Turbo; mobile, `@repo/domain`, and `@repo/theme`).
- Tests: `pnpm test` (Turbo; `@repo/domain` runs Vitest; other packages no-op until suites land).

### Non-obvious caveats

- `expo lint` performs a one-time interactive-style setup on first run in a fresh checkout: it adds the `eslint-config-expo` devDependency and generates `apps/mobile/eslint.config.js`. These files are committed, so lint runs cleanly without that setup afterward.
- The web bundle takes ~10s to build on first request; a `200` from `http://localhost:8081/` confirms the server is up.
