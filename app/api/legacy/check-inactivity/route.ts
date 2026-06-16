import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';

/**
 * GET/POST /api/legacy/check-inactivity — daily cron (Feature Set B, Mode 1).
 *
 * Finds families on the scheduled/inactivity plan whose owner has gone quiet
 * past their grace window, and sends a "legacy check-in" ("Confirm you're still
 * keeping the archive"). If a transfer date has arrived, or the check-in window
 * has lapsed unanswered, it hands off via /api/legacy/transfer.
 *
 * Runs with the service role (no user session). In degraded mode (no Supabase)
 * it returns a no-op so the cron can be wired before the backend exists.
 */

export const runtime = 'nodejs';

export async function POST() {
  return run();
}
export async function GET() {
  return run();
}

async function run() {
  const admin = createAdminSupabase();
  if (!admin) {
    return NextResponse.json({ ok: true, configured: false, checked: 0, note: 'Supabase not configured — no-op.' });
  }

  const today = new Date();
  const { data: families, error } = await admin
    .from('families')
    .select('id, inheritance_mode, transfer_date, inactivity_months, last_active_at, successor_ids')
    .eq('inheritance_mode', 'scheduled');

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const due: string[] = [];
  for (const f of families ?? []) {
    const byDate = f.transfer_date && new Date(f.transfer_date) <= today;
    const lastActive = f.last_active_at ? new Date(f.last_active_at) : today;
    const monthsQuiet = (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const byInactivity = monthsQuiet >= (f.inactivity_months ?? 12);
    if (byDate || byInactivity) {
      due.push(f.id);
      // TODO: send the warm check-in email via Resend; only transfer once the
      // check-in window lapses unanswered. Recorded here for the handoff step.
    }
  }

  return NextResponse.json({ ok: true, configured: true, checked: families?.length ?? 0, due });
}
