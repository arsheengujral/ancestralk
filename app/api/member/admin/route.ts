import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { requireCaller } from '@/lib/apiAuth';

/**
 * POST /api/member/admin — promote/demote a family member as an admin (keeper).
 *
 * profiles.role / is_admin are client-locked by RLS (migration 0005), so this
 * privileged change goes through the service role AFTER verifying the caller is
 * an owner/keeper of the SAME family as the target (fixes AUDIT C1).
 *
 * Body: { profileId: string, makeAdmin: boolean }
 */
export const runtime = 'nodejs';

interface Body {
  profileId?: string;
  makeAdmin?: boolean;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { profileId, makeAdmin } = body;
  if (!profileId || typeof makeAdmin !== 'boolean') {
    return NextResponse.json({ error: 'profileId and makeAdmin are required' }, { status: 400 });
  }

  const admin = createAdminSupabase();
  if (!admin) {
    return NextResponse.json({ ok: true, configured: false, note: 'Supabase not configured — no-op.' });
  }

  // The target's family, resolved with the service role (RLS-independent).
  const { data: target, error: tErr } = await admin
    .from('profiles')
    .select('family_id')
    .eq('id', profileId)
    .maybeSingle();
  if (tErr || !target) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  // Caller must be an owner/keeper of that same family.
  const caller = await requireCaller('keeper', target.family_id);
  if (!caller) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await admin
    .from('profiles')
    .update({ is_admin: makeAdmin, role: makeAdmin ? 'keeper' : 'contributor' })
    .eq('id', profileId);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, profileId, isAdmin: makeAdmin });
}
