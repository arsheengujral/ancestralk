'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const THEMES = [
  { value: 'heritage', label: '🟡 Heritage' },
  { value: 'emerald', label: '🟢 Emerald' },
  { value: 'royal', label: '🔵 Royal' },
  { value: 'rose', label: '🌸 Rose' },
  { value: 'midnight', label: '🌙 Midnight' },
];

const LANGS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'ar', label: 'العربية' },
];

export default function Nav() {
  const t = useTranslations('nav');
  const router = useRouter();
  const [theme, setThemeState] = useState('heritage');

  // Reflect the persisted theme in the selector once mounted.
  useEffect(() => {
    try {
      setThemeState(localStorage.getItem('ank-theme') || 'heritage');
    } catch {
      /* ignore */
    }
  }, []);

  function setTheme(value: string) {
    setThemeState(value);
    if (value === 'heritage') document.body.removeAttribute('data-theme');
    else document.body.setAttribute('data-theme', value);
    try {
      localStorage.setItem('ank-theme', value);
    } catch {
      /* ignore */
    }
  }

  function setLang(value: string) {
    // Persist locale and re-render server components with the new messages + dir.
    document.cookie = `NEXT_LOCALE=${value}; path=/; max-age=31536000`;
    router.refresh();
  }

  return (
    <nav className="nav">
      <Link href="/" className="logo">
        <span className="logo-mark">✦</span> ANCESTRALK
      </Link>
      <div className="nav-r">
        <select
          className="lang-sel"
          aria-label="Theme"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          {THEMES.map((th) => (
            <option key={th.value} value={th.value}>
              {th.label}
            </option>
          ))}
        </select>
        <select
          className="lang-sel"
          aria-label="Language"
          defaultValue="en"
          onChange={(e) => setLang(e.target.value)}
        >
          {LANGS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <Link href="/" className="nb ghost">
          {t('home')}
        </Link>
        <Link href="/archive" className="nb ghost">
          {t('family')}
        </Link>
        <Link href="/settings" className="nb ghost" aria-label={t('settings')}>
          <i className="ti ti-settings" />
        </Link>
        <Link href="/begin" className="nb gold">
          {t('begin')}
        </Link>
      </div>
    </nav>
  );
}
