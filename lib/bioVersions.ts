'use client';

/**
 * The six biography versions (Feature Set E). Same source answers, six
 * treatments — switchable by tab on a person's profile. Each is generated on
 * demand (the API routes the model per version: Opus for premium + legacy
 * letter, Sonnet for the rest) and is independently editable. The active
 * language is passed through to every version.
 *
 * Persistence: in degraded/mock mode the six versions live in sessionStorage
 * keyed to the in-flow person. Once Supabase is wired they save to
 * stories.versions (jsonb) — the API already returns a shape that maps cleanly.
 */

export const BIO_VERSIONS = [
  { id: 'short', label: 'Short bio', blurb: 'A few warm sentences — for tree previews and the dashboard.' },
  { id: 'full', label: 'Full life story', blurb: 'The rich three-paragraph literary chapter.' },
  { id: 'premium', label: 'Premium', blurb: 'Longer, deeply moving — for the printed book and milestone gifts.' },
  { id: 'timeline', label: 'Timeline', blurb: 'The life told as dated events in sequence.' },
  { id: 'children', label: 'For children', blurb: 'Simple, warm language a six-year-old understands.' },
  { id: 'legacy_letter', label: 'Legacy letter', blurb: 'First person — as if they are speaking to the future.' },
] as const;

export type BioVersionId = (typeof BIO_VERSIONS)[number]['id'];

export interface BioContent {
  bodyParagraphs: string[];
  tags: string[];
  quote: string;
  timeline: { year: string; title: string }[];
}

// The 15 supported content languages — passed through to Whisper + Claude.
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hinglish', label: 'Hinglish' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ar', label: 'العربية' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ur', label: 'اردو' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'zh', label: '中文' },
  { code: 'tl', label: 'Tagalog' },
] as const;
