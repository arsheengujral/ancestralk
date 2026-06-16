# Ancestralk — Supabase setup

The database, auth, storage, and row-level security for Ancestralk.

## Apply the schema

**Option A — SQL editor (quickest):**
1. Open your project at <https://supabase.com/dashboard> → **SQL Editor**.
2. Run `migrations/0001_init.sql` (tables, RLS, helpers).
3. Run `migrations/0002_storage.sql` (private buckets + storage policies).

**Option B — Supabase CLI:**
```bash
supabase link --project-ref <your-ref>
supabase db push
```

## What gets created

- **14 tables**, all family-scoped: `families`, `profiles`, `stories`,
  `timeline_events`, `voice_recordings`, `photos`, `videos`,
  `future_messages`, `invites`, `books`, `traditions`, `map_places`,
  `businesses`, `content_embeddings`.
- Columns/tables for every layered feature set (A–I) are included up front, so
  no destructive re-migration is needed as those land.
- **Row-level security on every table.** Access is allowed only for rows whose
  `family_id` is one the requesting user belongs to, via the
  `public.auth_family_ids()` SECURITY DEFINER helper.
- **Four private storage buckets** (`photos`, `videos`, `voice-recordings`,
  `books`). Nothing is public — media is served via short-lived signed URLs.
  Object paths must be prefixed with the owning `family_id` (`<family_id>/...`);
  storage policies enforce ownership from that first path segment.
- **pgvector** extension for the ask-your-archive retrieval index (Set G).

## Security notes

- The `content_embeddings.embedding` column is `vector(1536)`. If Set G chooses
  an embedding model with different dimensionality, change it there.
- Sealed future messages: RLS governs the metadata rows, but the encrypted
  content has **no decryption path** in the API until the unlock condition is
  met — enforced in application code, not RLS alone.
- A cross-family access test is part of the Phase 4 security checklist.
