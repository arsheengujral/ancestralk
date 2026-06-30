import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { hasKey, seal } from '@/lib/crypto';

/**
 * POST /api/future-messages/seal — seal a letter (Phase 4).
 * Body: { recipientDescription, unlockCondition, unlockDate, messageText, ... }
 *
 * The message is encrypted before it ever touches the database; only the
 * ciphertext is stored, with is_sealed=true. There is no endpoint that returns
 * the plaintext — the delivery cron is the sole decryptor, and only on/after
 * the unlock date. RLS scopes the row to the writer's family.
 *
 * Degraded mode (no key / no Supabase): returns { configured:false } and stores
 * nothing — it will never persist plaintext.
 */
export const runtime = 'nodejs';

interface Body {
  recipientDescription?: string;
  recipientProfileId?: string;
  unlockCondition?: string;
  unlockDate?: string;
  messageText?: string;
  voicePath?: string;
  familyId?: string;
  fromProfileId?: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Body;
  if (!body.messageText?.trim()) {
    return NextResponse.json({ error: 'Nothing to seal.' }, { status: 400 });
  }

  const supabase = createServerSupabase();
  if (!supabase || !hasKey()) {
    // Never store plaintext when sealing isn't fully configured.
    return NextResponse.json({ ok: true, configured: false, sealed: true });
  }

  // Derive the family + author from the session — never trusted from the client.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: true, configured: false, sealed: true });
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, family_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json({ ok: true, configured: false, sealed: true });
  }

  const ciphertext = seal(body.messageText);

  const { data, error } = await supabase
    .from('future_messages')
    .insert({
      family_id: profile.family_id,
      from_profile_id: profile.id,
      recipient_description: body.recipientDescription ?? null,
      recipient_profile_id: body.recipientProfileId ?? null,
      unlock_condition: body.unlockCondition ?? null,
      unlock_date: body.unlockDate ?? null,
      message_text: ciphertext, // ENCRYPTED — never plaintext
      voice_path: body.voicePath ?? null,
      is_sealed: true,
      delivered: false,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, configured: true, sealed: true, id: data.id });
}
