import { withSupabase } from 'npm:@supabase/server';

/**
 * Ensures the authenticated caller has a public.users row and draft Profile.
 * Returns onboarding / activation status for client routing.
 */
export default {
  fetch: withSupabase({ auth: 'user' }, async (_req, ctx) => {
    const userId = ctx.userClaims?.id;
    const email = ctx.userClaims?.email ?? '';

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: existingUser, error: userReadError } = await ctx.supabase
      .from('users')
      .select('id, email, status, onboarding_completed_at')
      .eq('id', userId)
      .maybeSingle();

    if (userReadError) {
      return Response.json({ error: userReadError.message }, { status: 500 });
    }

    if (!existingUser) {
      const { error: insertUserError } = await ctx.supabase.from('users').insert({
        id: userId,
        email,
        status: 'active',
      });
      if (insertUserError) {
        return Response.json({ error: insertUserError.message }, { status: 500 });
      }
    } else if (existingUser.email !== email && email) {
      await ctx.supabase.from('users').update({ email, updated_at: new Date().toISOString() }).eq('id', userId);
    }

    const { data: profile, error: profileReadError } = await ctx.supabase
      .from('profiles')
      .select('id, status, display_name')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileReadError) {
      return Response.json({ error: profileReadError.message }, { status: 500 });
    }

    let profileId = profile?.id as string | undefined;
    let profileStatus = profile?.status as string | undefined;

    if (!profile) {
      const { data: created, error: createProfileError } = await ctx.supabase
        .from('profiles')
        .insert({ user_id: userId, status: 'draft' })
        .select('id, status')
        .single();

      if (createProfileError) {
        return Response.json({ error: createProfileError.message }, { status: 500 });
      }
      profileId = created.id;
      profileStatus = created.status;
    }

    const { data: userRow } = await ctx.supabase
      .from('users')
      .select('id, email, status, onboarding_completed_at')
      .eq('id', userId)
      .single();

    return Response.json({
      user: userRow,
      profile: { id: profileId, status: profileStatus },
      onboardingComplete: Boolean(userRow?.onboarding_completed_at),
    });
  }),
};
