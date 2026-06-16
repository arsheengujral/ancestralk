import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env, isSupabaseConfigured } from '@/lib/env';

/**
 * Server Supabase client (anon key + the user's session cookies, so RLS applies
 * as that user). Use in Server Components, route handlers, and server actions.
 * Returns `null` when Supabase isn't configured.
 */
export function createServerSupabase() {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        // In Server Components cookie writes throw; that's expected — the
        // middleware/session refresh handles persistence. Swallow safely.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* read-only context */
        }
      },
    },
  });
}
