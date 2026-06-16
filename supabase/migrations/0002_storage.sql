-- ════════════════════════════════════════════════════════════════════════════
-- Ancestralk — private storage buckets + access policies
-- ════════════════════════════════════════════════════════════════════════════
-- All media is private; the app serves it exclusively through short-lived signed
-- URLs (never public). Object paths MUST be prefixed with the owning family_id,
-- i.e.  <family_id>/<...>  — the policies below derive ownership from that first
-- path segment, mirroring the row-level family scoping in 0001_init.sql.
-- ════════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values
  ('photos', 'photos', false),
  ('videos', 'videos', false),
  ('voice-recordings', 'voice-recordings', false),
  ('books', 'books', false)
on conflict (id) do nothing;

-- A user may touch an object only when the first folder of its path is one of
-- their family ids. Applies across all four private buckets.
-- (SELECT/DELETE use USING; INSERT uses WITH CHECK; UPDATE uses both.)
create policy "media_select" on storage.objects for select
  using (
    bucket_id in ('photos','videos','voice-recordings','books')
    and (storage.foldername(name))[1] in (select public.auth_family_ids()::text)
  );

create policy "media_insert" on storage.objects for insert
  with check (
    bucket_id in ('photos','videos','voice-recordings','books')
    and (storage.foldername(name))[1] in (select public.auth_family_ids()::text)
  );

create policy "media_update" on storage.objects for update
  using (
    bucket_id in ('photos','videos','voice-recordings','books')
    and (storage.foldername(name))[1] in (select public.auth_family_ids()::text)
  )
  with check (
    bucket_id in ('photos','videos','voice-recordings','books')
    and (storage.foldername(name))[1] in (select public.auth_family_ids()::text)
  );

create policy "media_delete" on storage.objects for delete
  using (
    bucket_id in ('photos','videos','voice-recordings','books')
    and (storage.foldername(name))[1] in (select public.auth_family_ids()::text)
  );
