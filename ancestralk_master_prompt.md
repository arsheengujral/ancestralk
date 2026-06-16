# ANCESTRALK — MASTER BUILD PROMPT FOR CLAUDE CODE
# Paste this whole file as your first message in Claude Code (claude.ai/code), 
# with ancestralk_final.html and ancestralk_cursor_prompts.md in the same repo.

---

## WHO YOU ARE
You are building **Ancestralk** — a premium, global family legacy platform. 
Tagline: "No one gets forgotten." 
This repo contains two reference files you MUST read first:
- `ancestralk_final.html` — the complete visual design + every existing feature. This is the design spec. Match it exactly.
- `ancestralk_cursor_prompts.md` — the base build plan (project setup, DB, API, auth, payments, deploy). Follow it as the foundation.

This master prompt ADDS new features on top of those two files. Build the foundation from the cursor_prompts file first, then layer everything below.

## ABSOLUTE BRAND RULES (never break)
- NEVER show the words "AI", "AI-powered", or "artificial intelligence" anywhere in the UI. The intelligence is invisible and ambient.
- Design: paper bg (#FDFAF5), gold accent (#B8935A/#8A6B34), ink text (#141009). Fonts: Cormorant Garamond (headings), Jost (body). 5 color themes already exist in the prototype (Heritage/Emerald/Royal/Rose/Midnight) — preserve the theme system everywhere.
- Tone: warm, premium, unhurried. Voice input on every question. Mobile-first. Everything editable, nothing locked.
- 15 languages: English, Hinglish, Hindi, Arabic, Punjabi, Tamil, Telugu, Gujarati, Bengali, Marathi, Urdu, Spanish, French, Chinese, Tagalog. RTL for Arabic + Urdu. Pass language through every API call (Whisper + Claude both support these). Hinglish = romanised Hindi-English mix, the way urban/NRI Indians actually speak.

## TECH STACK (from cursor_prompts foundation)
Next.js 14 (App Router, TS) · Tailwind · Supabase (auth, Postgres, storage, RLS) · Anthropic API (story generation, server-side only) · Whisper (voice) · Stripe + Razorpay · @react-pdf/renderer (books) · framer-motion. Deploy on Vercel.

---

# NEW FEATURE SET A — 20 DIGITAL ALBUM / FAMILY-TREE DESIGNS

Build a **Design Gallery** where families pick a visual style for their saved album and family tree. The user picks a design, it applies across their digital book, their tree view, and their exported PDF.

## Requirements
1. Create `lib/albumDesigns.ts` defining 20 distinct design themes. Each design is a config object:
   `{id, name, description, treeStyle, palette{bg,accent,text,line}, fonts{heading,body}, pageTexture, treeLayout, ornament}`
2. The 20 designs, organised in 4 families of 5:
   **Classic Heritage (1-5):** Royal Lineage (vertical crest tree, deep navy+gold), Vintage Parchment (aged paper, sepia, hand-drawn branches), Old World Manuscript (illuminated-letter style), Victorian Frame (ornate gold frames per person), Family Crest (heraldic shield motifs).
   **Modern Minimal (6-10):** Clean Lines (thin connectors, lots of white space), Nordic Calm (muted tones, sans-serif), Monochrome Elegant (black/white/one accent), Circular Orbit (radial tree, person at center), Grid Modern (card-grid tree).
   **Botanical / Organic (11-15):** Living Tree (literal illustrated tree, photos as leaves), Roots & Branches (mirror tree — ancestors as roots, descendants as branches), Vine Growth (climbing vine connectors), Seasonal (tree changes with seasons/generations), Watercolor Garden (soft painted backdrop).
   **Cinematic / Premium (16-20):** Midnight Gold (dark luxe, gold foil look), Gallery Wall (museum portrait wall), Timeline River (flowing horizontal river of generations), Constellation (family as stars + connecting lines), Storybook (illustrated fairy-tale spreads).
3. Build `app/designs/page.tsx` — a gallery showing all 20 as live preview thumbnails (render each tree style in miniature SVG with sample data). User taps one → saved to `families.album_design`.
4. The chosen design drives THREE things: the Family Tree component render, the Digital Book Studio pages, and the exported PDF. All three read from `families.album_design`.
5. Each design must be a real, visually distinct SVG/CSS treatment — not just a color swap. Tree layouts genuinely differ (vertical, radial, mirrored-roots, horizontal-river, constellation, etc).
6. Families can change design any time; the whole archive re-skins instantly.
7. All 20 must respect the active color theme AND be print-safe (CMYK-friendly, 300dpi assets for PDF).

DB: add `album_design text default 'royal-lineage'` to families table.

---

# NEW FEATURE SET B — GENERATIONAL INHERITANCE (pass the account to kids)

The owner chooses how the archive passes down. Build all THREE modes; owner selects in Settings → Legacy Plan.

## Mode 1 — Scheduled / Inactivity Transfer
- Owner sets: transfer on a specific date, OR after N months of account inactivity (default 12).
- A "legacy check-in" email goes out before transfer ("Confirm you're still managing the archive"). If unconfirmed, admin role transfers to the named successor.
- Build `app/api/legacy/check-inactivity/route.ts` (daily cron) + `app/api/legacy/transfer/route.ts`.

## Mode 2 — Named Heir
- Owner assigns one or more "Heirs" (existing family members). On a trigger (owner action, date, or verified passing), the Heir is promoted to admin.
- Heirs see a badge: "You are a designated keeper of this archive."

## Mode 3 — Multi-Generation Roles (default, recommended)
- Each child gets their own login under the family. Roles: Owner → Keeper(s) → Contributor → Viewer.
- Admin role can be shared and passed down generation by generation, forever. The archive never has a single point of failure.
- A child who joins at 12 as Viewer can be promoted to Contributor, then Keeper, then inherit Owner — the account is designed to live across 100+ years and many hands.

## Shared requirements
- DB: add `inheritance_mode`, `successor_ids uuid[]`, `transfer_date`, `inactivity_months`, `last_active_at` to families; add `role text` to profiles (owner/keeper/contributor/viewer).
- "Continuity guarantee" UI in Settings explaining in warm language how the family's archive survives across generations.
- The emotional framing everywhere: this is not "account management" — it is "passing the torch." Use that language.
- A visible "This archive will outlive all of us" reassurance with the inheritance setup.

---

# NEW FEATURE SET C — SOCIAL & PROFESSIONAL IMPORT

Let families bring in existing digital life — personal and professional — to enrich a person's chapter. 

## What it does
Import photos + captions + dates as **memories** attached to a profile, with optional one-tap conversion of posts into a story chapter. (Decided scope: import-to-archive, not outward auto-posting, not deep live sync — this respects platform data limits and privacy.)

## Sources to support
- **Instagram** — via user-initiated data export (Instagram "Download Your Information" ZIP) OR Instagram Basic Display API for the user's own media. Parse photos, captions, timestamps → create photo records + optional memory notes.
- **Facebook** — via Facebook data export ZIP (photos, posts, life events) → map "life events" directly into the person's Timeline.
- **LinkedIn** — via LinkedIn data export (Profile, Positions, Education) → build the person's *professional* life chapter and timeline (career milestones, roles, education). This is the "professional legacy" layer — what they built, not just who they were.
- **Google Photos** — Google Photos Library API → bulk photo import with dates.
- **Generic upload** — let users drag in any export ZIP; detect format and parse.

## Build
- `app/import/page.tsx` — a friendly importer: pick a source, follow the steps, preview what will be imported, confirm. Show a clear consent + privacy note ("Your data is imported into your private archive only. Nothing is shared.").
- `app/api/import/[source]/route.ts` — parser per source. Handle ZIP uploads with a parsing library; map fields to photos/timeline_events/memories.
- Each profile gets two chapter types: **Personal** (life, values, memories) and **Professional** (career, education, achievements — built from LinkedIn). Show as tabs on the profile.
- DB: add `chapter_type text default 'personal'` to stories; add `source text` to photos and timeline_events (manual/instagram/facebook/linkedin/google).
- Respect every platform's ToS: import only the user's OWN data, user-initiated, with explicit consent screens. No scraping. Document this clearly in code comments.

---

# NEW FEATURE SET D — SAMPLE TUTORIAL VIDEOS / ONBOARDING GUIDES

Families need to see how to use it. Build an in-app help system with sample/tutorial content.

## Build
- `app/learn/page.tsx` — a "How it works" library with short tutorial cards:
  1. "Record your first story in 3 minutes"
  2. "Help an elderly parent use voice-only mode"
  3. "Build your family tree"
  4. "Import your photos from Instagram/Google Photos"
  5. "Write a future message"
  6. "Invite your family to contribute"
  7. "Choose your album design"
  8. "Pass your archive to the next generation"
  9. "Order your printed book"
  10. "Add your professional legacy from LinkedIn"
- Each card: a short looping demo video player (use placeholder MP4 paths in `/public/tutorials/` with a clear note that real screen-recordings go here), a 1-line description, and a "Try it now" button that deep-links to that feature.
- Add a contextual "?" help button on every major screen that opens the relevant tutorial.
- Build a reusable `<VideoTutorial src title steps />` component (poster image, play, captions, step list beside it).
- Include a first-run interactive walkthrough (framer-motion coachmarks) for brand-new families: 5 steps highlighting record, tree, invite, future-messages, designs.

---


# NEW FEATURE SET E — SIX BIOGRAPHY VERSIONS

The chapter generator must produce SIX distinct versions of every person's story, switchable by tab on their profile. Same source answers, different treatments.

1. **Short bio** — 3-4 sentences. For tree node previews and the dashboard.
2. **Full life story** — the rich 3-paragraph literary chapter (already built — keep this).
3. **Premium emotional version** — longer, deeply moving, for the printed book and milestone gifts. Slower, more sensory.
4. **Timeline version** — the life told as dated events in sequence (feeds the Timeline + Family Map).
5. **Children-friendly version** — simple warm language a 6-year-old understands. "Your great-grandma Margaret made the best bread in the whole village…"
6. **Legacy letter version** — written in first person, as if the person is speaking directly to future generations. "If you are reading this, I want you to know…"

Build: `app/api/story/generate/route.ts` accepts a `version` param and uses a tailored system prompt per version. Store all six in `stories` (add columns or a `versions jsonb`). Profile page shows 6 tabs. Each regenerates on demand and is independently editable. Respect the active language for all six.

---

# NEW FEATURE SET F — FAMILY VALUES & TRADITIONS MODULE

A dedicated space for what the family stands for — the soul of the archive, separate from individual stories.

Build `app/values/page.tsx` with sections:
- **Family principles** — the beliefs the family lives by (e.g. "We always show up for each other").
- **Traditions & rituals** — festivals, gatherings, customs, how the family celebrates and mourns.
- **Recipes** — family recipes with the story behind each (who made it, the occasion). Photo + ingredients + method + memory.
- **Advice from elders** — short pieces of wisdom, attributed, recordable by voice.
- **"What our family stands for" page** — a beautiful summary page, auto-composed from the above, suitable for the printed book's opening.

Each item: voice or text input, attributable to a family member, taggable, editable. DB: new table `traditions(id, family_id, type[principle/tradition/recipe/advice], title, body, author_profile_id, media_path, created_at)`. Reads in the active design theme. Include in the printed book and the private family website.

---

# NEW FEATURE SET G — AI FAMILY ASSISTANT (ask your archive)

A natural-language way to query the entire family archive. The single most magical feature — but framed as "Ask your family archive," never as "AI".

Build `app/ask/page.tsx` — a warm search/chat interface where a family member types or speaks a question and gets an answer grounded ONLY in their own archive (never invented). Examples it must handle:
- "Who started our family business?"
- "Show me all photos from Dubai."
- "What did grandma say about marriage?"
- "What are our family values?"
- "Show our migration history."

Build `app/api/ask/route.ts`:
- Retrieval over the family's own data: profiles, stories, timeline_events, photos (captions/tags), voice transcripts, traditions, businesses, map locations.
- Use vector search (pgvector on Supabase) over the family's content, then Anthropic to compose a grounded answer with citations back to the source (link to the profile/photo/story).
- HARD RULE: answer only from retrieved family content. If nothing is found, say so warmly — never fabricate a memory. This is sacred; a made-up family fact is a catastrophic failure.
- Scope every query strictly to the asking user's family (RLS + family_id filter). Never leak across families.
- Voice input supported; answers can read aloud.

---

# NEW FEATURE SET H — FAMILY MAP

A visual world map of the family's geography across generations.

Build `app/map/page.tsx` using a map library (Mapbox GL or Leaflet + OpenStreetMap):
- **Birthplaces** — pin every member's place of birth.
- **Migration routes** — animated arcs showing moves (Lahore → Delhi → Dubai → Toronto), drawn from timeline_events with locations.
- **Cities lived in** — all places a person lived, over time.
- **Family homes** — special pins for meaningful homes, with photos + stories.
- **Important places** — schools, businesses, places of worship, anywhere that mattered.
- A time-slider scrubs through decades and animates the family spreading across the world.
DB: `map_places(id, family_id, profile_id, lat, lng, place_name, type[birth/home/migration/business/important], year, story, photo_path)`. Geocode place names on entry. Pins and routes use the active design theme palette. Tapping a pin opens that person/story.

---

# NEW FEATURE SET I — FAMILY BUSINESS LEGACY MODULE

A dedicated module for business families (a major premium/family-office segment).

Build `app/business/page.tsx`:
- **Founder story** — how the business began, the founder's profile and chapter.
- **Company timeline** — founding, milestones, expansions, hard years, handovers (feeds the main Timeline + Map).
- **Business values** — principles the enterprise was built on (links to the Values module).
- **Major decisions** — pivotal choices and the thinking behind them, told by those who made them.
- **Lessons for the next generation** — explicit wisdom for whoever inherits the business.
- **Family enterprise archive** — documents, logos, photos, press, key contracts (in the Memory Vault, tagged 'business').
DB: `businesses(id, family_id, name, founder_profile_id, founded_year, story, timeline jsonb, values text[], created_at)`. The LinkedIn import (Set C) feeds professional/career data into this module. Surface it in the private family website and the printed book as a dedicated section.


# FULL FEATURE CHECKLIST (everything the product must have)
Build/confirm ALL of these — the existing ones are in ancestralk_final.html, the new ones above:
Onboarding (6 who-options incl. both parents) · voice+text on every question · live transcription · voice playback · contextual suggestions · face recognition on photos · written + raw + timeline chapter views · personal + professional chapters · 5-step save ceremony · visual family tree (20 design styles) · elderly voice-only mode · photo upload · scan old photos · auto-tagging + decade detection · 3 album views · video upload + playback · yearly auto-album · Digital Book Studio (flip-through, media slots, inline video, QR codes) · 20 album/tree designs · future messages (text+voice, 6 unlock conditions, sealed encryption, auto-delivery) · family collaboration + invites · contributor status · smart reminders (birthday/inactivity) · generational inheritance (3 modes) · role system · social/professional import (IG/FB/LinkedIn/Google Photos) · tutorial video library + walkthrough · 5 color themes · 15 languages incl. Hinglish (EN/Hinglish/HI/AR/PA/TA/TE/GU/BN/MR/UR/ES/FR/ZH/TL, RTL for AR+UR) · free + paid tiers · Stripe + Razorpay · printed book ordering · full archive export · 6 biography versions · Family Values & Traditions module · AI Family Assistant (ask your archive) · Family Map with migration routes · Family Business Legacy module · permanent preservation framing.

# BUILD ORDER
1. Read both reference files completely.
2. Foundation: cursor_prompts Prompts 1-3 (project, DB schema + all new columns, API routes).
3. Core pages: cursor_prompts Prompts 4-6 (onboarding, dashboard, album, book, future, collab, settings, tree/voice components).
4. THEN layer all new feature sets above (A designs, B inheritance, C import, D tutorials, E six-bios, F values, G ask-archive, H map, I business).
5. Auth + i18n + payments (Prompt 7).
6. Deploy prep + security checklist (Prompt 8): verify RLS, sealed messages unreadable pre-unlock, signed media URLs, role permissions enforced server-side, import consent flows, cross-family access test.

# WORKING STYLE
- One coherent change set at a time; open a clear PR per feature set.
- After each set, run the app and compare against ancestralk_final.html.
- Match the prototype's look exactly — same colors, fonts, spacing, warmth.
- Comment any platform-ToS-sensitive code (the import parsers especially).
- If a platform API needs developer keys I can't provide yet, build it with clear placeholder env vars and a README note on where to get them.

Start by reading ancestralk_final.html and ancestralk_cursor_prompts.md, then confirm your build plan back to me before writing code.
