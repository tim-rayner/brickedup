# Onboarding completes only with an active Profile

We need a clear finish line for first-run before the stepped UI and `onboardingCompletedAt` diverge from discovery eligibility.

**Decision:** Onboarding is not complete until the Profile meets activation and can become `active`. Finishing the flow sets `User.onboardingCompletedAt` and transitions the Profile out of `draft`. Prefer few multi-field screens over many single-field screens; do not drop activation requirements to shorten the path.

**Why:** A dating app’s first-run value is a complete, discoverable presence. Splitting “onboarding done” from “Profile active” creates a second funnel and a half-built card after the celebratory finish.

## Status

accepted

## Considered options

- Draft Profile + later activation as a separate quest — rejected for v1; finish line would lie about readiness
- Account-basics-only onboarding — rejected; AFOL signals and photos are core to Bricked Up, not optional polish
