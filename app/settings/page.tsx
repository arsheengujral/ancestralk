'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function Toggle({ initial = true }: { initial?: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <button className={`toggle${on ? ' on' : ''}`} onClick={() => setOn((v) => !v)} aria-pressed={on} />
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [upgradeMsg, setUpgradeMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function upgrade() {
    setBusy(true);
    setUpgradeMsg('');
    try {
      let region = '';
      try {
        region = JSON.parse(sessionStorage.getItem('ank-flow') || '{}').region || '';
      } catch {
        /* ignore */
      }
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Stripe Checkout
      } else if (!data.configured) {
        setUpgradeMsg(
          `Payments aren't live in this environment yet. When configured, you'll pay ${data.price?.label ?? ''} via ${data.provider}.`,
        );
      } else {
        setUpgradeMsg('Order created — complete payment to upgrade.');
      }
    } catch {
      setUpgradeMsg('Could not start checkout right now.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fw">
      <button className="bb" style={{ marginBottom: 16 }} onClick={() => router.push('/archive')}>
        ← Archive
      </button>
      <div className="ftit serif">Settings</div>
      <div className="fsub">Your family&apos;s plan, languages, privacy, and data.</div>

      <div className="slbl">Subscription</div>
      <div className="tout">
        <div className="set-row">
          <div>
            <div style={{ fontWeight: 500 }}>Family Legacy Plan</div>
            <div style={{ fontSize: 11, color: 'var(--ink3)' }}>
              $60/year · renews 12 Jan 2027 · unlimited members
            </div>
          </div>
          <div className="dbadge">ACTIVE</div>
        </div>
        <div className="set-row">
          <div>Yearly album auto-generation</div>
          <Toggle />
        </div>
        <div className="set-row">
          <div>Smart birthday &amp; inactivity reminders</div>
          <Toggle />
        </div>
        <div className="set-row">
          <div>
            <div style={{ fontWeight: 500 }}>Upgrade / manage plan</div>
            <div style={{ fontSize: 11, color: 'var(--ink3)' }}>
              Stripe worldwide · Razorpay in India
            </div>
          </div>
          <button className="ibtn" style={{ fontSize: 11, padding: '6px 12px' }} onClick={upgrade} disabled={busy}>
            {busy ? '…' : 'Upgrade'}
          </button>
        </div>
      </div>
      {upgradeMsg && (
        <div className="enote" style={{ marginTop: -6, marginBottom: 8 }}>
          <i className="ti ti-info-circle" style={{ color: 'var(--g)' }} /> {upgradeMsg}
        </div>
      )}

      <div className="slbl">Legacy plan</div>
      <div className="tout">
        <div className="set-row">
          <div>
            <div style={{ fontWeight: 500 }}>Passing the torch</div>
            <div style={{ fontSize: 11, color: 'var(--ink3)' }}>
              Choose how this archive lives on across generations
            </div>
          </div>
          <button className="ibtn" style={{ fontSize: 11, padding: '6px 12px' }} onClick={() => router.push('/legacy')}>
            Set up
          </button>
        </div>
        <div className="set-row">
          <div>Continuity guarantee</div>
          <div style={{ fontSize: 11, color: 'var(--g3)' }}>This archive will outlive all of us</div>
        </div>
      </div>

      <div className="slbl">Languages</div>
      <div className="tout">
        <div className="set-row">
          <div>English · हिन्दी · العربية</div>
          <div style={{ fontSize: 11, color: 'var(--g3)' }}>Active</div>
        </div>
        <div className="set-row">
          <div>Punjabi, Tamil, Gujarati, Telugu, Bengali</div>
          <div style={{ fontSize: 11, color: 'var(--ink4)' }}>Coming soon</div>
        </div>
      </div>

      <div className="slbl">Help</div>
      <div className="tout">
        <div className="set-row">
          <div>
            <div style={{ fontWeight: 500 }}>Take the guided tour</div>
            <div style={{ fontSize: 11, color: 'var(--ink3)' }}>A walk through everything Ancestralk can do</div>
          </div>
          <button className="ibtn" style={{ fontSize: 11, padding: '6px 12px' }} onClick={() => router.push('/archive?tour=1')}>
            Replay
          </button>
        </div>
        <div className="set-row">
          <div>How it works — tutorial library</div>
          <button className="bb" style={{ fontSize: 11, padding: '6px 12px' }} onClick={() => router.push('/learn')}>
            Open
          </button>
        </div>
      </div>

      <div className="slbl">Privacy &amp; data</div>
      <div className="tout">
        <div className="set-row">
          <div>Members control their own chapters</div>
          <div style={{ fontSize: 11, color: 'var(--g3)' }}>Always on</div>
        </div>
        <div className="set-row">
          <div>Export full archive (photos, voices, stories)</div>
          <button className="ibtn" style={{ fontSize: 11, padding: '6px 12px' }}>
            Export
          </button>
        </div>
        <div className="set-row">
          <div>Permanent preservation guarantee</div>
          <div style={{ fontSize: 11, color: 'var(--ink4)' }}>Add-on · coming</div>
        </div>
      </div>
    </div>
  );
}
