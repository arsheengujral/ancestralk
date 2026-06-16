import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

/**
 * Phase 0 i18n scaffold. Three UI locales are wired now (English, Hindi, Arabic),
 * with Arabic driving RTL. The remaining 12 content languages flow through the
 * generation APIs (Whisper + Claude) via the `language` param and are added to
 * the UI message catalogue in Phase 3 (cursor Prompt 7).
 */
export const locales = ['en', 'hi', 'ar'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/** Locales that render right-to-left. Arabic + Urdu (Urdu added in Phase 3). */
export const rtlLocales: readonly string[] = ['ar', 'ur'];

export default getRequestConfig(async () => {
  const cookieLocale = cookies().get('NEXT_LOCALE')?.value;
  const locale: Locale = (locales as readonly string[]).includes(cookieLocale ?? '')
    ? (cookieLocale as Locale)
    : defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
