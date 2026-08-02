import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env', override: true });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required in packages/shared/db/.env');
}

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
  entities: {
    roles: {
      provider: 'supabase',
    },
  },
});
