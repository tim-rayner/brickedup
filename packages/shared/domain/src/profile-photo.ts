import { z } from 'zod';

import { moderationStatusSchema, photoKindSchema } from './enums';

/**
 * Profile media in Supabase Storage.
 * Gallery photos power the swipe stack; collection is a dedicated AFOL slot.
 */
export const profilePhotoSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  kind: photoKindSchema,
  storagePath: z.string().min(1),
  sortOrder: z.number().int().min(0),
  isPrimary: z.boolean(),
  moderationStatus: moderationStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ProfilePhoto = z.infer<typeof profilePhotoSchema>;

/** Soft cap for gallery photos on a Profile. */
export const MAX_GALLERY_PHOTOS = 6;
