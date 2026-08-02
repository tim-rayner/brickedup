import { profileFavoriteThemes } from '@repo/db/schema';
import { z } from 'zod/v4';

import { createSelectSchema } from './drizzle-zod';
import { topThreeRankSchema } from './enums';

/** Ordered favourite LEGO theme on a Profile (exactly three when active). */
export const profileFavoriteThemeSchema = createSelectSchema(profileFavoriteThemes, {
  rank: topThreeRankSchema,
});

export type ProfileFavoriteTheme = z.infer<typeof profileFavoriteThemeSchema>;

export const REQUIRED_FAVORITE_THEME_COUNT = 3;
