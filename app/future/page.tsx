'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VoiceRecorder from '@/components/VoiceRecorder';
import { getFamilyContext } from '@/lib/familyStore';

const WHEN_OPTIONS = [
  'Their 18th birthday',
  'Their wedding day',
  'When they have their first child',
  'After I am gone',
  'A specific date',
  'A moment of grief or hardship',
];

const DEMO_MSG =
  'My darling — I do not know who you will be when you read this. But I know you come from people who loved deeply, worked hard, and asked for very little. I am already proud of you.';

/**
 * Future messages — sealed letters across time. The dark seal preview animates
 * its lock as the form completes, then a seal ceremony on save. Ported from the
 * prototype. (The actual encryption/sealing happens server-side via the
 * future-messages/seal route; once sealed there is no read path until unlock.)
 */
export default function FuturePage() {
  const router = useRouter();
  const [to, setTo] = useState('');
  const [when, setWhen] = useState('');
  const [msg, setMsg] = useState('');
  const [sealed, setSealed] = useState(false);

  const ready = Boolean(to.trim() && when && msg.trim().length > 10);

  function doSeal() {
    if (!to.trim() || !when) {
      alert('Please add who this is for and when it opens.');
      return;
    }
    setSealed(true);
    // Encrypt + persist server-side. The plaintext is sealed before it touches
    // the database; there is no path to read it back before its unlock day.
    // Ensure the account is provisioned first (so the message has a family).
    (async () => {
      try {
        await getFamilyContext();
      } catch {
        /* not signed in — seal route will no-op safely */
      }
      await fetch('/api/future-messages/seal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientDescription: to, unlockCondition: when, messageText: msg }),
      }).catch(() => {});
    })();
    setTimeout(() => router.push('/archive'), 1600);
  }

  return (
    <div className="fw">
      <button className="bb" style={{ marginBottom: 16 }} onClick={() => router.push('/archive')}>
        ← Archive
      </button>
      <div className="fey">LETTERS ACROSS TIME</div>
      <div className="ftit serif">
        Write to someone
        <br />
        you may never meet
      </div>
      <div className="fsub">
        A letter, voice note, or video — sealed until a day you choose. A grandchild&apos;s 18th
        birthday. A wedding. A moment of grief.
      </div>

      <div className="seal-p">
        <div className={`seal-i${ready || sealed ? ' on' : ''}`}>
          <i className={`ti ${ready || sealed ? 'ti-lock' : 'ti-mail'}`} />
        </div>
        <div className="seal-m serif">
          {sealed
            ? 'Sealed forever ✦'
            : ready
              ? 'Ready to seal'
              : to
                ? `To: ${to}`
                : 'Your message is being written'}
        </div>
        <div className="seal-d">
          {sealed
            ? 'Delivery is automatic on the day'
            : ready
              ? `To: ${to} · Opens: ${when}`
              : when
                ? `Opens: ${when}`
                : 'Fill in below'}
        </div>
      </div>

      <div className="field">
        <label className="fl">Who is this for?</label>
        <input
          className="fi2"
          placeholder="My granddaughter, my son's future child…"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
      <div className="field">
        <label className="fl">When should it open?</label>
        <select className="fi2" style={{ cursor: 'pointer' }} value={when} onChange={(e) => setWhen(e.target.value)}>
          <option value="">Choose a moment…</option>
          {WHEN_OPTIONS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="fl">Your message</label>
        <VoiceRecorder
          id="fm-msg"
          label="Speak your message"
          demoText={DEMO_MSG}
          onTranscript={(txt) => setMsg(txt)}
        />
        <textarea
          className="fta"
          rows={6}
          placeholder="Write freely. Only they will read this — on the day it opens."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
      </div>
      <div className="ibox">
        <i className="ti ti-lock" /> Sealed the moment you save. Only the recipient can open it, only
        on the chosen day. Delivery is automatic — WhatsApp or email on the date, even decades away.
        Even you cannot read it after sealing.
      </div>
      <button className="bp" onClick={doSeal}>
        Seal this message ✦
      </button>
    </div>
  );
}
