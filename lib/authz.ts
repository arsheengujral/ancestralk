import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Role } from '@/lib/legacy';

/**
 * Server-side authorization helpers (Phase 4).
 *
 * RLS is the primary guard — every table is scoped to the user's family, so the
 * database itself refuses cross-family reads/writes. These helpers add the
 * second layer: role checks for privileged actions (e.g. only owner/keeper may
 * change the legacy plan or promote members), enforced in route handlers, never
 * trusted from the client.
 */

const RANK: Record<Role, number> = { viewer: 0, contributor: 1, keeper: 2, owner: 3 };

export interface Caller {
  userId: string;
  familyId: string;
  role: Role;
}

/** Resolve the calling user's profile (family + role) from their session. */
export async function getCaller(supabase: SupabaseClient): Promise<Caller | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id, role')
    .eq('user_id', user.id)
    .single();
  if (!profile) return null;

  return { userId: user.id, familyId: profile.family_id, role: (profile.role as Role) ?? 'viewer' };
}

/** True when the caller holds at least the required role. */
export function hasRole(caller: Caller | null, min: Role): boolean {
  if (!caller) return false;
  return RANK[caller.role] >= RANK[min];
}

/** Throwing guard for route handlers. */
export function requireRole(caller: Caller | null, min: Role): asserts caller is Caller {
  if (!hasRole(caller, min)) {
    throw new Response('Forbidden', { status: 403 });
  }
}

/** Guard that a target row belongs to the caller's family. */
export function assertSameFamily(caller: Caller, familyId: string): void {
  if (caller.familyId !== familyId) {
    throw new Response('Forbidden', { status: 403 });
  }
}
