import { describe, expect, it } from 'vitest';

import {
  evaluateProfileActivation,
  isDiscoverable,
  type ProfileActivationInput,
} from './activation';

function validInput(
  overrides: Partial<{
    user: ProfileActivationInput['user'];
    profile: Partial<ProfileActivationInput['profile']>;
    location: Partial<ProfileActivationInput['location']>;
    photos: ProfileActivationInput['photos'];
    favoriteThemes: ProfileActivationInput['favoriteThemes'];
    topSets: ProfileActivationInput['topSets'];
  }> = {},
): ProfileActivationInput {
  return {
    user: overrides.user ?? { status: 'active' },
    profile: {
      status: 'draft',
      displayName: 'BrickFan',
      dateOfBirth: '1995-06-15',
      gender: 'male',
      bio: 'AFOL looking for builds and coffee.',
      displayLocation: 'Manchester, UK',
      ...overrides.profile,
    },
    location: {
      latitude: 53.4808,
      longitude: -2.2426,
      ...overrides.location,
    },
    photos: overrides.photos ?? [
      { kind: 'gallery', moderationStatus: 'approved' },
      { kind: 'collection', moderationStatus: 'approved' },
    ],
    favoriteThemes: overrides.favoriteThemes ?? [],
    topSets: overrides.topSets ?? [],
  };
}

describe('evaluateProfileActivation', () => {
  it('accepts a complete draft profile without AFOL lists', () => {
    expect(evaluateProfileActivation(validInput())).toEqual({ ok: true });
  });

  it('rejects suspended users', () => {
    const result = evaluateProfileActivation(validInput({ user: { status: 'suspended' } }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasons).toContain('user must be active');
    }
  });

  it('requires approved gallery and collection photos', () => {
    const result = evaluateProfileActivation(
      validInput({
        photos: [{ kind: 'gallery', moderationStatus: 'pending' }],
      }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasons).toEqual(
        expect.arrayContaining([
          'at least one approved gallery photo is required',
          'exactly one approved collection photo is required',
        ]),
      );
    }
  });

  it('accepts a partial list of favourite themes with unique ranks', () => {
    expect(
      evaluateProfileActivation(
        validInput({
          favoriteThemes: [
            { rank: 1, theme: 'star_wars' },
            { rank: 2, theme: 'technic' },
          ],
        }),
      ),
    ).toEqual({ ok: true });
  });

  it('rejects duplicate ranks when favourite themes are provided', () => {
    const result = evaluateProfileActivation(
      validInput({
        favoriteThemes: [
          { rank: 1, theme: 'star_wars' },
          { rank: 1, theme: 'technic' },
        ],
      }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasons).toContain('favourite themes must use unique ranks in 1–3');
    }
  });
});

describe('isDiscoverable', () => {
  it('requires both user and profile to be active', () => {
    expect(isDiscoverable({ status: 'active' }, { status: 'active' })).toBe(true);
    expect(isDiscoverable({ status: 'active' }, { status: 'draft' })).toBe(false);
    expect(isDiscoverable({ status: 'suspended' }, { status: 'active' })).toBe(false);
  });
});
