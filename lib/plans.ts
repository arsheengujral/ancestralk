/**
 * Plans and pricing (Phase 3 payments).
 *
 * Stripe serves the global $60/yr plan; Razorpay serves India at ₹4,999/yr.
 * Provider is chosen by region/locale.
 */

export type Provider = 'stripe' | 'razorpay';

export const PRICING: Record<Provider, { amount: number; currency: string; label: string }> = {
  stripe: { amount: 6000, currency: 'usd', label: '$60 / year' }, // cents
  razorpay: { amount: 499900, currency: 'inr', label: '₹4,999 / year' }, // paise
};

// Locales / regions that should pay in INR via Razorpay.
const INDIA_LOCALES = new Set(['hi', 'hinglish', 'pa', 'ta', 'te', 'gu', 'bn', 'mr', 'kn', 'ml']);
const INDIA_REGIONS = new Set(['india']);

export function providerFor(opts: { region?: string; locale?: string }): Provider {
  if (opts.region && INDIA_REGIONS.has(opts.region)) return 'razorpay';
  if (opts.locale && INDIA_LOCALES.has(opts.locale)) return 'razorpay';
  return 'stripe';
}
