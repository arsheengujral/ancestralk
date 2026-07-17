import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { rateLimit, clientIp } from '@/lib/rateLimit';

/**
 * Create an email+password account that is already email-confirmed, so a new
 * family can sign in immediately without waiting on a confirmation email (and
 * without the owner needing to change any Supabase setting). Uses the service-
 * role admin client. The client then signs in normally with the password.
 */
export async function POST(req: NextRequest) {
  // Throttle account creation per IP (AUDIT H2): blunts scripted mass-signup
  // and makes email enumeration impractical at scale.
  if (!rateLimit(`signup:${clientIp(req)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many attempts — please try again later.' },
      { status: 429 },
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? '';
  const password = body.password ?? '';
  if (!email || !/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
  }
  // Mirrors the client-side check in app/auth/page.tsx — never trust the client alone.
  if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters and include a letter and a number.' },
      { status: 400 },
    );
  }

  const admin = createAdminSupabase();
  if (!admin) {
    return NextResponse.json(
      { error: 'Accounts are not configured on this server yet.' },
      { status: 503 },
    );
  }

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip the confirmation email entirely
  });

  if (error) {
    // Non-distinguishing on purpose (AUDIT H2): the same message whether the
    // email is registered or the create failed, so this endpoint can't be used
    // to enumerate accounts. Legitimate owners are pointed to Sign in.
    return NextResponse.json(
      { error: 'Could not create an account with that email. If you already have one, use "Sign in" instead.' },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
