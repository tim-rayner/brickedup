# Context Map

Bricked Up is a multi-context repo. Product language lives at the root; the mobile app may hold terms that are bounded to that surface.

## Contexts

- [Bricked Up](./CONTEXT.md) — product domain: AFOL dating vocabulary shared across the monorepo
- [Mobile](./apps/mobile/CONTEXT.md) — mobile-bounded terms only (thin; most language stays in the root context)

## Relationships

- **Bricked Up → Mobile**: Mobile implements the product domain; it does not redefine product terms.
- **Packages**: Shared packages (`theme`, `eslint-config`, `typescript-config`) have no separate contexts. Theme or design vocabulary that becomes contested product language belongs in the root context.

## Agent playbooks (not glossaries)

- [Root AGENTS.md](./AGENTS.md) — monorepo navigation and conventions
- [Mobile AGENTS.md](./apps/mobile/AGENTS.md) — Expo / app runtime constraints

## Decision history

ADRs are mobile-heavy: prefer [`apps/mobile/docs/adr/`](./apps/mobile/docs/adr/). Use root [`docs/adr/`](./docs/adr/) only for decisions that are truly monorepo-wide and have no better home.
