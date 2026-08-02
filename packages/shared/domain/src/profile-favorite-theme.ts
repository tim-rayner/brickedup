import { z } from 'zod';

import { legoThemeSchema, topThreeRankSchema } from './enums';

/** Ordered favourite LEGO theme on a Profile (up to three; optional for active). */
export const profileFavoriteThemeSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  theme: legoThemeSchema,
  rank: topThreeRankSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ProfileFavoriteTheme = z.infer<typeof profileFavoriteThemeSchema>;

/** Soft cap for favourite themes on a Profile (optional signal). */
export const REQUIRED_FAVORITE_THEME_COUNT = 3;
