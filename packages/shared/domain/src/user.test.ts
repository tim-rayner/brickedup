import { describe, expect, it } from 'vitest';

import { userSchema } from './user';

describe('userSchema', () => {
  it('accepts a valid account row', () => {
    const parsed = userSchema.parse({
      id: '11111111-1111-4111-8111-111111111111',
      email: 'afol@example.com',
      status: 'active',
      onboardingCompletedAt: null,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    });

    expect(parsed.email).toBe('afol@example.com');
    expect(parsed.onboardingCompletedAt).toBeNull();
    expect(parsed.createdAt).toBeInstanceOf(Date);
  });

  it('rejects invalid emails and statuses', () => {
    const result = userSchema.safeParse({
      id: 'not-a-uuid',
      email: 'nope',
      status: 'pending',
      onboardingCompletedAt: null,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    });

    expect(result.success).toBe(false);
  });
});
