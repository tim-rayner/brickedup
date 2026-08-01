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
