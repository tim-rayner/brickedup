import { z } from 'zod';

import { topSetSourceSchema, topThreeRankSchema } from './enums';

/**
 * One of a Profile's top 3 LEGO sets.
 * Prefer barcode scan; manual picker is the fallback when scan fails.
 */
export const profileTopSetSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  rank: topThreeRankSchema,
  source: topSetSourceSchema,
  /** Raw barcode when sourced from scan; null for pure manual picks. */
  barcode: z.string().min(1).nullable(),
  setNumber: z.string().min(1),
  name: z.string().min(1),
  imageUrl: z.string().url().nullable(),
  theme: z.string().min(1).nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ProfileTopSet = z.infer<typeof profileTopSetSchema>;

export const REQUIRED_TOP_SET_COUNT = 3;
