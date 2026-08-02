import { sql } from 'drizzle-orm';
import {
  doublePrecision,
  foreignKey,
  pgPolicy,
  pgTable,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { authenticatedRole, authUid } from 'drizzle-orm/supabase';

import { profiles } from './profiles';

/** Private WGS84 for distance matching — never cross-user readable via RLS. */
export const profileLocations = pgTable(
  'profile_locations',
  {
    id: uuid('id').primaryKey().notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    locationUpdatedAt: timestamp('location_updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [profiles.id],
      name: 'profile_locations_id_profiles_fk',
    }).onDelete('cascade'),
    pgPolicy('profile_locations_select_own', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${table.id} = ${authUid}`,
    }),
    pgPolicy('profile_locations_insert_own', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`${table.id} = ${authUid}`,
    }),
    pgPolicy('profile_locations_update_own', {
      for: 'update',
      to: authenticatedRole,
      using: sql`${table.id} = ${authUid}`,
      withCheck: sql`${table.id} = ${authUid}`,
    }),
    pgPolicy('profile_locations_delete_own', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`${table.id} = ${authUid}`,
    }),
  ],
);
