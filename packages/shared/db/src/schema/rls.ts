import { sql } from 'drizzle-orm';

/** Viewer account must be active to read other members' dating surfaces. */
export const viewerIsActive = sql`exists (
  select 1
  from public.users as viewer
  where viewer.id = (select auth.uid())
    and viewer.status = 'active'
)`;

/** Target profile + owning user are both active (discovery-visible). */
export const profileIsDiscoverable = sql`exists (
  select 1
  from public.profiles as discoverable_profile
  inner join public.users as discoverable_owner
    on discoverable_owner.id = discoverable_profile.id
  where discoverable_profile.id = profile_id
    and discoverable_profile.status = 'active'
    and discoverable_owner.status = 'active'
)`;

/** For policies on `profiles` itself (row id = profile id). */
export const thisProfileIsDiscoverable = sql`(
  status = 'active'
  and exists (
    select 1
    from public.users as discoverable_owner
    where discoverable_owner.id = id
      and discoverable_owner.status = 'active'
  )
)`;
