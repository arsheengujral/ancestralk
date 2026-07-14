/**
 * Single source of truth for every language Ancestralk supports (UI + content).
 *
 * Content generation (Whisper transcription + Claude chapters) supports all of
 * these via the `language` param. The UI chrome is translated for the
 * high-traffic strings, with English as a graceful fallback for any key not yet
 * localized (see i18n/request.ts).
 *
 * Hinglish = romanised Hindi-English mix, the way urban / NRI Indians speak.
 */

export interface Language {
  code: string;
  native: string; // endonym, shown in the picker
  english: string; // English name
  rtl?: boolean;
}

export const LANGUAGES: Language[] = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'hinglish', native: 'Hinglish', english: 'Hinglish' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu' },
  { code: 'gu', native: 'ગુજરાતી', english: 'Gujarati' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali' },
  { code: 'mr', native: 'मराठी', english: 'Marathi' },
  { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada' },
  { code: 'ml', native: 'മലയാളം', english: 'Malayalam' },
  { code: 'ur', native: 'اردو', english: 'Urdu', rtl: true },
  { code: 'ar', native: 'العربية', english: 'Arabic', rtl: true },
  { code: 'es', native: 'Español', english: 'Spanish' },
  { code: 'fr', native: 'Français', english: 'French' },
  { code: 'zh', native: '中文', english: 'Chinese' },
  { code: 'tl', native: 'Tagalog', english: 'Tagalog' },
];

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

/** Locales that the UI is fully translated for (rest fall back to English). */
export const UI_LOCALES = ['en', 'hi', 'ar', 'hinglish', 'ur', 'bn', 'ta', 'es', 'fr', 'zh'] as const;

export const RTL_CODES = LANGUAGES.filter((l) => l.rtl).map((l) => l.code); // ['ur','ar']

export function isRtl(code: string): boolean {
  return RTL_CODES.includes(code);
}

export function languageLabel(code: string): string {
  const l = LANGUAGES.find((x) => x.code === code);
  return l ? l.native : code;
}

export function englishName(code: string): string {
  return LANGUAGES.find((x) => x.code === code)?.english ?? 'English';
}

/**
 * Regions for the onboarding region step. Each suggests the languages most
 * relevant there — but ALL languages stay available to everyone.
 */
export interface Region {
  id: string;
  label: string;
  flag: string;
  suggests: string[];
}

export const REGIONS: Region[] = [
  { id: 'india', label: 'India', flag: '🇮🇳', suggests: ['hi', 'hinglish', 'en', 'pa', 'ta', 'te', 'gu', 'bn', 'mr', 'kn', 'ml', 'ur'] },
  { id: 'bangladesh', label: 'Bangladesh', flag: '🇧🇩', suggests: ['bn', 'en'] },
  { id: 'gulf', label: 'Middle East / Gulf', flag: '🌍', suggests: ['ar', 'ur', 'hi', 'en'] },
  { id: 'uk', label: 'UK / Europe', flag: '🇬🇧', suggests: ['en', 'fr', 'es', 'gu', 'pa'] },
  { id: 'north-america', label: 'US / Canada', flag: '🇺🇸', suggests: ['en', 'hinglish', 'es', 'zh', 'tl'] },
  { id: 'latam', label: 'Latin America / Spain', flag: '🇪🇸', suggests: ['es', 'en'] },
  { id: 'east-asia', label: 'China / East Asia', flag: '🇨🇳', suggests: ['zh', 'en'] },
  { id: 'sea', label: 'Philippines / SE Asia', flag: '🇵🇭', suggests: ['tl', 'en', 'zh'] },
  { id: 'other', label: 'Somewhere else', flag: '✦', suggests: ['en'] },
];
