# Ancestralk — Full Engineering Audit

**Scope:** entire codebase (Next.js 14 App Router + Supabase + TypeScript, ~10k LOC, 20 pages, 15 API routes, 4 SQL migrations).
**Method:** ran the real toolchain (typecheck/lint/build), drove the app end-to-end in a headless browser, and performed three independent deep scans (architecture, security, code-quality), each cross-verified against the source.
**Status of the foundation:** healthy. TypeScript **0 errors**, ESLint **0 errors**, production build **succeeds**, schema ↔ code columns **all resolve**, and the core create→chapter flow **works**. The issues below are targeted, not a broken base.

---

## Phase 3 — Audit Report

Severity: **Critical** (exploitable now, data/ownership loss) · **High** (security/cost, or user-facing break) · **Medium** · **Low/Quality**.

### CRITICAL

#### C1 — Intra-family privilege escalation via role-blind RLS
- **Location:** `supabase/migrations/0001_init.sql:317-340` (generic `*_update` policy); exploited through `lib/familyStore.ts:683` (`setMemberAdmin`).
- **Root cause:** every table's `UPDATE` policy checks only `family_id in auth_family_ids()` — not the caller's role, nor row ownership. All writes go through the **browser anon client**, so the `lib/authz.ts` role ladder is never in the path; RLS is the only guard and it is role-blind.
- **Impact:** any invited member can run one console command — `supabase.from('profiles').update({role:'owner',is_admin:true}).eq('id', <self>)` — and seize the family, including legacy/inheritance control and member deletion.
- **Fix:** add role-scoped RLS (only `owner`/`keeper` may change `profiles.role`/`is_admin` and any `families` billing/inheritance column; members may edit only their own non-privileged fields). Move privileged writes (`setMemberAdmin`, `deleteMember`, legacy, billing) to server routes that verify the caller with `authz.requireRole` before using the service role.
- **Estimated time:** 3–4h · **Risk:** Medium (touches RLS + rewires several client calls to server routes; must re-test save/admin/delete) · **Depends on:** new migration `0005`, C2 (shares the server-route pattern).

#### C2 — Unauthenticated legacy-ownership transfer
- **Location:** `app/api/legacy/transfer/route.ts:23-58`.
- **Root cause:** the route uses the **service-role** (RLS-bypassing) client and takes `familyId`+`successorProfileId` from the body with **no authentication**, cron secret, or signature.
- **Impact:** anyone who learns/guesses two UUIDs can `POST` to promote an arbitrary profile to `owner`/`is_admin` and demote the real owners. Full account takeover, unauthenticated.
- **Fix:** require an authenticated `owner`/`keeper` of that family (`authz.getCaller` + `requireRole`), OR a valid `CRON_SECRET` header for the automated path. Reject otherwise.
- **Estimated time:** 1h · **Risk:** Low · **Depends on:** none (uses existing `authz.ts`).

### HIGH

#### H1 — Cron endpoints publicly triggerable (service role, no secret)
- **Location:** `app/api/legacy/check-inactivity/route.ts`, `app/api/future-messages/deliver/route.ts` (and C2).
- **Root cause:** unauthenticated `GET`/`POST` running under the service role; no `CRON_SECRET`/Vercel-cron header check exists anywhere.
- **Impact:** anyone can force delivery-time processing, prematurely flip `delivered=true`, or hammer the inactivity job.
- **Fix:** shared `requireCron(req)` helper checking `Authorization: Bearer $CRON_SECRET`. **Time:** 1h · **Risk:** Low · **Depends on:** `CRON_SECRET` env.

#### H2 — Signup: no rate limit + email enumeration
- **Location:** `app/api/auth/signup/route.ts:35-53`.
- **Root cause:** service-role `createUser({email_confirm:true})` with no rate limit/CAPTCHA, and a **distinct** `code:'exists'` response for registered emails.
- **Impact:** account-enumeration oracle; scripted mass-creation of live accounts (each provisions a family).
- **Fix:** return a non-distinguishing message; add IP-based rate limiting; keep password rules. **Time:** 2h · **Risk:** Low-Med (rate-limit store) · **Depends on:** rate-limit util.

#### H3 — Contribution approval bypassable
- **Location:** `supabase/migrations/0004_contributions.sql:30-43`; `lib/familyStore.ts:611-621`.
- **Root cause:** `contributions` scoped only by `family_id`; `status` and `author_user` are client-supplied; any member can update/delete any row.
- **Impact:** a low-privilege member self-publishes testimonials (`status:'approved'`), spoofs authorship, or deletes others' contributions — defeating the owner-approval feature.
- **Fix:** RLS so inserts force `status='pending'` and `author_user=auth.uid()`; only `owner`/`keeper` may update `status` or delete. **Time:** 1.5h · **Risk:** Low · **Depends on:** `0005`.

#### H4 — Unauthenticated, unbounded LLM/transcription endpoints (cost DoS)
- **Location:** `app/api/story/generate`, `app/api/text/polish`, `app/api/ask`, `app/api/voice/transcribe` (all `getUser` = 0), `/api` public in `middleware.ts:16`.
- **Root cause:** no session check, no size cap, no rate limit; `ask` accepts an unbounded client `corpus[]`; `transcribe` accepts any file size.
- **Impact:** an anonymous attacker scripts large requests to run up Anthropic/OpenAI bills arbitrarily.
- **Fix:** require a session (`createServerSupabase().auth.getUser()`); cap payload/file sizes; add lightweight per-user rate limiting. **Time:** 3h · **Risk:** Med (must keep the signed-in flow working) · **Depends on:** rate-limit util.

### MEDIUM

#### M1 — Client-side open redirect after login
- **Location:** `app/auth/page.tsx:21,64,69`.
- **Root cause:** `next = params.get('next')` is used raw in `window.location.href = next` (the callback route validates, this path does not).
- **Impact:** `…/auth?next=https://evil.com` redirects a just-authenticated victim off-site (phishing).
- **Fix:** only accept `next` that matches `^/(?!/)` (same-origin relative). **Time:** 15m · **Risk:** Low.

#### M2 — `families` row updatable by any member
- **Location:** `supabase/migrations/0001_init.sql:315-316`; `lib/familyStore.ts:340,510`.
- **Root cause:** `families_update` allows any member to change `subscription_status`, `plan`, `inheritance_mode`, `successor_ids`.
- **Impact:** a member unlocks paid limits without paying, or rewrites inheritance config.
- **Fix:** role-scoped policy (folded into C1's `0005`); billing columns writable only by service role (webhooks). **Time:** included in C1 · **Risk:** Low.

#### M3 — Uploads: no MIME/size validation (stored XSS)
- **Location:** `lib/familyStore.ts:241-257` (`uploadMedia` passes client `body.type` through; `extFromType` defaults to `jpg`).
- **Impact:** an authenticated member uploads an HTML/SVG with `content-type:text/html`; opening its signed URL executes script in the family origin (scope: same-family, hence Medium).
- **Fix:** server-side MIME allow-list (`image/*`, `audio/*`, `video/*`), size cap, store a sanitized content-type. **Time:** 1.5h · **Risk:** Low.

#### M4 — Checkout unauthenticated, trusts client `familyId`
- **Location:** `app/api/checkout/route.ts:23-70`.
- **Impact:** unlimited session/order creation against payment providers; arbitrary `metadata.familyId` later trusted by the webhook (L2).
- **Fix:** session-gate; derive `familyId` from the caller's profile, not the body. **Time:** 1h · **Risk:** Low.

#### M5 — `generic` import violates a DB CHECK constraint (correctness)
- **Location:** `app/api/import/[source]/route.ts:26` allows `'generic'`; `supabase/migrations/0001_init.sql:115,147` CHECK omits it; insert in `lib/familyStore.ts:529-554`.
- **Impact:** a "generic" import **fails at insert** with a constraint violation — a real user-facing break.
- **Fix:** add `'generic'` to both CHECK constraints (migration `0005`), or map generic→`'manual'` at insert. **Time:** 30m · **Risk:** Low.

### LOW / QUALITY

- **L1 — env footgun:** `lib/env.ts:11-24` mixes public + server secrets in one object imported by client code. No actual leak (server keys resolve to `''` in the browser), but split into `env.public.ts`/`env.server.ts`. *20m.*
- **L2 — webhooks:** signatures ARE verified (good); Razorpay compare is non-constant-time; both trust checkout-supplied `familyId` (see M4). *30m.*
- **L3 — memory leaks (missing cleanup):** `components/VoiceRecorder.tsx:52` (interval **and** `getUserMedia` mic stream left open on unmount), `app/elderly/page.tsx:49`, `app/future/page.tsx:56`, `app/album/page.tsx:93`, `app/ask/page.tsx:57`, `app/begin/page.tsx:163`. Add cleanup. *1.5h.*
- **L4 — dead modules:** `lib/storage.ts` (fully unused; duplicate `signedUrl`) → delete. `lib/authz.ts` (fully unused) → **wire in** for C2/H1 instead of deleting. `lib/plans.ts` limits (`FREE_LIMITS`/`PAID_LIMITS`/`limitsFor`/`withinLimit`) unwired; dead exports: `languages.ts` `UI_LOCALES`/`languageLabel`, `crypto.ts` `sealingConfigured`, `voiceBuffer.ts` `clearAudio`, `env.ts` `isMapboxConfigured`. *1h.*
- **L5 — unused deps:** `@react-pdf/renderer`, `@tabler/icons-react` (icons load via CDN webfont), `react-dropzone` — remove (keep `leaflet` as react-leaflet peer). *15m.*
- **L6 — duplication:** Anthropic client + text-block extraction (3 routes) → `lib/anthropic.ts`; `sb()` guard (~25×) and signed-URL loop (2×) in `familyStore`; `fetch('/api/story/generate')` block in begin+profile; cron scaffold (2×). *2h.*
- **L7 — oversized files:** `app/begin/page.tsx` (835) → split step components + `useChapterGeneration`; `lib/familyStore.ts` (690) → `lib/store/*` by domain + move `FlowState`/`ChapterResult` types to `lib/store/types.ts`; `app/profile/page.tsx` (549) → extract `BioVersionEditor`. *4–6h.*
- **L8 — `any` usage (12):** `lib/askCorpus.ts` (4), `lib/importParsers.ts` (6), `app/profile/page.tsx:182-183` (2). Add a `StoredAnswers` type; type import parsers. *1.5h.*
- **L9 — no `.env.example`:** add a documented template of all vars (the root cause of the painful setup). *20m.*
- **L10 — verify intent:** `check-inactivity` only matches `inheritance_mode='scheduled'` (`route.ts:35`) — appears by design; confirm. `sealingConfigured()` (`crypto.ts:19`) can report true while `seal()` requires `FUTURE_MESSAGE_KEY` — reconcile. *30m.*
- **L11 — `/join` dead prefix** in `middleware.ts` public list with no page. *5m.*

---

## Phase 4 — Ordered Repair Roadmap

Each step: **why**, **files**, **expected result**. Fix → verify (typecheck + lint + build + drive the affected flow) → commit → next. No step proceeds on a red build.

### Phase A — Security-critical (do first)
1. **C2 + H1 — lock down privileged/cron routes.** *Why:* unauthenticated ownership takeover is the single worst issue. *Files:* `app/api/legacy/transfer/route.ts`, `check-inactivity/route.ts`, `future-messages/deliver/route.ts`, new `lib/apiAuth.ts` (session + `requireCron`), wire `lib/authz.ts`. *Result:* these routes reject anyone who isn't an owner/keeper (or the cron with secret).
2. **C1 + M2 + H3 — role-scoped RLS (migration `0005`) + move privileged writes server-side.** *Files:* `supabase/migrations/0005_role_rls.sql`, new `app/api/member/{admin,delete}/route.ts`, `app/api/legacy/save/route.ts`, update `lib/familyStore.ts` callers. *Result:* members can no longer self-promote, alter billing, or self-approve contributions.

### Phase B — Security-high
3. **H4 — gate + bound the AI/transcription routes.** *Files:* the four routes + `lib/apiAuth.ts` + size caps. *Result:* only signed-in users can spend AI budget; payloads bounded.
4. **H2 — signup hardening.** *Files:* `app/api/auth/signup/route.ts` (+ rate-limit util). *Result:* no enumeration, throttled.
5. **M4 — checkout auth.** *Files:* `app/api/checkout/route.ts`. *Result:* familyId from session.
6. **M1 — open-redirect fix.** *Files:* `app/auth/page.tsx`. *Result:* only relative `next`.
7. **M3 — upload validation.** *Files:* `lib/familyStore.ts`. *Result:* MIME allow-list + size cap.

### Phase C — Correctness
8. **M5 — generic import.** *Files:* `0005` CHECK + `lib/familyStore.ts`. *Result:* generic imports persist.
9. **L10/L11 — reconcile sealing check; remove `/join`.** *Result:* no misleading config states or dead routes.

### Phase D — Reliability
10. **L3 — memory-leak cleanups**, VoiceRecorder mic stream first. *Result:* no runaway intervals/open mic.

### Phase E — Hygiene
11. **L5 unused deps → L9 `.env.example` → L4 dead code → L8 `any` → L6 duplication.** *Result:* smaller install, documented env, no dead modules, safer types, shared helpers.

### Phase F — Architecture (behaviour-preserving)
12. **L7 file splits, L1 env split.** *Result:* maintainable modules; env footgun removed.

### Phase G — Production readiness
13. Re-run full toolchain + browser drive of every page + auth/save/admin/delete/testimonial/transfer paths; confirm no console/hydration/type/lint errors; update this document with outcomes.

---

*Generated as the pre-fix baseline. No product features are removed by this plan; difficult features (legacy transfer, contributions, uploads) are secured, not deleted.*
