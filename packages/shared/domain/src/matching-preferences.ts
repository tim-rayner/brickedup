import { z } from 'zod';

import { interestedInSchema } from './enums';
import { MINIMUM_AGE_YEARS } from './profile';

/**
 * Discovery filters — "who I want", not "who I am".
 * 1:1 with Profile / User.
 */
export const matchingPreferencesSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    interestedIn: interestedInSchema,
    minAge: z.number().int().min(MINIMUM_AGE_YEARS).max(100),
    maxAge: z.number().int().min(MINIMUM_AGE_YEARS).max(100),
    maxDistanceKm: z.number().positive().max(500),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
  .refine((value) => value.minAge <= value.maxAge, {
    message: 'minAge must be less than or equal to maxAge',
    path: ['minAge'],
  });

export type MatchingPreferences = z.infer<typeof matchingPreferencesSchema>;
