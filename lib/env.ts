/**
 * Centralised, type-safe access to environment configuration.
 *
 * Per the agreed "placeholders + README" approach, the app must boot and run in
 * a graceful degraded/mock mode when external services are not yet configured.
 * Helpers here let any module ask "is X wired?" instead of crashing on a missing
 * key. Server-only secrets are never read into client bundles (they're only
 * referenced from server modules / route handlers).
 */

export const env = {
  // Public — safe to expose to the browser.
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',

  // Server-only secrets.
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? '',
  openaiKey: process.env.OPENAI_API_KEY ?? '',
  stripeKey: process.env.STRIPE_SECRET_KEY ?? '',
};

export const isSupabaseConfigured = (): boolean =>
  Boolean(env.supabaseUrl && env.supabaseAnonKey);

export const isAnthropicConfigured = (): boolean => Boolean(env.anthropicKey);
export const isWhisperConfigured = (): boolean => Boolean(env.openaiKey);
