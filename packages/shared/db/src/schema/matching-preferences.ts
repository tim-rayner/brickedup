import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  integer,
  pgPolicy,
  pgTable,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { authenticatedRole, authUid } from 'drizzle-orm/supabase';

import { interestedInEnum } from './enums';
import { profiles } from './profiles';

export const matchingPreferences = pgTable(
  'matching_preferences',
  {
    id: uuid('id').primaryKey().notNull(),
    interestedIn: interestedInEnum('interested_in').notNull(),
    minAge: integer('min_age').notNull(),
    maxAge: integer('max_age').notNull(),
    maxDistanceKm: integer('max_distance_km').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [profiles.id],
      name: 'matching_preferences_id_profiles_fk',
    }).onDelete('cascade'),
    check('matching_preferences_age_range', sql`${table.minAge} <= ${table.maxAge}`),
    check('matching_preferences_min_age', sql`${table.minAge} >= 18`),
    check('matching_preferences_max_age', sql`${table.maxAge} <= 100`),
    check(
      'matching_preferences_max_distance',
      sql`${table.maxDistanceKm} > 0 and ${table.maxDistanceKm} <= 500`,
    ),
    pgPolicy('matching_preferences_select_own', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${table.id} = ${authUid}`,
    }),
    pgPolicy('matching_preferences_insert_own', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`${table.id} = ${authUid}`,
    }),
    pgPolicy('matching_preferences_update_own', {
      for: 'update',
      to: authenticatedRole,
      using: sql`${table.id} = ${authUid}`,
      withCheck: sql`${table.id} = ${authUid}`,
    }),
    pgPolicy('matching_preferences_delete_own', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`${table.id} = ${authUid}`,
    }),
  ],
);
