# Ancestralk

> A premium, global family legacy platform. **No one gets forgotten.**

Capture the voices, stories, and faces of everyone you love — so that a century
from now, your great-grandchildren will know exactly who you were.

## Stack

Next.js 14 (App Router, TypeScript) · Tailwind CSS · Supabase (auth, Postgres,
storage, RLS) · Anthropic (story generation, **server-side only**) · Whisper
(voice) · Stripe + Razorpay · `@react-pdf/renderer` (books) · framer-motion ·
next-intl. Deploys on Vercel.

## Design system

Ported verbatim from the prototype (`ancestralk_final.html`, the visual spec):

- **Paper** `#FDFAF5` · **gold** `#B8935A` / `#8A6B34` · **ink** `#141009`
- **Cormorant Garamond** (headings) · **Jost** (body)
- **Five live themes** — Heritage · Emerald · Royal · Rose · Midnight — switch
  via `data-theme` on `<body>` (tokens in `app/globals.css`; Tailwind colors map
  to the CSS variables so themes apply to utility classes too).

**Brand rule:** the words "AI" / "AI-powered" / "artificial intelligence" never
appear in the UI. The intelligence is invisible and ambient.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in what you have; the rest degrades gracefully
npm run dev
```

The app boots and runs **without any keys** — external services fall back to a
degraded/mock mode so you can develop the UI first, then wire integrations.
Use `lib/env.ts` (`isSupabaseConfigured()`, `isAnthropicConfigured()`, …) to
branch on availability.

### Database

See [`supabase/README.md`](./supabase/README.md). Run `0001_init.sql` then
`0002_storage.sql`.

## Where each key comes from

| Variable | Service | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Dashboard → Project Settings → API |
| `ANTHROPIC_API_KEY` | Anthropic | <https://console.anthropic.com> |
| `OPENAI_API_KEY` | OpenAI (Whisper) | <https://platform.openai.com> |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe | Dashboard → Developers → API keys |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay | Dashboard → Settings → API Keys |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox | <https://account.mapbox.com> (Leaflet/OSM is the no-key fallback) |
| `RESEND_API_KEY` | Resend | <https://resend.com/api-keys> |
| `TWILIO_*` | Twilio | <https://console.twilio.com> |

## Model configuration

All server-side generation reads from a single file, [`lib/models.ts`](./lib/models.ts):

- **Opus** — premium emotional biographies, first-person legacy letters, and
  ask-your-archive answers.
- **Sonnet** — regular story generation and the short / timeline /
  children-friendly biography versions.

Change the mapping in that one file to re-route any task.

## Project status

Built in phases (see `ancestralk_master_prompt.md`):

- [x] **Phase 0** — scaffold, design tokens + 5 themes, i18n shell, full DB
      schema + RLS + storage, Supabase clients, centralized model config.
- [ ] **Phase 1** — core pages matching the prototype screen-for-screen.
- [ ] **Phase 2** — feature sets A–I.
- [ ] **Phase 3** — auth, full i18n (15 languages), payments.
- [ ] **Phase 4** — security pass (RLS cross-family test, sealed-message
      guarantees, signed URLs, role enforcement, import consent).

## Reference files

- `ancestralk_final.html` — the complete visual design + every existing feature.
- `ancestralk_cursor_prompts.md` — foundation build plan.
- `ancestralk_master_prompt.md` — full feature plan (22 categories, sets A–I).
