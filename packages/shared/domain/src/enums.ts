import { z } from 'zod';

/** App-level account status on `public.users` (not Supabase Auth). */
export const userStatusSchema = z.enum(['active', 'suspended', 'deleted']);
export type UserStatus = z.infer<typeof userStatusSchema>;

/** Dating Profile lifecycle. Discovery only when `active` (and User is `active`). */
export const profileStatusSchema = z.enum(['draft', 'active', 'paused', 'removed']);
export type ProfileStatus = z.infer<typeof profileStatusSchema>;

export const genderSchema = z.enum(['male', 'female']);
export type Gender = z.infer<typeof genderSchema>;

/** Who the member wants to see in discovery. */
export const interestedInSchema = z.enum(['male', 'female', 'both']);
export type InterestedIn = z.infer<typeof interestedInSchema>;

export const photoKindSchema = z.enum(['gallery', 'collection']);
export type PhotoKind = z.infer<typeof photoKindSchema>;

export const moderationStatusSchema = z.enum(['pending', 'approved', 'rejected']);
export type ModerationStatus = z.infer<typeof moderationStatusSchema>;

/** How a top set was attached to a Profile. */
export const topSetSourceSchema = z.enum(['scan', 'manual']);
export type TopSetSource = z.infer<typeof topSetSourceSchema>;

/**
 * Controlled favourite-theme list for v1.
 * Extend deliberately — free text is not allowed on Profile theme ranks.
 */
export const legoThemeSchema = z.enum([
  'star_wars',
  'technic',
  'city',
  'ideas',
  'creator',
  'architecture',
  'friends',
  'ninjago',
  'harry_potter',
  'marvel',
  'dc',
  'icons',
  'speed_champions',
  'botanical',
  'castle',
  'space',
  'trains',
  'other',
]);
export type LegoTheme = z.infer<typeof legoThemeSchema>;

/** Rank slots for top-3 lists (themes and sets). */
export const topThreeRankSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type TopThreeRank = z.infer<typeof topThreeRankSchema>;
