import { describe, expect, it } from 'vitest';

import { ageFromDateOfBirth, isAtLeastMinimumAge, profileSchema } from './profile';

describe('ageFromDateOfBirth', () => {
  it('computes age relative to a fixed now', () => {
    const now = new Date('2026-08-01T12:00:00.000Z');
    expect(ageFromDateOfBirth('2000-01-01', now)).toBe(26);
    expect(ageFromDateOfBirth('2008-08-02', now)).toBe(17);
    expect(ageFromDateOfBirth('2008-08-01', now)).toBe(18);
  });
});

describe('isAtLeastMinimumAge', () => {
  it('requires 18+', () => {
    const now = new Date('2026-08-01T12:00:00.000Z');
    expect(isAtLeastMinimumAge('2008-08-01', now)).toBe(true);
    expect(isAtLeastMinimumAge('2008-08-02', now)).toBe(false);
  });
});

describe('profileSchema', () => {
  it('accepts a valid profile', () => {
    const parsed = profileSchema.parse({
      id: '11111111-1111-4111-8111-111111111111',
      status: 'draft',
      displayName: 'BrickFan',
      dateOfBirth: '1995-06-15',
      gender: 'male',
      bio: 'AFOL looking for builds and coffee.',
      displayLocation: 'Manchester, UK',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    });

    expect(parsed.displayName).toBe('BrickFan');
    expect(parsed.id).toBe('11111111-1111-4111-8111-111111111111');
    expect(parsed.createdAt).toBeInstanceOf(Date);
  });

  it('rejects empty display names', () => {
    const result = profileSchema.safeParse({
      id: '11111111-1111-4111-8111-111111111111',
      status: 'draft',
      displayName: '   ',
      dateOfBirth: '1995-06-15',
      gender: 'male',
      bio: 'bio',
      displayLocation: 'Manchester, UK',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    });

    expect(result.success).toBe(false);
  });
});
