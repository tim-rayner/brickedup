import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema/index';

export type Database = ReturnType<typeof createDb>;

/**
 * Server-side Drizzle client. Pass the connection string explicitly —
 * do not import this from Expo / client bundles.
 */
export function createDb(databaseUrl: string) {
  const client = postgres(databaseUrl, { prepare: false });
  return drizzle(client, { schema });
}
