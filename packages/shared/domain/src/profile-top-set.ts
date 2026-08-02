import { profileTopSets } from '@repo/db/schema';
import { z } from 'zod/v4';

import { createSelectSchema } from './drizzle-zod';
import { topThreeRankSchema } from './enums';

/**
 * One of a Profile's top 3 LEGO sets.
 * Prefer barcode scan; manual picker is the fallback when scan fails.
 * Derived from `@repo/db` `profile_top_sets` table.
 */
export const profileTopSetSchema = createSelectSchema(profileTopSets, {
  rank: topThreeRankSchema,
  barcode: z.string().min(1).nullable(),
  setNumber: z.string().min(1),
  name: z.string().min(1),
  imageUrl: z.string().url().nullable(),
  theme: z.string().min(1).nullable(),
});

export type ProfileTopSet = z.infer<typeof profileTopSetSchema>;

/** Soft cap for top sets on a Profile (optional signal). */
export const REQUIRED_TOP_SET_COUNT = 3;
