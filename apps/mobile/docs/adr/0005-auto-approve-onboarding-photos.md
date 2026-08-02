# Auto-approve photos during Onboarding

Profile activation requires approved gallery and collection photos, but v1 has no moderation pipeline.

**Decision:** Photos uploaded during Onboarding are stored with `moderationStatus: approved` immediately so the member can finish first-run. A real moderation path can tighten this later without changing the Profile photo shape.

**Why:** Otherwise Onboarding cannot reach an `active` Profile (ADR 0003) with no human/system reviewer in the loop.

## Status

accepted
