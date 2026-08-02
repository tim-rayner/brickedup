import { matchingPreferences } from '@repo/db/schema';
import { z } from 'zod/v4';

import { createSelectSchema } from './drizzle-zod';
import { MINIMUM_AGE_YEARS } from './profile';

/**
 * Discovery filters — "who I want", not "who I am".
 * Shared PK with User / Profile.
 * Derived from `@repo/db` `matching_preferences` table.
 */
export const matchingPreferencesSchema = createSelectSchema(matchingPreferences, {
  minAge: z.number().int().min(MINIMUM_AGE_YEARS).max(100),
  maxAge: z.number().int().min(MINIMUM_AGE_YEARS).max(100),
  maxDistanceKm: z.number().int().positive().max(500),
}).refine((value) => value.minAge <= value.maxAge, {
  message: 'minAge must be less than or equal to maxAge',
  path: ['minAge'],
});

export type MatchingPreferences = z.infer<typeof matchingPreferencesSchema>;
