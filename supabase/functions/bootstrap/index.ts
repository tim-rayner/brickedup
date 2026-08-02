import { withSupabase } from 'npm:@supabase/server';

/**
 * Ensures the authenticated caller has a public.users row.
 * Profile is created on first Onboarding identity save (shared PK = auth uid).
 * Tables/RLS: @repo/db (ADR 0002 drizzle).
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
      await ctx.supabase
        .from('users')
        .update({ email, updated_at: new Date().toISOString() })
        .eq('id', userId);
    }

    const { data: profile, error: profileReadError } = await ctx.supabase
      .from('profiles')
      .select('id, status, display_name')
      .eq('id', userId)
      .maybeSingle();

    if (profileReadError) {
      return Response.json({ error: profileReadError.message }, { status: 500 });
    }

    const { data: userRow } = await ctx.supabase
      .from('users')
      .select('id, email, status, onboarding_completed_at')
      .eq('id', userId)
      .single();

    return Response.json({
      user: userRow,
      profile: profile
        ? { id: profile.id as string, status: profile.status as string }
        : null,
      onboardingComplete: Boolean(userRow?.onboarding_completed_at),
    });
  }),
};
