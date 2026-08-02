import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  pgPolicy,
  pgTable,
  smallint,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { authenticatedRole, authUid } from 'drizzle-orm/supabase';

import { legoThemeEnum } from './enums';
import { profiles } from './profiles';
import { profileIsDiscoverable, viewerIsActive } from './rls';

export const profileFavoriteThemes = pgTable(
  'profile_favorite_themes',
  {
    id: uuid('id').primaryKey().defaultRandom().notNull(),
    profileId: uuid('profile_id').notNull(),
    theme: legoThemeEnum('theme').notNull(),
    rank: smallint('rank').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profiles.id],
      name: 'profile_favorite_themes_profile_id_fk',
    }).onDelete('cascade'),
    check('profile_favorite_themes_rank_range', sql`${table.rank} in (1, 2, 3)`),
    unique('profile_favorite_themes_profile_rank_uidx').on(table.profileId, table.rank),
    unique('profile_favorite_themes_profile_theme_uidx').on(table.profileId, table.theme),
    pgPolicy('profile_favorite_themes_select_own', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${table.profileId} = ${authUid}`,
    }),
    pgPolicy('profile_favorite_themes_select_discoverable', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${viewerIsActive} and ${profileIsDiscoverable}`,
    }),
    pgPolicy('profile_favorite_themes_insert_own', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`${table.profileId} = ${authUid}`,
    }),
    pgPolicy('profile_favorite_themes_update_own', {
      for: 'update',
      to: authenticatedRole,
      using: sql`${table.profileId} = ${authUid}`,
      withCheck: sql`${table.profileId} = ${authUid}`,
    }),
    pgPolicy('profile_favorite_themes_delete_own', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`${table.profileId} = ${authUid}`,
    }),
  ],
);
