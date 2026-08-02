import {
  genderEnum,
  interestedInEnum,
  legoThemeEnum,
  moderationStatusEnum,
  photoKindEnum,
  profileStatusEnum,
  topSetSourceEnum,
  userStatusEnum,
} from '@repo/db/schema';
import { z } from 'zod/v4';

import { createSelectSchema } from './drizzle-zod';

export const userStatusSchema = createSelectSchema(userStatusEnum);
export type UserStatus = z.infer<typeof userStatusSchema>;

export const profileStatusSchema = createSelectSchema(profileStatusEnum);
export type ProfileStatus = z.infer<typeof profileStatusSchema>;

export const genderSchema = createSelectSchema(genderEnum);
export type Gender = z.infer<typeof genderSchema>;

export const interestedInSchema = createSelectSchema(interestedInEnum);
export type InterestedIn = z.infer<typeof interestedInSchema>;

export const photoKindSchema = createSelectSchema(photoKindEnum);
export type PhotoKind = z.infer<typeof photoKindSchema>;

export const moderationStatusSchema = createSelectSchema(moderationStatusEnum);
export type ModerationStatus = z.infer<typeof moderationStatusSchema>;

export const topSetSourceSchema = createSelectSchema(topSetSourceEnum);
export type TopSetSource = z.infer<typeof topSetSourceSchema>;

export const legoThemeSchema = createSelectSchema(legoThemeEnum);
export type LegoTheme = z.infer<typeof legoThemeSchema>;

/** Rank slots for top-3 lists (themes and sets). */
export const topThreeRankSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type TopThreeRank = z.infer<typeof topThreeRankSchema>;
