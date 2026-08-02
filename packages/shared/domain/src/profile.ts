import { profiles } from '@repo/db/schema';
import { z } from 'zod/v4';

import { createSelectSchema } from './drizzle-zod';

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD date of birth');

/**
 * Public dating Profile (shared PK with User).
 * AFOL lists, photos, matching preferences, and Profile location are separate shapes.
 * Derived from `@repo/db` `profiles` table.
 */
export const profileSchema = createSelectSchema(profiles, {
  displayName: z.string().trim().min(1).max(40),
  dateOfBirth: isoDateString,
  bio: z.string().trim().min(1).max(500),
  displayLocation: z.string().trim().min(1).max(120),
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
