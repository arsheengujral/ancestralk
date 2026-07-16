'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

/**
 * Warm account flow (Phase 3 must-have #4). Visitors can explore the product
 * without an account; here they create one — by email link or Google — when they
 * begin, so their private family data is saved and protected. Never a cold
 * signup wall: "Begin your family's legacy."
 *
 * In degraded mode (no Supabase) it explains that accounts activate once
 * configured and offers a "look around first" path, so the app stays demoable.
 */
function AuthContent() {
  const t = useTranslations('auth');
  const params = useSearchParams();
  const next = params.get('next') || '/archive';

  const supabase = createClient();
  const configured = Boolean(supabase);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : undefined;

  // Primary path: email + password (no email link needed to get started).
  async function submitPassword() {
    if (!supabase || !email.trim() || password.length < 6) {
      setError('Enter your email and a password of at least 6 characters.');
      return;
    }
    setBusy(true);
    setError('');
    if (mode === 'signup') {
      // Create an already-confirmed account server-side, then sign in — no
      // confirmation email needed.
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBusy(false);
        if (data.code === 'exists') setMode('signin');
        setError(data.error ?? 'Could not create your account.');
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setBusy(false);
      if (error) setError(error.message);
      else window.location.href = next;
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setBusy(false);
      if (error) setError(error.message);
      else window.location.href = next;
    }
  }

  // Secondary: passwordless magic link.
  async function emailLink() {
    if (!supabase || !email.trim()) return;
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  async function google() {
    if (!supabase) return;
    setBusy(true);
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
  }

  return (
    <div className="fw" style={{ maxWidth: 440, paddingTop: 50 }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 26, color: 'var(--g)' }}>✦</div>
      </div>
      <div className="ftit serif" style={{ textAlign: 'center' }}>
        {t('title')}
      </div>
      <div className="fsub" style={{ textAlign: 'center' }}>
        {t('subtitle')}
      </div>

      {sent ? (
        <div className="swrap" style={{ padding: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 28, color: 'var(--g)' }}>
            <i className="ti ti-mail-check" />
          </div>
          <div className="serif" style={{ fontSize: 22, margin: '8px 0' }}>
            {t('checkEmail')}
          </div>
          <div className="fsub">{email}</div>
        </div>
      ) : (
        <>
          {configured && (
            <button className="bp" style={{ marginBottom: 12 }} onClick={google} disabled={busy}>
              <i className="ti ti-brand-google" /> {t('google')}
            </button>
          )}

          {configured && (
            <div style={{ textAlign: 'center', color: 'var(--ink4)', fontSize: 12, margin: '10px 0' }}>
              — {t('or')} —
            </div>
          )}

          <div className="field">
            <label className="fl">{t('email')}</label>
            <input
              className="fi2"
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!configured}
            />
          </div>
          <div className="field">
            <label className="fl">Password</label>
            <input
              className="fi2"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitPassword()}
              disabled={!configured}
            />
          </div>
          <button className="bp" onClick={submitPassword} disabled={busy || !configured}>
            {busy ? '…' : mode === 'signup' ? 'Create my account ✦' : 'Sign in'}
          </button>

          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink3)', marginTop: 12 }}>
            {mode === 'signup' ? 'Already have an account?' : 'New here?'}{' '}
            <button
              onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--g3)', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}
            >
              {mode === 'signup' ? 'Sign in' : 'Create an account'}
            </button>
          </div>

          {configured && (
            <div style={{ textAlign: 'center', color: 'var(--ink4)', fontSize: 12, margin: '14px 0 8px' }}>
              — {t('or')} —
            </div>
          )}
          {configured && (
            <button className="bb" style={{ width: '100%' }} onClick={emailLink} disabled={busy || !email.trim()}>
              <i className="ti ti-mail" /> Email me a sign-in link instead
            </button>
          )}

          {!configured && (
            <div className="ibox" style={{ marginTop: 16 }}>
              <i className="ti ti-info-circle" /> Accounts activate once Supabase keys are configured.
              For now, you can explore the whole product.
            </div>
          )}

          {error && (
            <div className="enote" style={{ color: 'var(--g3)', marginTop: 10 }}>
              <i className="ti ti-alert-triangle" /> {error}
            </div>
          )}

          <Link
            href="/begin"
            className="bb"
            style={{ display: 'block', textAlign: 'center', marginTop: 14, textDecoration: 'none' }}
          >
            {t('preview')} →
          </Link>
        </>
      )}

      <div className="ibox" style={{ marginTop: 18 }}>
        <i className="ti ti-shield-lock" /> {t('guarantee')}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="fw">…</div>}>
      <AuthContent />
    </Suspense>
  );
}
