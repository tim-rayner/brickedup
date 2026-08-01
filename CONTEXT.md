# Bricked Up

Product domain for an AFOL dating app. Glossary only — no implementation detail.

## Language

**AFOL**:
An Adult Fan of LEGO; the intended member of this product.
_Avoid_: Lego adult, hobbyist (when meaning the member persona)

**Bricked Up**:
The product name for this dating app.
_Avoid_: BrickedUp, bricked-up (in prose); the app; the platform (when meaning the product)

**User** (Account):
The authenticated member record in the product (app-level account linked to Supabase Auth). Owns status such as active, suspended, or deleted.
_Avoid_: Profile (when meaning the private account); auth user (in product prose)

**Profile**:
A member's public dating presence in the product (1:1 with a User).
_Avoid_: Account, user page, bio (when meaning the whole presence)

**Matching preferences**:
Discovery filters for who a member wants to see (interested-in, age range, distance) — not part of the Profile card itself.
_Avoid_: Settings (when meaning these filters); Profile preferences (ambiguous)

**Top set**:
One of up to three LEGO sets featured on a Profile, added barcode-first with a manual picker fallback.
_Avoid_: Favourite set (when meaning this ranked slot); collection (when meaning a single set)

**Favourite theme**:
One of up to three ranked LEGO themes on a Profile, chosen from a controlled list.
_Avoid_: Interest tag; hobby

**Collection photo**:
The dedicated Profile photo of a member's LEGO collection (distinct from gallery photos).
_Avoid_: Gallery photo; set photo
