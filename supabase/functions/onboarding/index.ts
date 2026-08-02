import { withSupabase } from 'npm:@supabase/server';

type IdentityBody = {
  action: 'save_identity';
  displayName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
};

type PreferencesBody = {
  action: 'save_preferences';
  interestedIn: 'male' | 'female' | 'both';
  minAge: number;
  maxAge: number;
  maxDistanceKm: number;
};

type PhotosBody = {
  action: 'save_photos';
  galleryPaths: string[];
  collectionPath: string;
};

type ThemesBody = {
  action: 'save_themes';
  themes: Array<{ theme: string; rank: 1 | 2 | 3 }>;
};

type TopSetsBody = {
  action: 'save_top_sets';
  topSets: Array<{ setNumber: string; name: string; rank: 1 | 2 | 3 }>;
};

type PlaceBody = {
  action: 'save_place_bio';
  displayLocation: string;
  latitude: number;
  longitude: number;
  bio: string;
};

type CompleteBody = { action: 'complete' };

type Body =
  | IdentityBody
  | PreferencesBody
  | PhotosBody
  | ThemesBody
  | TopSetsBody
  | PlaceBody
  | CompleteBody;

function ageFromDob(dateOfBirth: string, now = new Date()): number {
  const [year, month, day] = dateOfBirth.split('-').map(Number);
  if (!year || !month || !day) return 0;
  let age = now.getUTCFullYear() - year;
  const monthIndex = month - 1;
  const hadBirthday =
    now.getUTCMonth() > monthIndex ||
    (now.getUTCMonth() === monthIndex && now.getUTCDate() >= day);
  if (!hadBirthday) age -= 1;
  return age;
}

function hasUniqueRanksInRange(ranks: ReadonlyArray<number>): boolean {
  const set = new Set(ranks);
  if (set.size !== ranks.length) return false;
  return ranks.every((rank) => rank === 1 || rank === 2 || rank === 3);
}

/**
 * Onboarding mutations against @repo/db shapes (shared PK = auth.uid()).
 * RLS policies from Drizzle; this function uses the caller-scoped client.
 */
export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    const userId = ctx.userClaims?.id;
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const body = (await req.json().catch(() => null)) as Body | null;
    if (!body?.action) {
      return Response.json({ error: 'Invalid body' }, { status: 400 });
    }

    // Shared PK: profile id === user id === auth.uid()
    const profileId = userId;
    const now = new Date().toISOString();

    if (body.action === 'save_identity') {
      const displayName = body.displayName?.trim() ?? '';
      if (!displayName || displayName.length > 40) {
        return Response.json({ error: 'displayName must be 1–40 characters' }, { status: 400 });
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(body.dateOfBirth) || ageFromDob(body.dateOfBirth) < 18) {
        return Response.json({ error: 'Must be at least 18' }, { status: 400 });
      }
      if (body.gender !== 'male' && body.gender !== 'female') {
        return Response.json({ error: 'Invalid gender' }, { status: 400 });
      }

      const { data: existing } = await ctx.supabase
        .from('profiles')
        .select('id')
        .eq('id', profileId)
        .maybeSingle();

      if (existing) {
        const { error } = await ctx.supabase
          .from('profiles')
          .update({
            display_name: displayName,
            date_of_birth: body.dateOfBirth,
            gender: body.gender,
            updated_at: now,
          })
          .eq('id', profileId);
        if (error) return Response.json({ error: error.message }, { status: 500 });
      } else {
        // NOT NULL columns: bio / display_location filled in place step (empty until then).
        const { error } = await ctx.supabase.from('profiles').insert({
          id: profileId,
          status: 'draft',
          display_name: displayName,
          date_of_birth: body.dateOfBirth,
          gender: body.gender,
          bio: '',
          display_location: '',
        });
        if (error) return Response.json({ error: error.message }, { status: 500 });
      }
      return Response.json({ ok: true });
    }

    if (body.action === 'save_preferences') {
      if (!['male', 'female', 'both'].includes(body.interestedIn)) {
        return Response.json({ error: 'Invalid interestedIn' }, { status: 400 });
      }
      if (
        body.minAge < 18 ||
        body.maxAge > 100 ||
        body.minAge > body.maxAge ||
        body.maxDistanceKm <= 0 ||
        body.maxDistanceKm > 500
      ) {
        return Response.json({ error: 'Invalid preference ranges' }, { status: 400 });
      }

      const { data: profile } = await ctx.supabase
        .from('profiles')
        .select('id')
        .eq('id', profileId)
        .maybeSingle();
      if (!profile) {
        return Response.json({ error: 'Profile not found — save identity first' }, { status: 400 });
      }

      const { data: existing } = await ctx.supabase
        .from('matching_preferences')
        .select('id')
        .eq('id', profileId)
        .maybeSingle();

      const payload = {
        interested_in: body.interestedIn,
        min_age: body.minAge,
        max_age: body.maxAge,
        max_distance_km: Math.round(body.maxDistanceKm),
        updated_at: now,
      };

      const { error } = existing
        ? await ctx.supabase.from('matching_preferences').update(payload).eq('id', profileId)
        : await ctx.supabase.from('matching_preferences').insert({ id: profileId, ...payload });

      if (error) return Response.json({ error: error.message }, { status: 500 });
      return Response.json({ ok: true });
    }

    if (body.action === 'save_photos') {
      const galleryPaths = Array.isArray(body.galleryPaths) ? body.galleryPaths : [];
      const collectionPath = body.collectionPath?.trim() ?? '';
      if (galleryPaths.length < 1 || galleryPaths.length > 6 || !collectionPath) {
        return Response.json(
          { error: 'Need 1–6 gallery paths and one collection path' },
          { status: 400 },
        );
      }

      const { data: profile } = await ctx.supabase
        .from('profiles')
        .select('id')
        .eq('id', profileId)
        .maybeSingle();
      if (!profile) {
        return Response.json({ error: 'Profile not found — save identity first' }, { status: 400 });
      }

      await ctx.supabase.from('profile_photos').delete().eq('profile_id', profileId);

      const rows = [
        ...galleryPaths.map((storage_path, index) => ({
          profile_id: profileId,
          kind: 'gallery' as const,
          storage_path,
          sort_order: index,
          is_primary: index === 0,
          moderation_status: 'approved' as const,
        })),
        {
          profile_id: profileId,
          kind: 'collection' as const,
          storage_path: collectionPath,
          sort_order: 0,
          is_primary: false,
          moderation_status: 'approved' as const,
        },
      ];

      const { error } = await ctx.supabase.from('profile_photos').insert(rows);
      if (error) return Response.json({ error: error.message }, { status: 500 });
      return Response.json({ ok: true });
    }

    if (body.action === 'save_themes') {
      const themes = Array.isArray(body.themes) ? body.themes : [];
      if (themes.length > 3) {
        return Response.json({ error: 'At most 3 favourite themes' }, { status: 400 });
      }
      const ranks = themes.map((t) => t.rank);
      if (themes.length > 0 && !hasUniqueRanksInRange(ranks)) {
        return Response.json({ error: 'Theme ranks must be unique in 1–3' }, { status: 400 });
      }

      await ctx.supabase.from('profile_favorite_themes').delete().eq('profile_id', profileId);
      if (themes.length > 0) {
        const { error } = await ctx.supabase.from('profile_favorite_themes').insert(
          themes.map((t) => ({
            profile_id: profileId,
            theme: t.theme,
            rank: t.rank,
          })),
        );
        if (error) return Response.json({ error: error.message }, { status: 500 });
      }
      return Response.json({ ok: true });
    }

    if (body.action === 'save_top_sets') {
      const topSets = Array.isArray(body.topSets) ? body.topSets : [];
      if (topSets.length > 3) {
        return Response.json({ error: 'At most 3 top sets' }, { status: 400 });
      }
      const ranks = topSets.map((t) => t.rank);
      if (topSets.length > 0 && !hasUniqueRanksInRange(ranks)) {
        return Response.json({ error: 'Top set ranks must be unique in 1–3' }, { status: 400 });
      }

      await ctx.supabase.from('profile_top_sets').delete().eq('profile_id', profileId);
      if (topSets.length > 0) {
        const { error } = await ctx.supabase.from('profile_top_sets').insert(
          topSets.map((t) => ({
            profile_id: profileId,
            rank: t.rank,
            source: 'manual',
            barcode: null,
            set_number: t.setNumber.trim(),
            name: t.name.trim(),
            image_url: null,
            theme: null,
          })),
        );
        if (error) return Response.json({ error: error.message }, { status: 500 });
      }
      return Response.json({ ok: true });
    }

    if (body.action === 'save_place_bio') {
      const displayLocation = body.displayLocation?.trim() ?? '';
      const bio = body.bio?.trim() ?? '';
      if (!displayLocation || displayLocation.length > 120) {
        return Response.json({ error: 'Invalid displayLocation' }, { status: 400 });
      }
      if (!bio || bio.length > 500) {
        return Response.json({ error: 'bio must be 1–500 characters' }, { status: 400 });
      }
      if (
        Number.isNaN(body.latitude) ||
        Number.isNaN(body.longitude) ||
        body.latitude < -90 ||
        body.latitude > 90 ||
        body.longitude < -180 ||
        body.longitude > 180
      ) {
        return Response.json({ error: 'Invalid coordinates' }, { status: 400 });
      }

      const { error: profileError } = await ctx.supabase
        .from('profiles')
        .update({
          display_location: displayLocation,
          bio,
          updated_at: now,
        })
        .eq('id', profileId);
      if (profileError) return Response.json({ error: profileError.message }, { status: 500 });

      const { data: existingLocation } = await ctx.supabase
        .from('profile_locations')
        .select('id')
        .eq('id', profileId)
        .maybeSingle();

      const locationPayload = {
        latitude: body.latitude,
        longitude: body.longitude,
        location_updated_at: now,
        updated_at: now,
      };

      const { error: locationError } = existingLocation
        ? await ctx.supabase.from('profile_locations').update(locationPayload).eq('id', profileId)
        : await ctx.supabase.from('profile_locations').insert({ id: profileId, ...locationPayload });

      if (locationError) return Response.json({ error: locationError.message }, { status: 500 });
      return Response.json({ ok: true });
    }

    if (body.action === 'complete') {
      const { data: profile, error: profileError } = await ctx.supabase
        .from('profiles')
        .select('status, display_name, date_of_birth, gender, bio, display_location')
        .eq('id', profileId)
        .single();
      if (profileError || !profile) {
        return Response.json({ error: profileError?.message ?? 'Profile missing' }, { status: 500 });
      }

      const { data: user } = await ctx.supabase
        .from('users')
        .select('status')
        .eq('id', userId)
        .single();

      const { data: location } = await ctx.supabase
        .from('profile_locations')
        .select('latitude, longitude')
        .eq('id', profileId)
        .maybeSingle();

      const { data: photos } = await ctx.supabase
        .from('profile_photos')
        .select('kind, moderation_status')
        .eq('profile_id', profileId);

      const { data: themes } = await ctx.supabase
        .from('profile_favorite_themes')
        .select('rank, theme')
        .eq('profile_id', profileId);

      const { data: topSets } = await ctx.supabase
        .from('profile_top_sets')
        .select('rank, set_number')
        .eq('profile_id', profileId);

      const { data: prefs } = await ctx.supabase
        .from('matching_preferences')
        .select('id')
        .eq('id', profileId)
        .maybeSingle();

      const reasons: string[] = [];
      if (user?.status !== 'active') reasons.push('user must be active');
      if (!profile.display_name?.trim()) reasons.push('display name is required');
      if (!profile.date_of_birth || ageFromDob(profile.date_of_birth) < 18) {
        reasons.push('must be at least 18');
      }
      if (!profile.gender) reasons.push('gender is required');
      if (!profile.bio?.trim()) reasons.push('bio is required');
      if (!profile.display_location?.trim()) reasons.push('display location is required');
      if (
        location == null ||
        Number.isNaN(location.latitude) ||
        Number.isNaN(location.longitude)
      ) {
        reasons.push('geo coordinates are required');
      }
      if (!prefs) reasons.push('matching preferences are required');

      const gallery = (photos ?? []).filter(
        (p) => p.kind === 'gallery' && p.moderation_status === 'approved',
      );
      const collection = (photos ?? []).filter(
        (p) => p.kind === 'collection' && p.moderation_status === 'approved',
      );
      if (gallery.length < 1) reasons.push('at least one approved gallery photo is required');
      if (collection.length !== 1) reasons.push('exactly one approved collection photo is required');

      // Optional AFOL signals (ADR 0004): validate shape only when present.
      const themeRanks = (themes ?? []).map((t) => t.rank as number);
      if ((themes ?? []).length > 3) {
        reasons.push('at most 3 favourite themes are allowed');
      } else if (themeRanks.length > 0 && !hasUniqueRanksInRange(themeRanks)) {
        reasons.push('favourite themes must use unique ranks in 1–3');
      }

      const setRanks = (topSets ?? []).map((t) => t.rank as number);
      if ((topSets ?? []).length > 3) {
        reasons.push('at most 3 top sets are allowed');
      } else if (setRanks.length > 0 && !hasUniqueRanksInRange(setRanks)) {
        reasons.push('top sets must use unique ranks in 1–3');
      }

      if (reasons.length > 0) {
        return Response.json({ ok: false, reasons }, { status: 400 });
      }

      const { error: profileUpdateError } = await ctx.supabase
        .from('profiles')
        .update({ status: 'active', updated_at: now })
        .eq('id', profileId);
      if (profileUpdateError) {
        return Response.json({ error: profileUpdateError.message }, { status: 500 });
      }

      const { error: userUpdateError } = await ctx.supabase
        .from('users')
        .update({ onboarding_completed_at: now, updated_at: now })
        .eq('id', userId);
      if (userUpdateError) {
        return Response.json({ error: userUpdateError.message }, { status: 500 });
      }

      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  }),
};
