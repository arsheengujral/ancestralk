-- ════════════════════════════════════════════════════════════════════════════
-- Ancestralk — additive columns for the richer feature screens (persistence)
-- ════════════════════════════════════════════════════════════════════════════
-- Safe to run multiple times (add column if not exists). No data is changed.
-- Run AFTER 0001_init.sql and 0002_storage.sql.
--
-- Adds the few fields the Values and Business screens use that weren't in the
-- original schema, so every screen can save its full shape:
--   traditions: author_name (free-text), tags, details (recipe extras as jsonb)
--   businesses: founder_name (free-text), decisions, lessons
-- RLS already applies to these tables, so the new columns are protected too.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.traditions add column if not exists author_name text;
alter table public.traditions add column if not exists tags text[] not null default '{}';
alter table public.traditions add column if not exists details jsonb not null default '{}';

alter table public.businesses add column if not exists founder_name text;
alter table public.businesses add column if not exists decisions jsonb not null default '[]';
alter table public.businesses add column if not exists lessons jsonb not null default '[]';

-- Legacy plan stores heir display-names (free text), alongside the uuid list.
alter table public.families add column if not exists successor_names text[] not null default '{}';
