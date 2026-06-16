import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminSupabase } from '@/lib/supabase/admin';

/**
 * Razorpay webhook (India) — marks a family's subscription active on payment
 * capture. HMAC-verified with RAZORPAY_WEBHOOK_SECRET. No-op when not configured.
 */
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: true, configured: false });
  }

  const raw = await req.text();
  const sig = req.headers.get('x-razorpay-signature') ?? '';
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  if (expected !== sig) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(raw);
  if (event?.event === 'payment.captured' || event?.event === 'order.paid') {
    const familyId = event?.payload?.payment?.entity?.notes?.familyId
      ?? event?.payload?.order?.entity?.notes?.familyId;
    const admin = createAdminSupabase();
    if (familyId && admin) {
      await admin
        .from('families')
        .update({ subscription_status: 'active', plan: 'family_legacy' })
        .eq('id', familyId);
    }
  }

  return NextResponse.json({ received: true });
}
