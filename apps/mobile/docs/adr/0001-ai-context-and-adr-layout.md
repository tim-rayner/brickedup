# AI context and ADR layout

We need agents and humans to share product language and a decision history without inventing competing glossaries or dumping every chat conclusion into docs.

**Decision:** Multi-context map at the repo root ([CONTEXT-MAP.md](../../../../CONTEXT-MAP.md)); product glossary in root [CONTEXT.md](../../../../CONTEXT.md); thin mobile [CONTEXT.md](../../CONTEXT.md); playbooks in root and mobile `AGENTS.md`; ADRs primarily under `apps/mobile/docs/adr/` with root `docs/adr/` reserved for true monorepo-wide decisions; no package-level contexts until language is contested.

**Why:** Keeps ubiquitous language out of implementation playbooks, matches where code lives today (mobile-heavy), and creates ADRs lazily under a three-criteria rule so history stays useful.

## Status

accepted

## Considered Options

- Single root `CONTEXT.md` only — rejected; mobile may later need bounded terms without polluting the product glossary
- ADR home only at repo root — rejected; most decisions will be about the Expo app
- Package contexts for `theme` / configs up front — rejected; create lazily when terms are contested
