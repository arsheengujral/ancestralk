import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { env } from '@/lib/env';
import { PRICING, providerFor, type Provider } from '@/lib/plans';

/**
 * POST /api/checkout — start an upgrade to Family Legacy.
 * Body: { region?, locale?, familyId? }
 *
 * Picks Stripe (global, $60/yr) or Razorpay (India, ₹4,999/yr) by region/locale.
 * Returns a redirect URL (Stripe) or an order (Razorpay). When the relevant
 * keys aren't configured, returns { configured: false } so the UI can show a
 * friendly "payments coming soon" state instead of failing.
 */
export const runtime = 'nodejs';

interface Body {
  region?: string;
  locale?: string;
  familyId?: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const provider: Provider = providerFor(body);
  const price = PRICING[provider];
  const origin = req.headers.get('origin') ?? env.appUrl;

  if (provider === 'stripe') {
    if (!env.stripeKey) {
      return NextResponse.json({ configured: false, provider, price });
    }
    const stripe = new Stripe(env.stripeKey);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: price.currency,
            unit_amount: price.amount,
            product_data: { name: 'Ancestralk — Family Legacy (1 year)' },
          },
        },
      ],
      success_url: `${origin}/settings?upgraded=1`,
      cancel_url: `${origin}/settings`,
      metadata: { familyId: body.familyId ?? '' },
    });
    return NextResponse.json({ configured: true, provider, url: session.url });
  }

  // Razorpay (India) — create an order via REST (no SDK dependency).
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ configured: false, provider, price });
  }
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: price.amount,
      currency: price.currency,
      notes: { familyId: body.familyId ?? '' },
    }),
  });
  const order = await res.json();
  return NextResponse.json({ configured: true, provider, order, keyId });
}
