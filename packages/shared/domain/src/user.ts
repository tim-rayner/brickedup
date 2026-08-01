import { z } from 'zod';

import { userStatusSchema } from './enums';

/**
 * Thin app account row keyed to Supabase `auth.users.id`.
 * Credentials stay in Supabase Auth — this shape is moderation/onboarding only.
 */
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  status: userStatusSchema,
  onboardingCompletedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof userSchema>;
