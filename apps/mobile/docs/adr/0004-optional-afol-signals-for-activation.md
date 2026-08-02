# Favourite themes and top sets optional for activation

ADR 0001 required three favourite themes and three top sets before a Profile could leave `draft`. That blocks a short first-run finish line and fights the glossary’s “up to three.”

**Decision:** Favourite themes and top sets remain first-class Profile AFOL signals and stay as Onboarding steps, but both are skippable and **not** required for Profile activation. Collection photo and gallery photo rules are unchanged. Supersedes the “AFOL signals (required for active): top 3 favourite themes / top 3 sets” line in ADR 0001.

**Why:** Members should reach a discoverable Profile without catalog homework; themes and sets deepen the card when the member is ready.

## Status

accepted

## Considered options

- Required themes/sets for `active` — rejected; lengthens Onboarding and contradicts “up to three”
- Remove themes/sets from Onboarding entirely — rejected; still want the prompt in first-run, just skippable
