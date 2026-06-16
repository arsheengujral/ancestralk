import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

/**
 * OAuth / magic-link callback. Exchanges the auth code for a session, then
 * redirects to `next` (defaults to the archive). On first sign-in the family +
 * admin profile are provisioned by a Postgres trigger / the begin flow; this
 * route only establishes the session.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/archive';

  if (code) {
    const supabase = createServerSupabase();
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  }

  return NextResponse.redirect(`${origin}${next.startsWith('/') ? next : '/archive'}`);
}
