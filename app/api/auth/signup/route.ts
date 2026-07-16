import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';

/**
 * Create an email+password account that is already email-confirmed, so a new
 * family can sign in immediately without waiting on a confirmation email (and
 * without the owner needing to change any Supabase setting). Uses the service-
 * role admin client. The client then signs in normally with the password.
 */
export async function POST(req: NextRequest) {
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
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
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
    // Most common case: the email is already registered.
    const already = /already|registered|exists/i.test(error.message);
    return NextResponse.json(
      {
        error: already
          ? 'That email already has an account — please use "Sign in" instead.'
          : error.message,
        code: already ? 'exists' : 'error',
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
