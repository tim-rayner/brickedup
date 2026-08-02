import { sql } from 'drizzle-orm';
import { foreignKey, pgPolicy, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { authenticatedRole, authUid, authUsers } from 'drizzle-orm/supabase';

import { userStatusEnum } from './enums';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().notNull(),
    email: text('email').notNull(),
    status: userStatusEnum('status').notNull().default('active'),
    onboardingCompletedAt: timestamp('onboarding_completed_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [authUsers.id],
      name: 'users_id_auth_users_fk',
    }).onDelete('cascade'),
    pgPolicy('users_select_own', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${table.id} = ${authUid}`,
    }),
    pgPolicy('users_insert_own', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`${table.id} = ${authUid}`,
    }),
    pgPolicy('users_update_own', {
      for: 'update',
      to: authenticatedRole,
      using: sql`${table.id} = ${authUid}`,
      withCheck: sql`${table.id} = ${authUid}`,
    }),
    pgPolicy('users_delete_own', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`${table.id} = ${authUid}`,
    }),
  ],
);
