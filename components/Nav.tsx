'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LANGUAGES } from '@/lib/languages';
import { useUser } from '@/lib/useUser';

const THEMES = [
  { value: 'heritage', label: '🟡 Heritage' },
  { value: 'emerald', label: '🟢 Emerald' },
  { value: 'royal', label: '🔵 Royal' },
  { value: 'rose', label: '🌸 Rose' },
  { value: 'midnight', label: '🌙 Midnight' },
];

export default function Nav() {
  const t = useTranslations('nav');
  const router = useRouter();
  const { user, configured, signOut } = useUser();
  const [theme, setThemeState] = useState('heritage');
  const [open, setOpen] = useState(false); // mobile menu

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
    document.cookie = `NEXT_LOCALE=${value}; path=/; max-age=31536000`;
    router.refresh();
  }

  const links = (
    <>
      <Link href="/" className="nb ghost" onClick={() => setOpen(false)}>
        {t('home')}
      </Link>
      <Link href="/archive" className="nb ghost" onClick={() => setOpen(false)}>
        {t('family')}
      </Link>
      <Link href="/settings" className="nb ghost" onClick={() => setOpen(false)} aria-label={t('settings')}>
        <i className="ti ti-settings" />
        <span className="nav-settings-label"> {t('settings')}</span>
      </Link>
      {configured && user ? (
        <button
          className="nb ghost"
          onClick={() => {
            signOut();
            setOpen(false);
          }}
          title={user.email}
        >
          <i className="ti ti-logout" /> {user.email?.split('@')[0] ?? 'Sign out'}
        </button>
      ) : (
        <Link href="/auth" className="nb ghost" onClick={() => setOpen(false)}>
          {t('signin')}
        </Link>
      )}
      <Link href="/begin" className="nb gold" onClick={() => setOpen(false)}>
        {t('begin')}
      </Link>
    </>
  );

  const selectors = (
    <>
      <select className="lang-sel" aria-label="Theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
        {THEMES.map((th) => (
          <option key={th.value} value={th.value}>
            {th.label}
          </option>
        ))}
      </select>
      <select className="lang-sel" aria-label="Language" defaultValue="en" onChange={(e) => setLang(e.target.value)}>
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.native}
          </option>
        ))}
      </select>
    </>
  );

  return (
    <nav className="nav">
      <Link href="/" className="logo">
        <span className="logo-mark">✦</span> ANCESTRALK
      </Link>

      {/* Desktop */}
      <div className="nav-r nav-desktop">
        {selectors}
        {links}
      </div>

      {/* Mobile hamburger */}
      <button className="nav-burger" aria-label={t('menu')} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <i className={`ti ${open ? 'ti-x' : 'ti-menu-2'}`} />
      </button>

      {open && (
        <div className="nav-mobile">
          <div className="nav-mobile-row">{selectors}</div>
          <div className="nav-mobile-links">{links}</div>
        </div>
      )}
    </nav>
  );
}
