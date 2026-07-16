import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Route protection + session refresh (Phase 3).
 *
 * Account model (must-have #4): the public surface — home, auth, join, and the
 * learn/designs previews — is open so visitors can understand the product
 * without an account. Everything that holds or saves private family data
 * requires a session.
 *
 * Degraded mode: when Supabase isn't configured, the middleware is a no-op so
 * the whole app stays usable for local development and demos.
 */

const PUBLIC_PREFIXES = ['/', '/auth', '/join', '/learn', '/designs', '/attira', '/api'];
const PUBLIC_EXACT = new Set(['/']);

function isPublic(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => p !== '/' && (pathname === p || pathname.startsWith(p + '/')));
}

export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Degraded mode — auth not configured. Let everything through.
  if (!url || !anon) return NextResponse.next();

  const res = NextResponse.next();
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (cookies: { name: string; value: string; options?: Record<string, unknown> }[]) =>
        cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;
  if (!user && !isPublic(pathname)) {
    const redirect = new URL('/auth', req.url);
    redirect.searchParams.set('next', pathname);
    return NextResponse.redirect(redirect);
  }

  return res;
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|tutorials/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)'],
};
