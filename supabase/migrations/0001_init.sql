-- ════════════════════════════════════════════════════════════════════════════
-- Ancestralk — initial schema
-- ════════════════════════════════════════════════════════════════════════════
-- Run in the Supabase SQL editor (or via `supabase db push`).
--
-- Covers cursor Prompt 2 PLUS every column/table the layered feature sets (A–I)
-- need, so later work does not require destructive re-migration:
--   A  designs ............ families.album_design
--   B  inheritance ........ families.inheritance_mode / successor_ids /
--                           transfer_date / inactivity_months / last_active_at,
--                           profiles.role
--   C  social import ...... stories.chapter_type, photos.source,
--                           timeline_events.source
--   E  six biographies .... stories.versions (jsonb)
--   F  values/traditions .. traditions
--   G  ask-your-archive ... content_embeddings (pgvector)
--   H  family map ......... map_places
--   I  business legacy .... businesses
--
-- SECURITY MODEL: every table carries family_id and RLS restricts all access to
-- rows whose family_id is one of the requesting user's families. Cross-family
-- access is impossible through the data layer.
-- ════════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists vector;     -- pgvector, for ask-your-archive (Set G)

-- ─── Helper: the family_id(s) the current auth user belongs to ────────────────
-- SECURITY DEFINER so it reads profiles without tripping that table's own RLS
-- (prevents recursive policy evaluation). Used by every policy below.
create or replace function public.auth_family_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select family_id from public.profiles where user_id = auth.uid();
$$;

-- ─── updated_at trigger ───────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- TABLES
-- ════════════════════════════════════════════════════════════════════════════

-- FAMILIES ────────────────────────────────────────────────────────────────────
create table if not exists public.families (
  id                  uuid primary key default gen_random_uuid(),
  name                text,
  created_at          timestamptz not null default now(),
  subscription_status text not null default 'free',
  plan                text not null default 'starter',
  renewal_date        date,
  languages           text[] not null default '{en}',
  -- Set A — chosen album / family-tree design (drives tree, book, PDF).
  album_design        text not null default 'royal-lineage',
  -- Set B — generational inheritance / continuity.
  inheritance_mode    text not null default 'multi_generation'
                        check (inheritance_mode in ('scheduled','named_heir','multi_generation')),
  successor_ids       uuid[] not null default '{}',
  transfer_date       date,
  inactivity_months   int not null default 12,
  last_active_at      timestamptz not null default now()
);

-- PROFILES ────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  family_id    uuid not null references public.families(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete set null,
  full_name    text,
  birth_year   text,
  hometown     text,
  known_for    text,
  relationship text,
  photo_url    text,
  is_admin     boolean not null default false,
  -- Set B — role ladder: owner → keeper → contributor → viewer.
  role         text not null default 'owner'
                 check (role in ('owner','keeper','contributor','viewer')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists profiles_family_idx on public.profiles(family_id);
create index if not exists profiles_user_idx on public.profiles(user_id);

-- STORIES ─────────────────────────────────────────────────────────────────────
create table if not exists public.stories (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  family_id      uuid not null references public.families(id) on delete cascade,
  written_version text,
  raw_answers    jsonb,
  tags           text[],
  portrait_quote text,
  language       text not null default 'en',
  -- Set E — the six biography versions, keyed by version id
  -- (short / full / premium / timeline / children / legacy_letter).
  versions       jsonb not null default '{}',
  -- Set C — personal life chapter vs professional (LinkedIn-built) chapter.
  chapter_type   text not null default 'personal'
                   check (chapter_type in ('personal','professional')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists stories_family_idx on public.stories(family_id);
create index if not exists stories_profile_idx on public.stories(profile_id);

-- TIMELINE EVENTS ─────────────────────────────────────────────────────────────
create table if not exists public.timeline_events (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  family_id   uuid not null references public.families(id) on delete cascade,
  year        text,
  title       text,
  description text,
  sort_order  int default 0,
  -- Set C — provenance of the event.
  source      text not null default 'manual'
                check (source in ('manual','instagram','facebook','linkedin','google')),
  created_at  timestamptz not null default now()
);
create index if not exists timeline_family_idx on public.timeline_events(family_id);

-- VOICE RECORDINGS ────────────────────────────────────────────────────────────
create table if not exists public.voice_recordings (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid references public.profiles(id) on delete cascade,
  family_id        uuid not null references public.families(id) on delete cascade,
  question_id      text,
  storage_path     text,
  duration_seconds int,
  transcript       text,
  language         text default 'en',
  created_at       timestamptz not null default now()
);
create index if not exists voice_family_idx on public.voice_recordings(family_id);

-- PHOTOS ──────────────────────────────────────────────────────────────────────
create table if not exists public.photos (
  id              uuid primary key default gen_random_uuid(),
  family_id       uuid not null references public.families(id) on delete cascade,
  storage_path    text,
  caption         text,
  decade          text,
  tagged_profiles uuid[] not null default '{}',
  event_type      text,
  is_scanned      boolean not null default false,
  enhanced        boolean not null default false,
  -- Set C — where the photo came from.
  source          text not null default 'manual'
                    check (source in ('manual','instagram','facebook','linkedin','google')),
  created_at      timestamptz not null default now()
);
create index if not exists photos_family_idx on public.photos(family_id);

-- VIDEOS ──────────────────────────────────────────────────────────────────────
create table if not exists public.videos (
  id               uuid primary key default gen_random_uuid(),
  family_id        uuid not null references public.families(id) on delete cascade,
  storage_path     text,
  caption          text,
  duration_seconds int,
  tagged_profiles  uuid[] not null default '{}',
  created_at       timestamptz not null default now()
);
create index if not exists videos_family_idx on public.videos(family_id);

-- FUTURE MESSAGES ─────────────────────────────────────────────────────────────
-- message_text holds the ENCRYPTED payload once sealed (see Prompt 3 #6). There
-- is deliberately no read path until the unlock condition is met.
create table if not exists public.future_messages (
  id                  uuid primary key default gen_random_uuid(),
  from_profile_id     uuid references public.profiles(id) on delete set null,
  family_id           uuid not null references public.families(id) on delete cascade,
  recipient_description text,
  recipient_profile_id  uuid references public.profiles(id) on delete set null,
  unlock_condition    text,
  unlock_date         date,
  message_text        text,
  voice_path          text,
  is_sealed           boolean not null default true,
  delivered           boolean not null default false,
  created_at          timestamptz not null default now()
);
create index if not exists future_family_idx on public.future_messages(family_id);

-- INVITES ─────────────────────────────────────────────────────────────────────
create table if not exists public.invites (
  id               uuid primary key default gen_random_uuid(),
  family_id        uuid not null references public.families(id) on delete cascade,
  invited_by       uuid references public.profiles(id) on delete set null,
  token            text unique not null default gen_random_uuid()::text,
  contact          text,
  status           text not null default 'pending',
  reminder_sent_at timestamptz,
  created_at       timestamptz not null default now()
);
create index if not exists invites_family_idx on public.invites(family_id);
create index if not exists invites_token_idx on public.invites(token);

-- BOOKS ───────────────────────────────────────────────────────────────────────
create table if not exists public.books (
  id         uuid primary key default gen_random_uuid(),
  family_id  uuid not null references public.families(id) on delete cascade,
  year       int,
  pdf_path   text,
  status     text not null default 'draft',
  page_count int,
  created_at timestamptz not null default now()
);
create index if not exists books_family_idx on public.books(family_id);

-- TRADITIONS (Set F) ──────────────────────────────────────────────────────────
create table if not exists public.traditions (
  id                uuid primary key default gen_random_uuid(),
  family_id         uuid not null references public.families(id) on delete cascade,
  type              text not null
                      check (type in ('principle','tradition','recipe','advice')),
  title             text,
  body              text,
  author_profile_id uuid references public.profiles(id) on delete set null,
  media_path        text,
  created_at        timestamptz not null default now()
);
create index if not exists traditions_family_idx on public.traditions(family_id);

-- MAP PLACES (Set H) ──────────────────────────────────────────────────────────
create table if not exists public.map_places (
  id         uuid primary key default gen_random_uuid(),
  family_id  uuid not null references public.families(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  lat        double precision,
  lng        double precision,
  place_name text,
  type       text not null default 'important'
               check (type in ('birth','home','migration','business','important')),
  year       text,
  story      text,
  photo_path text,
  created_at timestamptz not null default now()
);
create index if not exists map_places_family_idx on public.map_places(family_id);

-- BUSINESSES (Set I) ──────────────────────────────────────────────────────────
create table if not exists public.businesses (
  id                uuid primary key default gen_random_uuid(),
  family_id         uuid not null references public.families(id) on delete cascade,
  name              text,
  founder_profile_id uuid references public.profiles(id) on delete set null,
  founded_year      text,
  story             text,
  timeline          jsonb not null default '[]',
  values            text[] not null default '{}',
  created_at        timestamptz not null default now()
);
create index if not exists businesses_family_idx on public.businesses(family_id);

-- CONTENT EMBEDDINGS (Set G) ──────────────────────────────────────────────────
-- Vector index over the family's own content for grounded ask-your-archive
-- retrieval. source_type/source_id link a chunk back to its origin row so
-- answers can cite the exact profile / story / photo / tradition.
-- NOTE: vector dimension (1536) assumes a 1536-dim embedding model; adjust here
-- if Set G selects a different embedder.
create table if not exists public.content_embeddings (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references public.families(id) on delete cascade,
  source_type text not null,   -- profile | story | timeline | photo | voice | tradition | business | map
  source_id   uuid,
  content     text not null,
  embedding   vector(1536),
  created_at  timestamptz not null default now()
);
create index if not exists embeddings_family_idx on public.content_embeddings(family_id);

-- ════════════════════════════════════════════════════════════════════════════
-- updated_at triggers
-- ════════════════════════════════════════════════════════════════════════════
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger stories_updated_at before update on public.stories
  for each row execute function public.set_updated_at();

-- ════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- Pattern: every table is family-scoped. A user may read/write a row only when
-- its family_id is one the user belongs to (public.auth_family_ids()).
-- ════════════════════════════════════════════════════════════════════════════
do $$
declare t text;
begin
  foreach t in array array[
    'families','profiles','stories','timeline_events','voice_recordings',
    'photos','videos','future_messages','invites','books',
    'traditions','map_places','businesses','content_embeddings'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- families: keyed on the row's own id (not family_id).
create policy families_select on public.families for select
  using (id in (select public.auth_family_ids()));
create policy families_update on public.families for update
  using (id in (select public.auth_family_ids()));
-- INSERT for families happens during signup via the service role (bypasses RLS).

-- Generic family-scoped policies for every other table.
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','stories','timeline_events','voice_recordings','photos','videos',
    'future_messages','invites','books','traditions','map_places','businesses',
    'content_embeddings'
  ]
  loop
    execute format($f$
      create policy %1$s_select on public.%1$s for select
        using (family_id in (select public.auth_family_ids()));
      create policy %1$s_insert on public.%1$s for insert
        with check (family_id in (select public.auth_family_ids()));
      create policy %1$s_update on public.%1$s for update
        using (family_id in (select public.auth_family_ids()));
      create policy %1$s_delete on public.%1$s for delete
        using (family_id in (select public.auth_family_ids()));
    $f$, t);
  end loop;
end $$;

-- NOTE on future_messages: RLS above governs metadata rows. The SEALED content
-- (encrypted message_text) has no decryption path in the API until the unlock
-- condition is met — enforced in application code (Prompt 3 #6), not just RLS.
