import { pgEnum } from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "suspended",
  "deleted",
]);

export const profileStatusEnum = pgEnum("profile_status", [
  "draft",
  "active",
  "paused",
  "removed",
]);

export const genderEnum = pgEnum("gender", ["male", "female"]);

export const interestedInEnum = pgEnum("interested_in", [
  "male",
  "female",
  "both",
]);

export const photoKindEnum = pgEnum("photo_kind", ["gallery", "collection"]);

export const moderationStatusEnum = pgEnum("moderation_status", [
  "pending",
  "approved",
  "rejected",
]);

export const topSetSourceEnum = pgEnum("top_set_source", ["scan", "manual"]);

export const legoThemeEnum = pgEnum("lego_theme", [
  "star_wars",
  "technic",
  "city",
  "ideas",
  "creator",
  "architecture",
  "friends",
  "ninjago",
  "harry_potter",
  "marvel",
  "dc",
  "icons",
  "speed_champions",
  "botanical",
  "castle",
  "space",
  "trains",
  "other",
]);
