#!/usr/bin/env node
/**
 * Phase 4 — cross-family access test.
 *
 * Proves the core security promise: a user in Family A cannot read or write
 * Family B's data. Creates two families + one user each (service role), signs in
 * as user A (anon client, subject to RLS), and asserts that A sees ONLY A's
 * rows across the family-scoped tables.
 *
 * Usage:  node scripts/security-check.mjs
 * Requires: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
 *           SUPABASE_SERVICE_ROLE_KEY  (skips cleanly if unset).
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anon || !service) {
  console.log('⚠  Supabase env not set — skipping RLS test (configure to run it for real).');
  process.exit(0);
}

const admin = createClient(url, service, { auth: { persistSession: false } });
const rnd = Math.random().toString(36).slice(2, 8);
let fail = false;
const assert = (cond, msg) => {
  console.log(`${cond ? '✓' : '✗ FAIL'}  ${msg}`);
  if (!cond) fail = true;
};

async function makeFamily(label) {
  const { data: fam } = await admin.from('families').insert({ name: `Test ${label} ${rnd}` }).select('id').single();
  const email = `sec-${label}-${rnd}@example.com`;
  const password = `Pw!${rnd}${label}aA1`;
  const { data: u } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  await admin.from('profiles').insert({ family_id: fam.id, user_id: u.user.id, full_name: `User ${label}`, role: 'owner', is_admin: true });
  await admin.from('stories').insert({ family_id: fam.id, profile_id: null, written_version: `${label} secret story` }).select();
  return { familyId: fam.id, email, password, userId: u.user.id };
}

async function cleanup(ids) {
  for (const id of ids) await admin.from('families').delete().eq('id', id);
}

(async () => {
  console.log(`\nCross-family RLS test (run ${rnd})\n`);
  const A = await makeFamily('A');
  const B = await makeFamily('B');

  // Sign in as user A under the anon key (RLS applies).
  const asA = createClient(url, anon, { auth: { persistSession: false } });
  const { error: signInErr } = await asA.auth.signInWithPassword({ email: A.email, password: A.password });
  assert(!signInErr, 'User A can sign in');

  // A should see only A's family + stories.
  const { data: famsSeen } = await asA.from('families').select('id');
  assert((famsSeen ?? []).length === 1 && famsSeen[0].id === A.familyId, 'A sees ONLY its own family');

  const { data: storiesSeen } = await asA.from('stories').select('family_id');
  assert((storiesSeen ?? []).every((s) => s.family_id === A.familyId), 'A sees no other family’s stories');

  // A must NOT be able to read B's rows by id.
  const { data: bStory } = await asA.from('stories').select('id').eq('family_id', B.familyId);
  assert((bStory ?? []).length === 0, 'A cannot read Family B stories by family_id');

  // A must NOT be able to write into B's family.
  const { error: writeErr } = await asA.from('stories').insert({ family_id: B.familyId, written_version: 'intrusion' });
  assert(Boolean(writeErr), 'A cannot insert into Family B (RLS blocks write)');

  await cleanup([A.familyId, B.familyId]);
  console.log(`\n${fail ? '✗ SECURITY TEST FAILED' : '✓ All cross-family checks passed'}\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
