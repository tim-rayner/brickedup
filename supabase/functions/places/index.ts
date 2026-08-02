import { withSupabase } from 'npm:@supabase/server';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'BrickedUp/1.0 (dating app; contact: support@brickedup.app)';

type NominatimItem = {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
};

async function nominatimFetch(path: string): Promise<Response> {
  return fetch(`${NOMINATIM_BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  });
}

/**
 * Place search + reverse geocode via Nominatim (ADR 0006).
 * POST { action: 'search', query } | { action: 'reverse', latitude, longitude }
 */
export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    if (!ctx.userClaims?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const action = (body as { action?: string }).action;

    if (action === 'search') {
      const query = String((body as { query?: string }).query ?? '').trim();
      if (query.length < 2) {
        return Response.json({ results: [] });
      }

      const url = `/search?format=json&addressdetails=0&limit=6&q=${encodeURIComponent(query)}`;
      const res = await nominatimFetch(url);
      if (!res.ok) {
        return Response.json({ error: 'Place search failed' }, { status: 502 });
      }
      const data = (await res.json()) as NominatimItem[];
      return Response.json({
        results: data.map((item) => ({
          id: String(item.place_id),
          displayLocation: item.display_name,
          latitude: Number(item.lat),
          longitude: Number(item.lon),
        })),
      });
    }

    if (action === 'reverse') {
      const latitude = Number((body as { latitude?: number }).latitude);
      const longitude = Number((body as { longitude?: number }).longitude);
      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return Response.json({ error: 'latitude and longitude are required' }, { status: 400 });
      }

      const url = `/reverse?format=json&lat=${latitude}&lon=${longitude}`;
      const res = await nominatimFetch(url);
      if (!res.ok) {
        return Response.json({ error: 'Reverse geocode failed' }, { status: 502 });
      }
      const data = (await res.json()) as { display_name?: string };
      if (!data.display_name) {
        return Response.json({ error: 'No place found' }, { status: 404 });
      }
      return Response.json({
        displayLocation: data.display_name,
        latitude,
        longitude,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  }),
};
