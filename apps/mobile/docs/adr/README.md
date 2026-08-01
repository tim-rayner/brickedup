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
