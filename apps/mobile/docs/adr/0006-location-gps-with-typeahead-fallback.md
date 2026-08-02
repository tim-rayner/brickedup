# Location: GPS first, typeahead fallback

Onboarding needs a member-facing display location plus hidden coordinates for distance matching.

**Decision:** Prefer device GPS (`expo-location`) and reverse-geocode into `displayLocation` + lat/lng. If GPS is denied or fails, the member picks a place via a **typeahead** search (not free-text-only); the selected place supplies both the display string and coordinates. Geocoding/typeahead resolution runs through an Edge Function (`@supabase/server`) against **OpenStreetMap / Nominatim** (or a Nominatim-compatible host) for v1 — no Mapbox/Google keys yet. Respect Nominatim usage policy (identify the app, rate-limit, cache where sensible).

**Why:** GPS is one tap when permitted; typeahead still yields structured geo when it isn’t, without letting members invent unmatchable free text. Nominatim is enough for early volume without a paid geocoder.

## Status

accepted
