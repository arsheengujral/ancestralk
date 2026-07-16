/* ══════════════════════════════════════════════════════════════════════════
 * ATTIRA Skin — demo domain data.
 *
 * Content is drawn from the approved copy in the imported design (screens
 * 1a–1g, 2a–2d) and from /scaffolds/skin.md (the ingredient matrix, §5, myths
 * §22, protocols §6, layering §7). This is the "knowledge scaffold made
 * visible" — every string here honours the guardrails: cosmetic not medical,
 * ingredients before brands, never the word "AI", progress-framed, warm.
 * ════════════════════════════════════════════════════════════════════════════ */

export type Persona = 'maya' | 'arjun';

export type TabId = 'today' | 'checkin' | 'rituals' | 'learn' | 'you';

/* ── Score ring geometry (from the design: r=86 → C = 540.4) ─────────────── */
export const RING_C = 540.4;
export function ringOffset(score: number, circumference = RING_C): number {
  const s = Math.max(0, Math.min(100, score));
  return +(circumference * (1 - s / 100)).toFixed(1);
}

/* ── Demo state defaults (mirror the design's editor props) ──────────────── */
export const DEMO = {
  name: 'Maya',
  score: 82,
  scoreTrend: 3,
  streak: 12,
  freezes: 1,
  level: 7,
  levelTitle: 'Enthusiast',
  xpToNext: 260,
  xpPct: 74,
  ingredientsKnown: 14,
  city: 'London',
};

/* ── Check-in indicators (screen 1d — strengths lead) ────────────────────── */
export interface Indicator {
  key: string;
  label: string;
  value: number;
  color: string;
}
export const INDICATORS: Indicator[] = [
  { key: 'hydration', label: 'Hydration', value: 64, color: '#7FA8AB' },
  { key: 'oil', label: 'Oil balance', value: 72, color: '#C9A96A' },
  { key: 'texture', label: 'Texture', value: 81, color: '#B9A8D9' },
  { key: 'brightness', label: 'Brightness', value: 68, color: '#E0B7AF' },
  { key: 'tone', label: 'Tone evenness', value: 77, color: '#A995CF' },
  { key: 'calmness', label: 'Calmness', value: 88, color: '#55898D' },
];

/* The mandatory disclosure line (scaffold §1 guardrail, design 1d). Verbatim. */
export const CHECKIN_DISCLOSURE =
  'Drawn from your answers, habits and 42 check-ins — never a medical measurement.';

/* ── Rituals ─────────────────────────────────────────────────────────────── */
export interface RitualStep {
  n: number;
  name: string;
  duration: string;
  why: string;
  chips?: { label: string; tone?: 'neutral' | 'caution' }[];
  done?: boolean;
}
export interface Ritual {
  id: 'pm' | 'am';
  kind: 'night' | 'morning';
  eyebrow: string;
  greeting: string;
  minutes: string;
  closing: string;
  steps: RitualStep[];
}

// Night ritual — Maya, retinol night, dark "ceremony" mode (screen 1e).
export const NIGHT_RITUAL: Ritual = {
  id: 'pm',
  kind: 'night',
  eyebrow: 'Evening · Retinol night',
  greeting: 'Wind down, Maya',
  minutes: '11 min',
  closing: 'a freeze is saved if life happens',
  steps: [
    { n: 1, name: 'Oil cleanser', duration: '1 min', why: 'Melts SPF & the day away.', done: true },
    { n: 2, name: 'Gel cleanser', duration: '1 min', why: 'The second cleanse.', done: true },
    {
      n: 3,
      name: 'Retinol serum',
      duration: '2 min',
      why: 'A pea-sized amount, patted — not rubbed. Retinol renews at night while you sleep; softness shows in 8–12 weeks. Tonight is night 2 of 3 this week.',
      chips: [
        { label: 'Retinol 0.3%' },
        { label: 'Squalane base' },
        { label: 'Skip AHA tonight', tone: 'caution' },
      ],
    },
    { n: 4, name: 'Ceramide moisturizer', duration: '1 min', why: 'Seals the barrier overnight.' },
    { n: 5, name: 'Overnight lip mask', duration: '30 sec', why: 'Then the day-complete moment.' },
  ],
};

// Morning ritual — Arjun, shave-day variant (screen 1f). Same component, gender-aware data.
export const MORNING_RITUAL: Ritual = {
  id: 'am',
  kind: 'morning',
  eyebrow: 'Morning · Shave day',
  greeting: 'Ease into it, Arjun',
  minutes: '9 min',
  closing: 'your jawline redness is down 3 weeks running',
  steps: [
    { n: 1, name: 'Warm-water cleanse', duration: '1 min', why: 'Softens skin and stubble.', done: true },
    {
      n: 2,
      name: 'Pre-shave oil',
      duration: '1 min',
      why: 'A thin slick of squalane and jojoba lets the blade glide instead of scrape — the single biggest fix for razor burn on your jawline.',
      chips: [{ label: 'Squalane' }, { label: 'Jojoba oil' }],
    },
    { n: 3, name: 'Shave', duration: '3 min', why: 'With the grain, light passes.' },
    {
      n: 4,
      name: 'Calming post-shave balm',
      duration: '1 min',
      why: 'Niacinamide settles redness · beard-oil day tomorrow.',
    },
    { n: 5, name: 'SPF 50', duration: '1 min', why: 'UV 9 in Delhi today — don’t skip the ears.' },
  ],
};

/* ── Ingredient library (screen 2c) + detail (scaffold §5, §22) ──────────── */
export type Mastery = 'Mastered' | 'Learning' | 'New today' | 'Tomorrow' | 'Locked';
export interface Ingredient {
  id: string;
  monogram: string;
  name: string;
  tagline: string;
  mastery: Mastery;
  swatch: [string, string]; // radial gradient stops
  ink: string;
  does: string;
  concerns: string;
  suits: string;
  when: string;
  frequency: string;
  results: string;
  pairs: string;
  caution: string;
  myth?: { claim: string; truth: string };
}

export const INGREDIENTS: Ingredient[] = [
  {
    id: 'hyaluronic',
    monogram: 'Ha',
    name: 'Hyaluronic Acid',
    tagline: 'The water magnet',
    mastery: 'Mastered',
    swatch: ['#DCEAEA', '#9CC0C2'],
    ink: '#2E5558',
    does: 'A humectant — it draws water into the skin and holds many times its weight, for immediate plumpness.',
    concerns: 'Dehydration, tightness, fine lines from dryness, dullness.',
    suits: 'Everyone, every skin type — including oily.',
    when: 'AM and PM, on damp skin.',
    frequency: 'Daily.',
    results: 'Immediate softness; smoother look over 2–4 weeks.',
    pairs: 'Everything — a friendly base layer under moisturiser.',
    caution:
      'Apply to damp skin and seal with moisturiser. On very dry air, dry skin, it can pull moisture the wrong way if left unsealed.',
    myth: {
      claim: 'Drinking water fixes dry skin.',
      truth: 'Dryness is a barrier issue, solved topically. Hydrate for health — but seal water in with moisturiser.',
    },
  },
  {
    id: 'retinol',
    monogram: 'Re',
    name: 'Retinol',
    tagline: 'The renewer',
    mastery: 'Learning',
    swatch: ['#EBE0F2', '#B9A8D9'],
    ink: '#4E4066',
    does: 'Accelerates cell turnover and stimulates collagen — the most evidence-backed cosmetic anti-ageing ingredient.',
    concerns: 'Fine lines, texture, acne, comedones, pigmentation, pores.',
    suits: 'Most people from the mid-20s. Slow ramp for sensitive skin.',
    when: 'Night only — it’s light-sensitive and increases sun sensitivity.',
    frequency: '1 night/week → 2 → alternate nights. Consistency beats strength.',
    results: 'Texture 8–12 weeks · fine lines 3–6 months.',
    pairs: 'Niacinamide, peptides, ceramides, hyaluronic acid.',
    caution:
      'Not with AHA/BHA the same night — alternate. Pause in pregnancy & breastfeeding. SPF every morning is non-negotiable.',
    myth: {
      claim: 'More actives = better skin.',
      truth: 'Over-exfoliation is the #1 self-inflicted problem. One new active at a time, ramped slowly.',
    },
  },
  {
    id: 'niacinamide',
    monogram: 'Nc',
    name: 'Niacinamide',
    tagline: 'The quiet multitasker',
    mastery: 'Mastered',
    swatch: ['#F2E3C8', '#DDBC85'],
    ink: '#6B5320',
    does: 'Regulates oil, strengthens the barrier, calms redness, softens the look of pores, and evens tone.',
    concerns: 'Oil, pores, redness, PIH, uneven tone, sensitivity — almost everything.',
    suits: 'Virtually everyone. The best "first active".',
    when: 'AM and/or PM.',
    frequency: 'Daily. 2–5% is the sweet spot.',
    results: 'Oil & redness 2–4 weeks · pores 6–8 weeks.',
    pairs: 'Everything — it even reduces retinol’s irritation.',
    caution: 'Essentially nothing at cosmetic strengths.',
    myth: {
      claim: 'Niacinamide + vitamin C cancel out.',
      truth: 'A myth at cosmetic concentrations. Use them together freely.',
    },
  },
  {
    id: 'squalane',
    monogram: 'Sq',
    name: 'Squalane',
    tagline: 'Your skin’s mirror',
    mastery: 'New today',
    swatch: ['#F2D9D4', '#DBA79E'],
    ink: '#6E4039',
    does: 'A weightless echo of the oils your skin already makes — it seals moisture without heaviness.',
    concerns: 'Dryness, dehydration, sensitivity, barrier support.',
    suits: 'Nearly everyone, including oily and acne-prone skin.',
    when: 'AM and/or PM, as the last step or a pre-shave slip.',
    frequency: 'Daily, or as needed.',
    results: 'Immediate comfort; barrier support over weeks.',
    pairs: 'Everything — and it’s one of the few oils safe with fungal-acne-prone skin.',
    caution: 'Buy squalane (stable), not squalene (the unstable form).',
  },
  {
    id: 'bakuchiol',
    monogram: 'Ba',
    name: 'Bakuchiol',
    tagline: 'The gentle retinol alternative',
    mastery: 'Tomorrow',
    swatch: ['#EDE7F0', '#C9BBD9'],
    ink: '#6E6579',
    does: 'A plant-derived alternative to retinol — gentler, with no added sun sensitivity.',
    concerns: 'Early ageing, texture — for sensitive or retinoid-intolerant skin.',
    suits: 'Sensitive skin, and generally considered pregnancy-friendly (confirm with your doctor).',
    when: 'AM or PM.',
    frequency: 'Daily.',
    results: 'Milder and slower than a true retinoid — honestly.',
    pairs: 'Niacinamide, vitamin C, peptides.',
    caution: 'Meaningfully less potent than retinol — set expectations honestly.',
  },
  {
    id: 'vitaminc',
    monogram: 'Vc',
    name: 'Vitamin C',
    tagline: 'The morning shield',
    mastery: 'Learning',
    swatch: ['#F5E8D2', '#E3C99B'],
    ink: '#6B5320',
    does: 'An antioxidant that neutralises daily damage from UV and pollution, brightens, and boosts your sunscreen.',
    concerns: 'Dullness, pigmentation, uneven tone — big for city air.',
    suits: 'Most people; gentler derivatives (SAP, THD) suit sensitive skin.',
    when: 'Morning, before SPF.',
    frequency: 'Daily. 10–20% L-ascorbic acid.',
    results: 'Glow 4–6 weeks · pigmentation 8–12 weeks.',
    pairs: 'Vitamin E + ferulic acid, SPF, niacinamide.',
    caution: 'It oxidises — if it turns orange/brown, it’s done. Roughly 3 months after opening.',
  },
  {
    id: 'ceramides',
    monogram: 'Ce',
    name: 'Ceramides',
    tagline: 'The barrier’s mortar',
    mastery: 'Mastered',
    swatch: ['#E8E4DA', '#C6BEA9'],
    ink: '#57503B',
    does: 'Repairs and reinforces the skin barrier — the mortar between your skin cells.',
    concerns: 'Dryness, sensitivity, over-exfoliation, retinoid support.',
    suits: 'Dry, sensitive, and anyone using actives.',
    when: 'AM and PM, in your moisturiser.',
    frequency: 'Daily.',
    results: 'A stronger barrier in 4–6 weeks.',
    pairs: 'Best with cholesterol + fatty acids. Safe with everything.',
    caution: 'None — always helpful.',
  },
];

/* ── 30-Day Glow-Up journey (screen 2d) ──────────────────────────────────── */
export interface JourneyNode {
  day: number;
  title: string;
  sub: string;
  state: 'done' | 'here' | 'upcoming' | 'milestone-done' | 'milestone-next';
  side: 'left' | 'right';
}
// Ordered from Day 30 (top) down to Day 1 (bottom), as in the design path.
export const JOURNEY: JourneyNode[] = [
  { day: 30, title: 'Transformation story', sub: 'Written from your month', state: 'upcoming', side: 'left' },
  { day: 25, title: 'Photo day', sub: 'Week 4 comparison', state: 'upcoming', side: 'right' },
  { day: 21, title: 'Three-week badge', sub: '3 days away', state: 'milestone-next', side: 'left' },
  { day: 18, title: 'Tonight’s ritual', sub: 'You are here · +30 XP', state: 'here', side: 'right' },
  { day: 14, title: 'Fortnight badge', sub: 'Earned Sunday · +60 XP', state: 'milestone-done', side: 'left' },
  { day: 7, title: 'Week 1 complete', sub: 'First celebration · +40 XP', state: 'done', side: 'right' },
  { day: 1, title: 'You began', sub: 'June 28 · first photo saved', state: 'done', side: 'left' },
];

/* Week strip for the streak card (screen 2a): done / today / upcoming. */
export const WEEK_STRIP: { d: string; state: 'done' | 'today' | 'upcoming' }[] = [
  { d: 'M', state: 'done' },
  { d: 'T', state: 'done' },
  { d: 'W', state: 'done' },
  { d: 'T', state: 'today' },
  { d: 'F', state: 'upcoming' },
  { d: 'S', state: 'upcoming' },
  { d: 'S', state: 'upcoming' },
];

/* Ritual-consistency heat strip (screen 1g) — 21 days, purple intensities. */
export const CONSISTENCY: number[] = [
  2, 2, 1, 2, 2, 3, 2, 2, 3, 2, 0, 2, 3, 3, 2, 3, 3, 2, 3, 3, 3,
];
export const HEAT_COLORS = ['#EBE4F2', '#D9CCEC', '#B9A8D9', '#8A76B4'];
