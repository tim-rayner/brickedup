import { z } from 'zod';

import { genderSchema, profileStatusSchema } from './enums';

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD date of birth');

/**
 * Public dating Profile (1:1 with User).
 * AFOL lists, photos, and matching preferences are separate shapes.
 */
export const profileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  status: profileStatusSchema,
  displayName: z.string().trim().min(1).max(40),
  dateOfBirth: isoDateString,
  gender: genderSchema,
  bio: z.string().trim().min(1).max(500),
  /** What others see, e.g. "Manchester, UK". */
  displayLocation: z.string().trim().min(1).max(120),
  /** WGS84 for distance matching — never shown raw on the card. */
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  locationUpdatedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Profile = z.infer<typeof profileSchema>;

/** Minimum age required to use Bricked Up. */
export const MINIMUM_AGE_YEARS = 18;

export function ageFromDateOfBirth(dateOfBirth: string, now = new Date()): number {
  const [year, month, day] = dateOfBirth.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    throw new Error('Invalid date of birth');
  }
  let age = now.getUTCFullYear() - year;
  const monthIndex = month - 1;
  const hadBirthday =
    now.getUTCMonth() > monthIndex ||
    (now.getUTCMonth() === monthIndex && now.getUTCDate() >= day);
  if (!hadBirthday) age -= 1;
  return age;
}

export function isAtLeastMinimumAge(dateOfBirth: string, now = new Date()): boolean {
  return ageFromDateOfBirth(dateOfBirth, now) >= MINIMUM_AGE_YEARS;
}
