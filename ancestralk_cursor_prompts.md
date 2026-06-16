# ANCESTRALK — Complete Cursor Build Prompts
## Paste these into Cursor in order. Each builds on the last.
## Keep the prototype file (ancestralk_complete.html) open as the design reference — it IS the spec.

---

## PROMPT 0 — Context (paste first, always)

```
You are building Ancestralk — a premium family legacy platform. Tagline: "No one gets forgotten."

Brand rules (non-negotiable):
- NEVER use the words "AI", "AI-powered", or "artificial intelligence" anywhere in the UI. The intelligence is invisible.
- Design system: warm paper background (#FDFAF5), gold accent (#B8935A / dark #8A6B34), ink text (#141009).
- Fonts: Cormorant Garamond (serif, all headings), Jost (sans, body).
- Tone: warm, premium, unhurried. Like a luxury stationery brand, not a SaaS tool.
- Everything editable, nothing locked. Voice input on every question. Mobile-first.

I will give you a reference HTML prototype. Match its look and flows exactly.
```

---

## PROMPT 1 — Project setup

```
Create a Next.js 14 project called "ancestralk":
- TypeScript, Tailwind CSS, App Router
- Install: @supabase/supabase-js @supabase/ssr openai @anthropic-ai/sdk react-dropzone framer-motion @tabler/icons-react stripe @react-pdf/renderer

.env.local:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

tailwind.config: extend colors {gold:'#B8935A', goldDark:'#8A6B34', goldLight:'#E8D5B0', paper:'#FDFAF5', paper2:'#F5EFE3', paper3:'#EDE3D3', ink:'#141009', ink3:'#6B5E4E'}. Add Cormorant Garamond + Jost via next/font/google.
```

---

## PROMPT 2 — Database schema (run in Supabase SQL editor)

```
Create these tables with RLS:

families(id uuid pk, name text, created_at, subscription_status text default 'free', plan text default 'starter', renewal_date date, languages text[] default '{en}')

profiles(id uuid pk, family_id fk, user_id references auth.users, full_name text, birth_year text, hometown text, known_for text, relationship text, photo_url text, is_admin bool default false, created_at, updated_at)

stories(id uuid pk, profile_id fk, family_id fk, written_version text, raw_answers jsonb, tags text[], portrait_quote text, language text default 'en', created_at, updated_at)

timeline_events(id uuid pk, profile_id fk, family_id fk, year text, title text, description text, sort_order int)

voice_recordings(id uuid pk, profile_id fk, family_id fk, question_id text, storage_path text, duration_seconds int, transcript text, language text, created_at)

photos(id uuid pk, family_id fk, storage_path text, caption text, decade text, tagged_profiles uuid[], event_type text, is_scanned bool default false, enhanced bool default false, created_at)

videos(id uuid pk, family_id fk, storage_path text, caption text, duration_seconds int, tagged_profiles uuid[], created_at)

future_messages(id uuid pk, from_profile_id fk, family_id fk, recipient_description text, recipient_profile_id uuid null, unlock_condition text, unlock_date date null, message_text text, voice_path text null, is_sealed bool default true, delivered bool default false, created_at)

invites(id uuid pk, family_id fk, invited_by fk, token text unique default gen_random_uuid()::text, contact text, status text default 'pending', reminder_sent_at timestamptz, created_at)

books(id uuid pk, family_id fk, year int, pdf_path text, status text default 'draft', page_count int, created_at)

RLS on ALL tables: user can only access rows where family_id matches their own profile's family_id. Storage buckets: photos, videos, voice-recordings, books — all private, signed URLs only.
```

---

## PROMPT 3 — API routes

```
Create in app/api/:

1. story/generate/route.ts — POST {profileId, name, year, town, known, q1..q5, who, language}
   Calls Anthropic claude API. System prompt: "You are a warm literary biographer for Ancestralk. Write beautiful, emotionally precise 3-paragraph biographical chapters using every specific detail given, zero generic phrases, written for a great-grandchild who never met them. End with TAGS: (4-5 single-word values), QUOTE: (one portrait-caption sentence), TIMELINE: (year|title pairs separated by ; if life events given). Respond in the requested language."
   Parse response, save to stories + timeline_events. Return {written, tags, quote, timeline}.

2. voice/transcribe/route.ts — POST FormData{audio, language}. Whisper API (supports hi, ar, pa, ta, etc). Save audio to voice-recordings bucket. Return {transcript, duration, path}.

3. photos/upload/route.ts — POST FormData{image, isScanned}. Upload to photos bucket. If isScanned: enhance via sharp (auto-levels, sharpen). Call Anthropic vision to estimate decade + suggest people from existing profile photos. Return {url, decade, suggestedPeople}.

4. videos/upload/route.ts — POST FormData{video}. Validate MP4 ≤2min ≤100MB. Upload to videos bucket. Return signed URL.

5. book/generate/route.ts — POST {familyId}. Compile with @react-pdf/renderer:
   cover → tree spread → one chapter per profile (photo, chapter text, tags, quote, QR code linking to signed voice URL) → photo spreads by decade → video pages as QR codes → sealed letters page (locked icons only) → closing page "The next chapter belongs to whoever comes next."
   Save PDF to books bucket. Return download URL.

6. future-messages/seal/route.ts — POST. Encrypt message_text with a key derived from unlock conditions (use pgsodium or app-level AES). Once sealed, no read endpoint exists until unlock. 

7. future-messages/deliver/route.ts — cron-called. Find messages where unlock_date <= today and not delivered. Send via Resend email + Twilio WhatsApp. Mark delivered.

8. invite/send/route.ts — POST {familyId, contact}. Create invite, send WhatsApp/email with join link /join?token=.

9. reminders/run/route.ts — daily cron: (a) birthday of profile with empty story → "X turns N today. Their chapter is still blank." (b) invite pending 7 days → nudge. (c) 30 days before renewal → "Your 2026 album is being prepared."
```

---

## PROMPT 4 — Pages (match the prototype exactly)

```
Build these pages, matching ancestralk_complete.html screen-for-screen:

app/page.tsx — Hero "No one in your family should ever be forgotten" (forgotten in italic gold), 6 feature cards, Starter (free) + Family Legacy ($60/yr) pricing cards. Language switcher in nav (en/hi/ar — ar flips dir=rtl).

app/begin/page.tsx — 5-step onboarding:
  Step 1: who (6 options incl. "Both parents" → loops twice)
  Step 2: basics + photo upload + face-recognition confirmation banner
  Step 3: 4 story questions + life-events field. EVERY question: mic button (record → live transcript into textarea → playback bar with animated waveform) + contextual suggestion chips that change based on keywords typed (e.g. "baker" → baking follow-ups)
  Step 4: chapter result — 3 tabs (Written / Your words / Timeline), voice playback bar, edit buttons
  Step 5: save overlay — 5 sequential animated steps ending "Saved forever ✦"

app/elderly/page.tsx — Voice-only mode: full screen, one serif question (clamp 26-40px), giant gold mic button, live transcript below, tap-through 5 questions. No typing anywhere.

app/archive/page.tsx — dashboard: reminder card, SVG family tree (photo in featured node, dashed + nodes clickable), yearly package card, quick actions grid, future messages list, contributors with invite input.

app/album/page.tsx — 5 tabs: All (upload + scan flow), By person, By decade, Videos (upload + auto-album preview), Photo book.

app/book/page.tsx — Book Studio: flip-through digital book (7+ pages, framer-motion page turns), media upload slots in pages, uploaded videos playable inline, order buttons (hardcover ₹2,800 / softcover ₹1,500 / PDF free).

app/future/page.tsx — sealed letters: recipient + 6 unlock conditions + text/voice message, dark seal-preview animates lock as form completes, seal ceremony on save.

app/collaborate/page.tsx — members list with status (Complete/Writing/Pending), invite row, 3-step how-it-works, privacy guarantees.

app/settings/page.tsx — plan status, reminder toggles, languages, full archive export, account.

Floating guide button (✦, bottom-right) on every page with context tips per route.
```

---

## PROMPT 5 — Voice components

```
components/VoiceRecorder.tsx:
- Uses MediaRecorder API. Tap → record (button pulses red with dot). Tap again → stop.
- Streams audio to /api/voice/transcribe, writes transcript into the bound textarea live (chunked every 3s for near-live feel).
- Props: questionId, profileId, language, onTranscript, onComplete.

components/VoicePlayback.tsx:
- Gold circular play button, 15-20 animated waveform bars (random heights while playing), duration label.
- Light variant (inline under questions) and dark variant (chapter header bar).
- Audio from Supabase signed URL.
```

---

## PROMPT 6 — Family tree component

```
components/FamilyTree.tsx — SVG in React:
- 3+ generations, circles with photo (clipPath) or initials; featured person larger, gold-filled.
- Empty slots: dashed circle, "+", onClick → /begin with relationship pre-filled.
- Lines solid (known) / dashed (empty). Click member → their chapter.
- Pan/zoom via touch + wheel (use d3-zoom or simple transform state). Unlimited generations: layout via simple level-based algorithm keyed off relationship field.
```

---

## PROMPT 7 — Auth, i18n, payments

```
Auth: Supabase magic link + Google. Signup creates family + admin profile. /join?token= links new user to existing family. Middleware protects everything except /, /join, /auth.

i18n: next-intl with en, hi, ar message files (translate all UI strings from the prototype; ar sets dir=rtl). Whisper + Claude already handle the content languages — pass language through every API call.

Payments: Stripe ($60/yr, global) + Razorpay (₹4,999/yr, India — detect by locale). Webhook updates families.subscription_status. Free tier limits enforced server-side: 1 profile, 4 questions, 5 photos, no voice playback, no future messages. On renewal webhook → trigger book/generate + send album email.
```

---

## PROMPT 8 — Deploy

```
Vercel. Set all env vars. Supabase storage buckets created + private. Stripe + Razorpay webhooks pointed at production. pg_cron schedules: reminders daily 9am IST, future-message delivery daily.

Pre-launch checklist:
- RLS verified on every table (write a test that tries cross-family access)
- Sealed future messages unreadable via any endpoint before unlock date
- Voice/photo/video URLs are signed, expiring, never public
- Full archive export works (zip of photos, voices, stories JSON, book PDF)
- Mobile Safari + Android Chrome: record, playback, upload all tested
- Arabic RTL layout verified on every page
```

---

## HOW TO USE
1. Open Cursor → new project → paste PROMPT 0, then PROMPT 1.
2. Run PROMPT 2 SQL in Supabase dashboard.
3. Prompts 3→7 one at a time; after each, run the app and compare against ancestralk_complete.html.
4. PROMPT 8 to ship.
Budget: one developer (or you + Cursor), 6-9 weeks to a chargeable V1.
