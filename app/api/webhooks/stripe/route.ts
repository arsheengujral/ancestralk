import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { env } from '@/lib/env';
import { createAdminSupabase } from '@/lib/supabase/admin';

/**
 * Stripe webhook — marks a family's subscription active on successful payment,
 * which unlocks the paid-tier limits. Signature-verified. On renewal it would
 * also trigger book/generate + the album email (cursor Prompt 7); recorded here
 * for the handoff. No-op when not configured.
 */
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!env.stripeKey || !secret) {
    return NextResponse.json({ ok: true, configured: false });
  }

  const stripe = new Stripe(env.stripeKey);
  const sig = req.headers.get('stripe-signature') ?? '';
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${(err as Error).message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const familyId = session.metadata?.familyId;
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
