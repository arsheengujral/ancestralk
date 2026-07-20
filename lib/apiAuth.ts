import 'server-only';
import type { NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { getCaller, hasRole, type Caller } from '@/lib/authz';
import type { Role } from '@/lib/legacy';
import { isSupabaseConfigured } from '@/lib/env';

/**
 * Shared authorization guards for route handlers (see docs/AUDIT.md — C2/H1/H4).
 *
 * The browser talks to Supabase directly under RLS, but privileged routes run
 * with the service role (RLS bypassed) or spend money (LLM/transcription). Those
 * MUST authorize the caller here — either an automated cron (shared secret) or a
 * signed-in user holding a sufficient role.
 */

/**
 * True when the request carries the configured cron secret
 * (`Authorization: Bearer $CRON_SECRET`). Fails closed: if CRON_SECRET is unset,
 * no request is ever treated as an authorized cron.
 */
export function isCronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

/** The signed-in caller (family + role), or null when unauthenticated/unconfigured. */
export async function currentCaller(): Promise<Caller | null> {
  const supabase = createServerSupabase();
  if (!supabase) return null;
  return getCaller(supabase);
}

/**
 * True when there's a valid session — deliberately lighter than currentCaller():
 * it does NOT require a profiles row to already exist. A brand-new user has a
 * session but no profile/family until /api/family/ensure runs (on first save),
 * so anything gating "are they signed in" must not require getCaller() to
 * succeed, or first-time actions (like generating their first chapter, before
 * they've saved anything) get wrongly rejected.
 */
export async function isSignedIn(): Promise<boolean> {
  const supabase = createServerSupabase();
  if (!supabase) return false;
  const { data } = await supabase.auth.getUser();
  return Boolean(data.user);
}

/**
 * Require a signed-in caller with at least `min` role, optionally scoped to a
 * specific family. Returns the caller on success, or null when the check fails
 * (the route should then return 401/403).
 */
export async function requireCaller(
  min: Role = 'viewer',
  familyId?: string,
): Promise<Caller | null> {
  const caller = await currentCaller();
  if (!caller || !hasRole(caller, min)) return null;
  if (familyId && caller.familyId !== familyId) return null;
  return caller;
}

/**
 * Guard for money-spending routes (LLM / transcription — AUDIT H4). In degraded
 * demo mode (Supabase unconfigured) there is no real spend and no sessions, so
 * allow it; otherwise require any signed-in user. Prevents anonymous cost abuse.
 */
export async function allowedToSpend(): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;
  return isSignedIn();
}
