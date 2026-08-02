import { profileLocations } from '@repo/db/schema';
import { z } from 'zod/v4';

import { createSelectSchema } from './drizzle-zod';

/**
 * Private Profile location (WGS84) for distance matching.
 * Not part of the public Profile card — own-row only in RLS.
 * Derived from `@repo/db` `profile_locations` table.
 */
export const profileLocationSchema = createSelectSchema(profileLocations, {
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type ProfileLocation = z.infer<typeof profileLocationSchema>;
