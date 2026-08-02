import { MAX_GALLERY_PHOTOS } from './profile-photo';
import type { ProfilePhoto } from './profile-photo';
import { isAtLeastMinimumAge, type Profile } from './profile';
import type { ProfileLocation } from './profile-location';
import {
  REQUIRED_FAVORITE_THEME_COUNT,
  type ProfileFavoriteTheme,
} from './profile-favorite-theme';
import { REQUIRED_TOP_SET_COUNT, type ProfileTopSet } from './profile-top-set';
import type { User } from './user';

export type ProfileActivationInput = {
  user: Pick<User, 'status'>;
  profile: Pick<
    Profile,
    | 'status'
    | 'displayName'
    | 'dateOfBirth'
    | 'gender'
    | 'bio'
    | 'displayLocation'
  >;
  location: Pick<ProfileLocation, 'latitude' | 'longitude'>;
  photos: ReadonlyArray<Pick<ProfilePhoto, 'kind' | 'moderationStatus'>>;
  favoriteThemes: ReadonlyArray<Pick<ProfileFavoriteTheme, 'rank' | 'theme'>>;
  topSets: ReadonlyArray<Pick<ProfileTopSet, 'rank' | 'setNumber'>>;
};

export type ProfileActivationResult =
  | { ok: true }
  | { ok: false; reasons: string[] };

function hasRanksOneThroughThree(ranks: ReadonlyArray<number>): boolean {
  const set = new Set(ranks);
  return set.has(1) && set.has(2) && set.has(3) && set.size === 3;
}

/**
 * Whether a draft Profile meets the bar to become `active`.
 * Does not mutate status — callers apply the transition after this check.
 */
export function evaluateProfileActivation(input: ProfileActivationInput): ProfileActivationResult {
  const reasons: string[] = [];

  if (input.user.status !== 'active') {
    reasons.push('user must be active');
  }

  if (input.profile.status === 'removed') {
    reasons.push('removed profiles cannot be activated');
  }

  if (!input.profile.displayName.trim()) {
    reasons.push('display name is required');
  }

  if (!isAtLeastMinimumAge(input.profile.dateOfBirth)) {
    reasons.push(`must be at least 18`);
  }

  if (!input.profile.bio.trim()) {
    reasons.push('bio is required');
  }

  if (!input.profile.displayLocation.trim()) {
    reasons.push('display location is required');
  }

  if (Number.isNaN(input.location.latitude) || Number.isNaN(input.location.longitude)) {
    reasons.push('geo coordinates are required');
  }

  const approvedGallery = input.photos.filter(
    (photo) => photo.kind === 'gallery' && photo.moderationStatus === 'approved',
  );
  const approvedCollection = input.photos.filter(
    (photo) => photo.kind === 'collection' && photo.moderationStatus === 'approved',
  );

  if (approvedGallery.length < 1) {
    reasons.push('at least one approved gallery photo is required');
  }
  if (approvedGallery.length > MAX_GALLERY_PHOTOS) {
    reasons.push(`at most ${MAX_GALLERY_PHOTOS} gallery photos are allowed`);
  }
  if (approvedCollection.length !== 1) {
    reasons.push('exactly one approved collection photo is required');
  }

  if (input.favoriteThemes.length !== REQUIRED_FAVORITE_THEME_COUNT) {
    reasons.push(`exactly ${REQUIRED_FAVORITE_THEME_COUNT} favourite themes are required`);
  } else if (!hasRanksOneThroughThree(input.favoriteThemes.map((theme) => theme.rank))) {
    reasons.push('favourite themes must use ranks 1–3 exactly once each');
  }

  if (input.topSets.length !== REQUIRED_TOP_SET_COUNT) {
    reasons.push(`exactly ${REQUIRED_TOP_SET_COUNT} top sets are required`);
  } else if (!hasRanksOneThroughThree(input.topSets.map((set) => set.rank))) {
    reasons.push('top sets must use ranks 1–3 exactly once each');
  }

  return reasons.length === 0 ? { ok: true } : { ok: false, reasons };
}

/** Discovery eligibility: account and Profile must both be active. */
export function isDiscoverable(
  user: Pick<User, 'status'>,
  profile: Pick<Profile, 'status'>,
): boolean {
  return user.status === 'active' && profile.status === 'active';
}
