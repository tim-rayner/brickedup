-- Bricked Up: User, Profile, matching preferences, photos, AFOL signals.
-- Shapes align with @repo/domain (ADR 0001 / 0004).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- users (app account; credentials live in auth.users)
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  status text not null default 'active'
    check (status in ('active', 'suspended', 'deleted')),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index users_status_idx on public.users (status);

alter table public.users enable row level security;

create policy "Users can select own row"
  on public.users for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can insert own row"
  on public.users for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update own row"
  on public.users for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'paused', 'removed')),
  display_name text,
  date_of_birth date,
  gender text check (gender is null or gender in ('male', 'female')),
  bio text,
  display_location text,
  latitude double precision check (latitude is null or (latitude >= -90 and latitude <= 90)),
  longitude double precision check (longitude is null or (longitude >= -180 and longitude <= 180)),
  location_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_status_idx on public.profiles (status);

alter table public.profiles enable row level security;

create policy "Users can select own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Active profiles are readable by other authenticated members (discovery later).
create policy "Authenticated can select active profiles"
  on public.profiles for select
  to authenticated
  using (status = 'active');

-- ---------------------------------------------------------------------------
-- matching_preferences
-- ---------------------------------------------------------------------------
create table public.matching_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  interested_in text not null check (interested_in in ('male', 'female', 'both')),
  min_age integer not null check (min_age >= 18 and min_age <= 100),
  max_age integer not null check (max_age >= 18 and max_age <= 100),
  max_distance_km numeric not null check (max_distance_km > 0 and max_distance_km <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (min_age <= max_age)
);

alter table public.matching_preferences enable row level security;

create policy "Users can select own matching preferences"
  on public.matching_preferences for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own matching preferences"
  on public.matching_preferences for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own matching preferences"
  on public.matching_preferences for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- profile_photos
-- ---------------------------------------------------------------------------
create table public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('gallery', 'collection')),
  storage_path text not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_primary boolean not null default false,
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profile_photos_profile_id_idx on public.profile_photos (profile_id);

alter table public.profile_photos enable row level security;

create policy "Users can select own profile photos"
  on public.profile_photos for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = (select auth.uid())
    )
  );

create policy "Users can insert own profile photos"
  on public.profile_photos for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = (select auth.uid())
    )
  );

create policy "Users can update own profile photos"
  on public.profile_photos for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = (select auth.uid())
    )
  );

create policy "Users can delete own profile photos"
  on public.profile_photos for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- profile_favorite_themes
-- ---------------------------------------------------------------------------
create table public.profile_favorite_themes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  theme text not null check (theme in (
    'star_wars', 'technic', 'city', 'ideas', 'creator', 'architecture',
    'friends', 'ninjago', 'harry_potter', 'marvel', 'dc', 'icons',
    'speed_champions', 'botanical', 'castle', 'space', 'trains', 'other'
  )),
  rank smallint not null check (rank in (1, 2, 3)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, rank),
  unique (profile_id, theme)
);

alter table public.profile_favorite_themes enable row level security;

create policy "Users can select own favourite themes"
  on public.profile_favorite_themes for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = (select auth.uid())
    )
  );

create policy "Users can insert own favourite themes"
  on public.profile_favorite_themes for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = (select auth.uid())
    )
  );

create policy "Users can delete own favourite themes"
  on public.profile_favorite_themes for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- profile_top_sets
-- ---------------------------------------------------------------------------
create table public.profile_top_sets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  rank smallint not null check (rank in (1, 2, 3)),
  source text not null check (source in ('scan', 'manual')),
  barcode text,
  set_number text not null,
  name text not null,
  image_url text,
  theme text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, rank)
);

alter table public.profile_top_sets enable row level security;

create policy "Users can select own top sets"
  on public.profile_top_sets for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = (select auth.uid())
    )
  );

create policy "Users can insert own top sets"
  on public.profile_top_sets for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = (select auth.uid())
    )
  );

create policy "Users can delete own top sets"
  on public.profile_top_sets for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Auth → public.users
-- ---------------------------------------------------------------------------
create schema if not exists private;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------
-- Storage: profile photos
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', false)
on conflict (id) do nothing;

create policy "Users can upload own profile photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can update own profile photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can read own profile photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete own profile photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Grants for Data API / Edge Function clients
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.users to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.matching_preferences to authenticated;
grant select, insert, update, delete on public.profile_photos to authenticated;
grant select, insert, delete on public.profile_favorite_themes to authenticated;
grant select, insert, delete on public.profile_top_sets to authenticated;
