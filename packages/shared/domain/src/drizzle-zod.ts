import { createSchemaFactory } from 'drizzle-zod';
import { z } from 'zod/v4';

/**
 * Shared factory so all domain Zod schemas use `zod/v4`
 * (what drizzle-zod expects) with date coercion for timestamps.
 */
export const { createSelectSchema } = createSchemaFactory({
  zodInstance: z,
  coerce: { date: true },
});
