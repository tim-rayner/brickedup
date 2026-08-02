import { sql } from 'drizzle-orm';
import { date, foreignKey, pgPolicy, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { authenticatedRole, authUid } from 'drizzle-orm/supabase';

import { genderEnum, profileStatusEnum } from './enums';
import { thisProfileIsDiscoverable, viewerIsActive } from './rls';
import { users } from './users';

export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey().notNull(),
    status: profileStatusEnum('status').notNull().default('draft'),
    displayName: text('display_name').notNull(),
    dateOfBirth: date('date_of_birth', { mode: 'string' }).notNull(),
    gender: genderEnum('gender').notNull(),
    bio: text('bio').notNull(),
    displayLocation: text('display_location').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: 'profiles_id_users_fk',
    }).onDelete('cascade'),
    pgPolicy('profiles_select_own', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${table.id} = ${authUid}`,
    }),
    pgPolicy('profiles_select_discoverable', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${viewerIsActive} and ${thisProfileIsDiscoverable}`,
    }),
    pgPolicy('profiles_insert_own', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`${table.id} = ${authUid}`,
    }),
    pgPolicy('profiles_update_own', {
      for: 'update',
      to: authenticatedRole,
      using: sql`${table.id} = ${authUid}`,
      withCheck: sql`${table.id} = ${authUid}`,
    }),
    pgPolicy('profiles_delete_own', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`${table.id} = ${authUid}`,
    }),
  ],
);
