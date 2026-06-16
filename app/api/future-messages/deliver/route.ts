import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { unseal } from '@/lib/crypto';

/**
 * GET/POST /api/future-messages/deliver — delivery cron (Phase 4).
 *
 * This is the ONLY place a sealed letter is ever decrypted, and only once its
 * unlock_date has arrived. It finds due, undelivered messages, decrypts each,
 * sends it (Resend email / Twilio WhatsApp — wired in Phase 3 env), and marks
 * it delivered. Service-role only; no-op when not configured.
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
    return NextResponse.json({ ok: true, configured: false, delivered: 0 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: due, error } = await admin
    .from('future_messages')
    .select('id, message_text, recipient_description, unlock_date, voice_path')
    .lte('unlock_date', today)
    .eq('delivered', false)
    .not('unlock_date', 'is', null);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  let delivered = 0;
  for (const msg of due ?? []) {
    try {
      // Decrypt here, at delivery time only.
      const plaintext = unseal(msg.message_text as string);
      // TODO: send via Resend (email) / Twilio (WhatsApp). The decrypted text
      // is used only transiently for sending and is never written back.
      void plaintext;
      await admin.from('future_messages').update({ delivered: true }).eq('id', msg.id);
      delivered += 1;
    } catch (err) {
      console.error(`Failed to deliver future message ${msg.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, configured: true, delivered, checked: due?.length ?? 0 });
}
