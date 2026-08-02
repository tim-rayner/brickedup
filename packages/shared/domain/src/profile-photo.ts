import { profilePhotos } from '@repo/db/schema';
import { z } from 'zod/v4';

import { createSelectSchema } from './drizzle-zod';

/**
 * Profile media in Supabase Storage.
 * Gallery photos power the swipe stack; collection is a dedicated AFOL slot.
 * Derived from `@repo/db` `profile_photos` table.
 */
export const profilePhotoSchema = createSelectSchema(profilePhotos, {
  storagePath: z.string().min(1),
  sortOrder: z.number().int().min(0),
});

export type ProfilePhoto = z.infer<typeof profilePhotoSchema>;

/** Soft cap for gallery photos on a Profile. */
export const MAX_GALLERY_PHOTOS = 6;
