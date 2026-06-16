/**
 * Plans, pricing, and free-tier limits (Phase 3 payments).
 *
 * Stripe serves the global $60/yr plan; Razorpay serves India at ₹4,999/yr.
 * Provider is chosen by region/locale. Free-tier limits are enforced
 * server-side (see enforceLimit) wherever a write would exceed them.
 */

export type Provider = 'stripe' | 'razorpay';

export interface PlanLimits {
  profiles: number; // max family member profiles
  questions: number; // story questions per profile
  photos: number;
  voicePlayback: boolean;
  futureMessages: boolean;
}

export const FREE_LIMITS: PlanLimits = {
  profiles: 1,
  questions: 4,
  photos: 5,
  voicePlayback: false,
  futureMessages: false,
};

// Paid tier — effectively unlimited.
export const PAID_LIMITS: PlanLimits = {
  profiles: Infinity,
  questions: Infinity,
  photos: Infinity,
  voicePlayback: true,
  futureMessages: true,
};

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

export function limitsFor(status: string | undefined): PlanLimits {
  return status === 'active' || status === 'paid' ? PAID_LIMITS : FREE_LIMITS;
}

/** True when an action is allowed under the plan; false when it would exceed it. */
export function withinLimit(status: string | undefined, key: keyof PlanLimits, current = 0): boolean {
  const limits = limitsFor(status);
  const limit = limits[key];
  if (typeof limit === 'boolean') return limit;
  return current < limit;
}
