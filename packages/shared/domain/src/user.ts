import { users } from '@repo/db/schema';
import { z } from 'zod/v4';

import { createSelectSchema } from './drizzle-zod';

/**
 * Thin app account row keyed to Supabase `auth.users.id`.
 * Credentials stay in Supabase Auth — this shape is moderation/onboarding only.
 * Derived from `@repo/db` `users` table.
 */
export const userSchema = createSelectSchema(users, {
  email: z.string().email(),
});

export type User = z.infer<typeof userSchema>;
