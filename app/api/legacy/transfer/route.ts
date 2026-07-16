import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { isCronAuthorized, requireCaller } from '@/lib/apiAuth';

/**
 * POST /api/legacy/transfer — promote a successor to keep the archive
 * (Feature Set B). Triggered by an owner action, a reached date, the
 * inactivity cron, or a verified passing.
 *
 * Body: { familyId, successorProfileId }
 *
 * Service-role only. The successor is promoted to owner/keeper; the prior owner
 * is stepped down to keeper so nothing is ever locked out and no story is lost.
 * Degraded mode (no Supabase) returns a structured no-op.
 */

export const runtime = 'nodejs';

interface Body {
  familyId?: string;
  successorProfileId?: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { familyId, successorProfileId } = body;
  if (!familyId || !successorProfileId) {
    return NextResponse.json({ error: 'familyId and successorProfileId are required' }, { status: 400 });
  }

  // Authorize: either the automated cron (shared secret) or a signed-in
  // owner/keeper of THIS family. Everyone else is rejected (see AUDIT C2).
  if (!isCronAuthorized(req)) {
    const caller = await requireCaller('keeper', familyId);
    if (!caller) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const admin = createAdminSupabase();
  if (!admin) {
    return NextResponse.json({ ok: true, configured: false, note: 'Supabase not configured — no-op.' });
  }

  // Promote the successor.
  const { error: promoteErr } = await admin
    .from('profiles')
    .update({ role: 'owner', is_admin: true })
    .eq('id', successorProfileId)
    .eq('family_id', familyId);
  if (promoteErr) {
    return NextResponse.json({ ok: false, error: promoteErr.message }, { status: 500 });
  }

  // Step prior owners down to keeper — never locked out, nothing lost.
  await admin
    .from('profiles')
    .update({ role: 'keeper' })
    .eq('family_id', familyId)
    .eq('role', 'owner')
    .neq('id', successorProfileId);

  return NextResponse.json({ ok: true, configured: true, promoted: successorProfileId });
}
