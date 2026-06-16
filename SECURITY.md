# Ancestralk — security checklist (Phase 4)

The archive holds a family's most private memories. Security is treated as a
core feature, not an afterthought.

## Data isolation (RLS)

- [x] **Every table is family-scoped** with row-level security
      (`supabase/migrations/0001_init.sql`). Access is allowed only for rows
      whose `family_id` is one the requesting user belongs to, via the
      `auth_family_ids()` SECURITY DEFINER helper.
- [x] **Cross-family access test** — `scripts/security-check.mjs` creates two
      families and proves a user in Family A cannot read or write Family B's
      data (run it against a configured Supabase: `node scripts/security-check.mjs`).
- [x] **Service-role client is server-only** (`lib/supabase/admin.ts`,
      `import 'server-only'`) and used only for signup, crons, and webhooks.

## Sealed future messages

- [x] **Encrypted before storage** — AES-256-GCM (`lib/crypto.ts`); only the
      ciphertext is written (`is_sealed=true`).
- [x] **No read path before unlock** — there is no endpoint that returns sealed
      plaintext. The delivery cron (`/api/future-messages/deliver`) is the sole
      decryptor, and only once `unlock_date` has arrived.
- [x] Sealing refuses to store plaintext when the key isn't configured.

## Media

- [x] **Private buckets only** (`0002_storage.sql`) — photos, videos,
      voice-recordings, books. Nothing is public.
- [x] **Signed URLs, expiring** — `lib/storage.ts` (`signedUrl`, default 1h).
- [x] **Path-scoped storage RLS** — object paths are prefixed with `family_id`;
      storage policies enforce ownership from that first path segment.

## Roles & authorization

- [x] **Role ladder** owner → keeper → contributor → viewer (`profiles.role`).
- [x] **Server-side enforcement** — `lib/authz.ts` (`getCaller`, `requireRole`,
      `assertSameFamily`); privileged actions never trust the client.

## Account & routes

- [x] **Middleware** protects private routes; public surface is home / auth /
      join / learn / designs previews (`middleware.ts`).
- [x] **Account required to save** private family data (gated in the begin flow);
      degraded mode stays usable without keys for local dev.

## Payments

- [x] **Webhook signatures verified** — Stripe (`constructEvent`) and Razorpay
      (HMAC) before mutating `subscription_status`.
- [x] **Free-tier limits enforced server-side** (`lib/plans.ts`).

## Import (ToS + privacy)

- [x] **User-initiated, own-data-only** — parses a data export the user
      downloaded themselves; no scraping, no platform-API access
      (`lib/importParsers.ts` header).
- [x] **Explicit consent screen** before any import (`app/import/page.tsx`).
- [x] **Imported into the private archive only** — nothing shared outward.

## Brand / privacy posture

- [x] The words "AI" / "AI-powered" never appear in the UI; model calls are
      server-side only.
- [x] Ask-your-archive answers ONLY from the family's own retrieved content and
      never fabricates (verified in Set G).

## Pre-launch (operational)

- [ ] Run `scripts/security-check.mjs` against production Supabase — must pass.
- [ ] Confirm storage buckets are private in the dashboard.
- [ ] Point Stripe + Razorpay webhooks at production and verify signatures.
- [ ] Schedule crons: reminders (daily 9am IST), future-message delivery (daily),
      legacy inactivity check (daily).
- [ ] Verify Arabic + Urdu RTL on every screen; test record/playback/upload on
      mobile Safari + Android Chrome.
