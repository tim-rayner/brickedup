CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."interested_in" AS ENUM('male', 'female', 'both');--> statement-breakpoint
CREATE TYPE "public"."lego_theme" AS ENUM('star_wars', 'technic', 'city', 'ideas', 'creator', 'architecture', 'friends', 'ninjago', 'harry_potter', 'marvel', 'dc', 'icons', 'speed_champions', 'botanical', 'castle', 'space', 'trains', 'other');--> statement-breakpoint
CREATE TYPE "public"."moderation_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."photo_kind" AS ENUM('gallery', 'collection');--> statement-breakpoint
CREATE TYPE "public"."profile_status" AS ENUM('draft', 'active', 'paused', 'removed');--> statement-breakpoint
CREATE TYPE "public"."top_set_source" AS ENUM('scan', 'manual');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended', 'deleted');--> statement-breakpoint
CREATE TABLE "matching_preferences" (
	"id" uuid PRIMARY KEY NOT NULL,
	"interested_in" "interested_in" NOT NULL,
	"min_age" integer NOT NULL,
	"max_age" integer NOT NULL,
	"max_distance_km" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "matching_preferences_age_range" CHECK ("matching_preferences"."min_age" <= "matching_preferences"."max_age"),
	CONSTRAINT "matching_preferences_min_age" CHECK ("matching_preferences"."min_age" >= 18),
	CONSTRAINT "matching_preferences_max_age" CHECK ("matching_preferences"."max_age" <= 100),
	CONSTRAINT "matching_preferences_max_distance" CHECK ("matching_preferences"."max_distance_km" > 0 and "matching_preferences"."max_distance_km" <= 500)
);
--> statement-breakpoint
ALTER TABLE "matching_preferences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profile_favorite_themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"theme" "lego_theme" NOT NULL,
	"rank" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_favorite_themes_profile_rank_uidx" UNIQUE("profile_id","rank"),
	CONSTRAINT "profile_favorite_themes_profile_theme_uidx" UNIQUE("profile_id","theme"),
	CONSTRAINT "profile_favorite_themes_rank_range" CHECK ("profile_favorite_themes"."rank" in (1, 2, 3))
);
--> statement-breakpoint
ALTER TABLE "profile_favorite_themes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profile_locations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"location_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profile_locations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profile_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"kind" "photo_kind" NOT NULL,
	"storage_path" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"moderation_status" "moderation_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_photos_sort_order_nonnegative" CHECK ("profile_photos"."sort_order" >= 0)
);
--> statement-breakpoint
ALTER TABLE "profile_photos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profile_top_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"rank" smallint NOT NULL,
	"source" "top_set_source" NOT NULL,
	"barcode" text,
	"set_number" text NOT NULL,
	"name" text NOT NULL,
	"image_url" text,
	"theme" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_top_sets_profile_rank_uidx" UNIQUE("profile_id","rank"),
	CONSTRAINT "profile_top_sets_rank_range" CHECK ("profile_top_sets"."rank" in (1, 2, 3))
);
--> statement-breakpoint
ALTER TABLE "profile_top_sets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"status" "profile_status" DEFAULT 'draft' NOT NULL,
	"display_name" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"gender" "gender" NOT NULL,
	"bio" text NOT NULL,
	"display_location" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"onboarding_completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "matching_preferences" ADD CONSTRAINT "matching_preferences_id_profiles_fk" FOREIGN KEY ("id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_favorite_themes" ADD CONSTRAINT "profile_favorite_themes_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_locations" ADD CONSTRAINT "profile_locations_id_profiles_fk" FOREIGN KEY ("id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_photos" ADD CONSTRAINT "profile_photos_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_top_sets" ADD CONSTRAINT "profile_top_sets_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_auth_users_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "profile_photos_one_collection_per_profile" ON "profile_photos" USING btree ("profile_id") WHERE "profile_photos"."kind" = 'collection';--> statement-breakpoint
CREATE UNIQUE INDEX "profile_photos_one_primary_per_profile" ON "profile_photos" USING btree ("profile_id") WHERE "profile_photos"."is_primary" = true;--> statement-breakpoint
CREATE POLICY "matching_preferences_select_own" ON "matching_preferences" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("matching_preferences"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "matching_preferences_insert_own" ON "matching_preferences" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("matching_preferences"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "matching_preferences_update_own" ON "matching_preferences" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("matching_preferences"."id" = (select auth.uid())) WITH CHECK ("matching_preferences"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "matching_preferences_delete_own" ON "matching_preferences" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("matching_preferences"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profile_favorite_themes_select_own" ON "profile_favorite_themes" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("profile_favorite_themes"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profile_favorite_themes_select_discoverable" ON "profile_favorite_themes" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
  select 1
  from public.users as viewer
  where viewer.id = (select auth.uid())
    and viewer.status = 'active'
) and exists (
  select 1
  from public.profiles as discoverable_profile
  inner join public.users as discoverable_owner
    on discoverable_owner.id = discoverable_profile.id
  where discoverable_profile.id = profile_id
    and discoverable_profile.status = 'active'
    and discoverable_owner.status = 'active'
));--> statement-breakpoint
CREATE POLICY "profile_favorite_themes_insert_own" ON "profile_favorite_themes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("profile_favorite_themes"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profile_favorite_themes_update_own" ON "profile_favorite_themes" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("profile_favorite_themes"."profile_id" = (select auth.uid())) WITH CHECK ("profile_favorite_themes"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profile_favorite_themes_delete_own" ON "profile_favorite_themes" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("profile_favorite_themes"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profile_locations_select_own" ON "profile_locations" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("profile_locations"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profile_locations_insert_own" ON "profile_locations" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("profile_locations"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profile_locations_update_own" ON "profile_locations" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("profile_locations"."id" = (select auth.uid())) WITH CHECK ("profile_locations"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profile_locations_delete_own" ON "profile_locations" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("profile_locations"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profile_photos_select_own" ON "profile_photos" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("profile_photos"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profile_photos_select_discoverable" ON "profile_photos" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
  select 1
  from public.users as viewer
  where viewer.id = (select auth.uid())
    and viewer.status = 'active'
) and exists (
  select 1
  from public.profiles as discoverable_profile
  inner join public.users as discoverable_owner
    on discoverable_owner.id = discoverable_profile.id
  where discoverable_profile.id = profile_id
    and discoverable_profile.status = 'active'
    and discoverable_owner.status = 'active'
));--> statement-breakpoint
CREATE POLICY "profile_photos_insert_own" ON "profile_photos" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("profile_photos"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profile_photos_update_own" ON "profile_photos" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("profile_photos"."profile_id" = (select auth.uid())) WITH CHECK ("profile_photos"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profile_photos_delete_own" ON "profile_photos" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("profile_photos"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profile_top_sets_select_own" ON "profile_top_sets" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("profile_top_sets"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profile_top_sets_select_discoverable" ON "profile_top_sets" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
  select 1
  from public.users as viewer
  where viewer.id = (select auth.uid())
    and viewer.status = 'active'
) and exists (
  select 1
  from public.profiles as discoverable_profile
  inner join public.users as discoverable_owner
    on discoverable_owner.id = discoverable_profile.id
  where discoverable_profile.id = profile_id
    and discoverable_profile.status = 'active'
    and discoverable_owner.status = 'active'
));--> statement-breakpoint
CREATE POLICY "profile_top_sets_insert_own" ON "profile_top_sets" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("profile_top_sets"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profile_top_sets_update_own" ON "profile_top_sets" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("profile_top_sets"."profile_id" = (select auth.uid())) WITH CHECK ("profile_top_sets"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profile_top_sets_delete_own" ON "profile_top_sets" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("profile_top_sets"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profiles_select_own" ON "profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("profiles"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profiles_select_discoverable" ON "profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
  select 1
  from public.users as viewer
  where viewer.id = (select auth.uid())
    and viewer.status = 'active'
) and (
  status = 'active'
  and exists (
    select 1
    from public.users as discoverable_owner
    where discoverable_owner.id = id
      and discoverable_owner.status = 'active'
  )
));--> statement-breakpoint
CREATE POLICY "profiles_insert_own" ON "profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("profiles"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profiles_update_own" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("profiles"."id" = (select auth.uid())) WITH CHECK ("profiles"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "profiles_delete_own" ON "profiles" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("profiles"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "users_select_own" ON "users" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("users"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "users_insert_own" ON "users" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("users"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "users_update_own" ON "users" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("users"."id" = (select auth.uid())) WITH CHECK ("users"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "users_delete_own" ON "users" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("users"."id" = (select auth.uid()));