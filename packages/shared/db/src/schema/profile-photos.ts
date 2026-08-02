import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  foreignKey,
  integer,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { authenticatedRole, authUid } from 'drizzle-orm/supabase';

import { moderationStatusEnum, photoKindEnum } from './enums';
import { profiles } from './profiles';
import { profileIsDiscoverable, viewerIsActive } from './rls';

export const profilePhotos = pgTable(
  'profile_photos',
  {
    id: uuid('id').primaryKey().defaultRandom().notNull(),
    profileId: uuid('profile_id').notNull(),
    kind: photoKindEnum('kind').notNull(),
    storagePath: text('storage_path').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    isPrimary: boolean('is_primary').notNull().default(false),
    moderationStatus: moderationStatusEnum('moderation_status').notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profiles.id],
      name: 'profile_photos_profile_id_fk',
    }).onDelete('cascade'),
    check('profile_photos_sort_order_nonnegative', sql`${table.sortOrder} >= 0`),
    uniqueIndex('profile_photos_one_collection_per_profile')
      .on(table.profileId)
      .where(sql`${table.kind} = 'collection'`),
    uniqueIndex('profile_photos_one_primary_per_profile')
      .on(table.profileId)
      .where(sql`${table.isPrimary} = true`),
    pgPolicy('profile_photos_select_own', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${table.profileId} = ${authUid}`,
    }),
    pgPolicy('profile_photos_select_discoverable', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${viewerIsActive} and ${profileIsDiscoverable}`,
    }),
    pgPolicy('profile_photos_insert_own', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`${table.profileId} = ${authUid}`,
    }),
    pgPolicy('profile_photos_update_own', {
      for: 'update',
      to: authenticatedRole,
      using: sql`${table.profileId} = ${authUid}`,
      withCheck: sql`${table.profileId} = ${authUid}`,
    }),
    pgPolicy('profile_photos_delete_own', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`${table.profileId} = ${authUid}`,
    }),
  ],
);
