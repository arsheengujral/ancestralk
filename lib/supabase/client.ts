'use client';

import { createBrowserClient } from '@supabase/ssr';
import { env, isSupabaseConfigured } from '@/lib/env';

/**
 * Browser Supabase client (anon key, subject to RLS).
 * Returns `null` when Supabase isn't configured yet so the UI can fall back to
 * the degraded/mock experience instead of throwing.
 */
export function createClient() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
