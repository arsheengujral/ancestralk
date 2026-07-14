-- ════════════════════════════════════════════════════════════════════════════
-- Ancestralk — contributions & testimonials (collaboration with approval)
-- ════════════════════════════════════════════════════════════════════════════
-- Safe to run multiple times. Run after 0001–0003.
--
-- Family members can write testimonials / memories about each other. Each is a
-- "contribution" that starts as `pending` and the owner can approve, reject, or
-- edit before it is published on the person's profile.
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.contributions (
  id           uuid primary key default gen_random_uuid(),
  family_id    uuid not null references public.families(id) on delete cascade,
  profile_id   uuid references public.profiles(id) on delete cascade,  -- about whom
  author_name  text,
  author_user  uuid references auth.users(id) on delete set null,
  kind         text not null default 'testimonial'
                 check (kind in ('testimonial','memory','story')),
  body         text,
  media_path   text,
  status       text not null default 'pending'
                 check (status in ('pending','approved','rejected')),
  created_at   timestamptz not null default now()
);
create index if not exists contributions_family_idx on public.contributions(family_id);
create index if not exists contributions_profile_idx on public.contributions(profile_id);

alter table public.contributions enable row level security;

do $$
begin
  execute $f$
    create policy contributions_select on public.contributions for select
      using (family_id in (select public.auth_family_ids()));
    create policy contributions_insert on public.contributions for insert
      with check (family_id in (select public.auth_family_ids()));
    create policy contributions_update on public.contributions for update
      using (family_id in (select public.auth_family_ids()));
    create policy contributions_delete on public.contributions for delete
      using (family_id in (select public.auth_family_ids()));
  $f$;
exception when duplicate_object then null; -- policies already exist
end $$;
