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
