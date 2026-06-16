import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

/**
 * Service-role Supabase client — BYPASSES RLS. Server-only; never import into a
 * client component. Use sparingly and deliberately: signup (creating the family
 * + first profile), cron jobs (reminders, future-message delivery, inactivity
 * checks), and webhooks (Stripe/Razorpay) where there is no user session.
 *
 * Returns `null` when the service role key isn't configured.
 */
export function createAdminSupabase() {
  if (!env.supabaseUrl || !env.supabaseServiceKey) return null;
  return createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
