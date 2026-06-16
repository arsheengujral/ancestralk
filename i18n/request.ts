import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { LANGUAGE_CODES, isRtl } from '@/lib/languages';
import en from './messages/en.json';

/**
 * i18n config. The UI language is chosen via the NEXT_LOCALE cookie and can be
 * any of the 17 supported codes. English is the base catalogue; a locale's
 * messages are layered on top, so any not-yet-translated string falls back to
 * English instead of erroring. Arabic + Urdu drive RTL.
 *
 * Content languages (Whisper + Claude) use the same codes via the `language`
 * param on the generation APIs.
 */
export const locales = LANGUAGE_CODES;
export const defaultLocale = 'en';

/** Locales that render right-to-left. */
export const rtlLocales: readonly string[] = LANGUAGE_CODES.filter(isRtl);

type Messages = Record<string, Record<string, string>>;

/** Deep-ish merge: English base, overlaid by the locale's translations. */
function mergeWithBase(base: Messages, overlay: Messages): Messages {
  const out: Messages = {};
  for (const ns of Object.keys(base)) {
    out[ns] = { ...base[ns], ...(overlay[ns] ?? {}) };
  }
  for (const ns of Object.keys(overlay)) {
    if (!out[ns]) out[ns] = overlay[ns];
  }
  return out;
}

export default getRequestConfig(async () => {
  const cookieLocale = cookies().get('NEXT_LOCALE')?.value;
  const locale = (LANGUAGE_CODES as string[]).includes(cookieLocale ?? '')
    ? (cookieLocale as string)
    : defaultLocale;

  let overlay: Messages = {};
  if (locale !== 'en') {
    try {
      overlay = (await import(`./messages/${locale}.json`)).default as Messages;
    } catch {
      overlay = {}; // no catalogue yet → English fallback
    }
  }

  return {
    locale,
    messages: mergeWithBase(en as Messages, overlay),
  };
});
