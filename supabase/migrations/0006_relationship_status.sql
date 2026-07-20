-- ════════════════════════════════════════════════════════════════════════════
-- Ancestralk — optional relationship status for the person being remembered
-- ════════════════════════════════════════════════════════════════════════════
-- Safe to run multiple times. Run after 0001–0005.

alter table public.profiles add column if not exists relationship_status text;
