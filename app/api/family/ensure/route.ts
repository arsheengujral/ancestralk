import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { createAdminSupabase } from '@/lib/supabase/admin';

/**
 * POST /api/family/ensure — make sure the signed-in user has a family + an owner
 * profile, and return their ids. Called the first time a user saves anything.
 *
 * Family creation uses the service role because `families` has no INSERT policy
 * and a brand-new user has no family yet (so RLS would block it). It is strictly
 * session-gated: we only ever provision for the authenticated caller, using
 * their own user id.
 */
export const runtime = 'nodejs';

export async function POST() {
  const supabase = createServerSupabase();
  if (!supabase) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  // Already provisioned?
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, family_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ familyId: existing.family_id, profileId: existing.id });
  }

  const admin = createAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: 'Service role not configured' }, { status: 500 });
  }

  const surname = (user.email ?? 'Family').split('@')[0];
  const { data: fam, error: famErr } = await admin
    .from('families')
    .insert({ name: `The ${surname} Family` })
    .select('id')
    .single();
  if (famErr || !fam) {
    return NextResponse.json({ error: famErr?.message ?? 'Could not create family' }, { status: 500 });
  }

  const { data: profile, error: profErr } = await admin
    .from('profiles')
    .insert({
      family_id: fam.id,
      user_id: user.id,
      full_name: user.email?.split('@')[0] ?? 'You',
      role: 'owner',
      is_admin: true,
    })
    .select('id')
    .single();
  if (profErr || !profile) {
    return NextResponse.json({ error: profErr?.message ?? 'Could not create profile' }, { status: 500 });
  }

  return NextResponse.json({ familyId: fam.id, profileId: profile.id });
}
