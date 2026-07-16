-- ════════════════════════════════════════════════════════════════════════════
-- Ancestralk — role-scoped RLS hardening (fixes AUDIT C1, M2, H3)
-- ════════════════════════════════════════════════════════════════════════════
-- Safe to run multiple times. Run after 0001–0004.
--
-- Before this migration every table's UPDATE/DELETE policy checked only that the
-- row was in the caller's family — NOT the caller's role. Combined with the app
-- writing through the browser client, any invited member could self-promote to
-- owner, rewrite billing, or self-approve contributions. This migration adds the
-- role dimension:
--   • profiles.role / profiles.is_admin  — never writable by the client
--     (only the service role, via an authorized server route, may change them)
--   • families.subscription_status / plan / renewal_date — client-locked
--     (only webhooks, via the service role, may change them)
--   • profile edits — a member may edit only their OWN row; admins any in-family
--   • profile deletes / family updates / contribution moderation — admins only
--   • new contributions — forced to status='pending', authored by the caller
-- ════════════════════════════════════════════════════════════════════════════

-- Caller's admin status (owner/keeper or is_admin), evaluated without recursing
-- into the policies being defined. SECURITY DEFINER + pinned search_path.
create or replace function public.auth_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
      and (is_admin = true or role in ('owner', 'keeper'))
  );
$$;

-- ── profiles ──────────────────────────────────────────────────────────────────
-- Privileged columns are unreachable from the anon/authenticated (client) roles.
revoke update (role, is_admin) on public.profiles from authenticated, anon;

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using (
    family_id in (select public.auth_family_ids())
    and (user_id = auth.uid() or public.auth_is_admin())
  );

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles for delete
  using (
    family_id in (select public.auth_family_ids())
    and public.auth_is_admin()
  );

-- ── families ──────────────────────────────────────────────────────────────────
-- Billing columns are set only by webhooks (service role), never the client.
revoke update (subscription_status, plan, renewal_date) on public.families from authenticated, anon;

drop policy if exists families_update on public.families;
create policy families_update on public.families for update
  using (
    id in (select public.auth_family_ids())
    and public.auth_is_admin()
  );

-- ── contributions ─────────────────────────────────────────────────────────────
-- New contributions must be pending and authored by the caller; only admins may
-- moderate (approve/reject) or delete.
drop policy if exists contributions_insert on public.contributions;
create policy contributions_insert on public.contributions for insert
  with check (
    family_id in (select public.auth_family_ids())
    and status = 'pending'
    and (author_user is null or author_user = auth.uid())
  );

drop policy if exists contributions_update on public.contributions;
create policy contributions_update on public.contributions for update
  using (
    family_id in (select public.auth_family_ids())
    and public.auth_is_admin()
  );

drop policy if exists contributions_delete on public.contributions;
create policy contributions_delete on public.contributions for delete
  using (
    family_id in (select public.auth_family_ids())
    and public.auth_is_admin()
  );
