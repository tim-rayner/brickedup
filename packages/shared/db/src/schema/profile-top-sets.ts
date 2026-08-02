import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  pgPolicy,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { authenticatedRole, authUid } from 'drizzle-orm/supabase';

import { topSetSourceEnum } from './enums';
import { profiles } from './profiles';
import { profileIsDiscoverable, viewerIsActive } from './rls';

export const profileTopSets = pgTable(
  'profile_top_sets',
  {
    id: uuid('id').primaryKey().defaultRandom().notNull(),
    profileId: uuid('profile_id').notNull(),
    rank: smallint('rank').notNull(),
    source: topSetSourceEnum('source').notNull(),
    barcode: text('barcode'),
    setNumber: text('set_number').notNull(),
    name: text('name').notNull(),
    imageUrl: text('image_url'),
    theme: text('theme'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profiles.id],
      name: 'profile_top_sets_profile_id_fk',
    }).onDelete('cascade'),
    check('profile_top_sets_rank_range', sql`${table.rank} in (1, 2, 3)`),
    unique('profile_top_sets_profile_rank_uidx').on(table.profileId, table.rank),
    pgPolicy('profile_top_sets_select_own', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${table.profileId} = ${authUid}`,
    }),
    pgPolicy('profile_top_sets_select_discoverable', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${viewerIsActive} and ${profileIsDiscoverable}`,
    }),
    pgPolicy('profile_top_sets_insert_own', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`${table.profileId} = ${authUid}`,
    }),
    pgPolicy('profile_top_sets_update_own', {
      for: 'update',
      to: authenticatedRole,
      using: sql`${table.profileId} = ${authUid}`,
      withCheck: sql`${table.profileId} = ${authUid}`,
    }),
    pgPolicy('profile_top_sets_delete_own', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`${table.profileId} = ${authUid}`,
    }),
  ],
);
