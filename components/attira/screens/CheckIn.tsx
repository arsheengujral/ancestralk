'use client';

import { useEffect, useState } from 'react';
import { INDICATORS, CHECKIN_DISCLOSURE } from '../data';
import { Screen } from '../shell';
import { MiniRing } from '../ui';

const CHECKIN_BG = 'linear-gradient(170deg,#F4EEF7 0%,#F8F3EB 55%,#F1EAE0 100%)';
const RESULTS_BG = 'linear-gradient(168deg,#F1EBF6 0%,#F8F3EB 55%,#F2ECE1 100%)';

const rise = (d: number): React.CSSProperties => ({
  animation: `attRise .7s ${d}s cubic-bezier(.2,.7,.2,1) both`,
});

/* ── The Check-in tab: a calm landing that invites the ritual ────────────── */
export function CheckIn({ onBegin }: { onBegin: () => void }) {
  return (
    <Screen
      bg={CHECKIN_BG}
      blobs={[
        {
          top: '20%',
          left: -70,
          width: 260,
          height: 260,
          background: 'radial-gradient(circle,rgba(196,178,226,.45),rgba(196,178,226,0) 70%)',
          filter: 'blur(30px)',
          animation: 'attFloat 8s ease-in-out infinite',
        },
      ]}
      pad="86px 26px 110px"
      gap={22}
      style={{ justifyContent: 'center' }}
    >
      <div style={{ ...rise(0.05), textAlign: 'center' }}>
        <div className="att-eyebrow">Your skin check-in</div>
        <div className="att-serif" style={{ fontSize: 30, fontWeight: 500, marginTop: 6, lineHeight: 1.2 }}>
          A quiet minute with your skin
        </div>
        <div style={{ fontSize: 13, color: 'var(--att-ink-soft)', lineHeight: 1.65, marginTop: 10 }}>
          Four gentle questions, an optional photo. We&rsquo;ll pair how your skin feels today with six
          weeks of your history — strengths first, always.
        </div>
      </div>

      <div
        className="att-card"
        style={{ ...rise(0.15), borderRadius: 22, padding: '16px 18px', textAlign: 'left' }}
      >
        <div style={{ fontSize: 9.5, letterSpacing: 1.6, textTransform: 'uppercase', color: '#55898D', fontWeight: 700 }}>
          Last time
        </div>
        <div style={{ fontSize: 12.5, color: '#4C5B5C', lineHeight: 1.55, marginTop: 6 }}>
          Your barrier felt calm for the 8th day running. Let&rsquo;s see where week 6 takes it.
        </div>
      </div>

      <button
        onClick={onBegin}
        className="att-cta"
        style={{ ...rise(0.22), alignSelf: 'center', padding: '13px 30px', fontSize: 13.5 }}
      >
        Begin your check-in ›
      </button>

      <div
        className="att-serif"
        style={{ ...rise(0.28), fontStyle: 'italic', fontSize: 13.5, color: 'var(--att-muted)', textAlign: 'center' }}
      >
        A reflection of your answers and habits — never a diagnosis.
      </div>
    </Screen>
  );
}

/* ── The flow: processing (1c) → results (1d) ────────────────────────────── */
export function CheckInFlow({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'processing' | 'results'>('processing');

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setPhase('results'), reduce ? 700 : 2800);
    return () => clearTimeout(t);
  }, []);

  if (phase === 'processing') return <Processing />;
  return <Results onDone={onDone} />;
}

function Processing() {
  return (
    <Screen bg={CHECKIN_BG} pad="70px 34px 60px" gap={26} style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 190, height: 190 }}>
        <div
          style={{
            position: 'absolute',
            inset: -14,
            borderRadius: '50%',
            background:
              'conic-gradient(from 90deg,rgba(185,168,217,0),rgba(185,168,217,.5),rgba(201,169,106,.35),rgba(185,168,217,0))',
            animation: 'attPulse 3s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2.5px solid rgba(255,255,255,.95)',
            boxShadow: '0 16px 40px rgba(90,75,110,.2)',
            background: 'radial-gradient(circle at 40% 35%, #F2E3D8, #E4C9C1 60%, #D6BCC6)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              letterSpacing: 1,
              color: 'rgba(92,81,104,.55)',
            }}
          >
            today&rsquo;s photo
          </div>
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '34%',
              left: '-30%',
              background: 'linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.55),rgba(255,255,255,0))',
              animation: 'attSweep 2.8s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
        <div className="att-serif" style={{ fontSize: 27, fontWeight: 500, lineHeight: 1.25 }}>
          Reading today&rsquo;s check-in
        </div>
        <div style={{ fontSize: 13, color: 'var(--att-ink-soft)', lineHeight: 1.6, maxWidth: 270 }}>
          Pairing how your skin feels today with six weeks of your history.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, width: '100%', maxWidth: 280 }}>
        <ProcRow done>Your 4 answers, noted</ProcRow>
        <ProcRow done>Compared with 42 past check-ins</ProcRow>
        <ProcRow>Writing your skin story…</ProcRow>
      </div>

      <div className="att-serif" style={{ fontStyle: 'italic', fontSize: 14, color: 'var(--att-muted)' }}>
        A reflection of your answers and habits — never a diagnosis.
      </div>
    </Screen>
  );
}

function ProcRow({ done, children }: { done?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: done ? '#5C5168' : 'var(--att-muted)' }}>
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          color: '#fff',
          background: done ? '#55898D' : 'transparent',
          border: done ? 'none' : '1.5px solid #B9A8D9',
          boxSizing: 'border-box',
          animation: done ? undefined : 'attPulse 1.8s ease-in-out infinite',
        }}
      >
        {done ? '✓' : ''}
      </div>
      {children}
    </div>
  );
}

function Results({ onDone }: { onDone: () => void }) {
  return (
    <Screen
      bg={RESULTS_BG}
      blobs={[
        {
          top: 40,
          left: -70,
          width: 240,
          height: 240,
          background: 'radial-gradient(circle,rgba(196,178,226,.5),rgba(196,178,226,0) 70%)',
          filter: 'blur(30px)',
          animation: 'attFloat 10s ease-in-out infinite',
        },
      ]}
      pad="68px 18px 30px"
      gap={13}
    >
      <div style={{ ...rise(0.05), textAlign: 'center' }}>
        <div className="att-eyebrow">Your skin check-in</div>
        <div className="att-serif" style={{ fontSize: 28, fontWeight: 500, marginTop: 2 }}>
          This morning, 9:41
        </div>
        <div className="att-serif" style={{ fontSize: 18, fontStyle: 'italic', color: '#5C5168', marginTop: 6 }}>
          Your skin is getting stronger — hydration is the next chapter
        </div>
      </div>

      {/* What's thriving — always first */}
      <div style={{ ...rise(0.15), background: 'rgba(85,137,141,.09)', border: '1px solid rgba(85,137,141,.16)', borderRadius: 20, padding: '13px 16px' }}>
        <div style={{ fontSize: 9.5, letterSpacing: 1.6, textTransform: 'uppercase', color: '#55898D', fontWeight: 700 }}>
          What&rsquo;s thriving
        </div>
        <div style={{ fontSize: 12.5, color: '#4C5B5C', lineHeight: 1.55, marginTop: 6 }}>
          Your barrier feels calm for the 9th day running, and texture is the smoothest you&rsquo;ve logged in 6 weeks.
        </div>
      </div>

      {/* 6 indicators */}
      <div style={{ ...rise(0.25), display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {INDICATORS.map((ind, i) => (
          <div
            key={ind.key}
            style={{
              background: 'rgba(255,255,255,.68)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,.9)',
              borderRadius: 20,
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <MiniRing value={ind.value} color={ind.color} delay={0.5 + i * 0.1} />
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--att-ink-soft)', textAlign: 'center' }}>
              {ind.label}
            </div>
          </div>
        ))}
      </div>

      {/* Where we're heading */}
      <div style={{ ...rise(0.4), background: 'rgba(201,169,106,.1)', border: '1px solid rgba(201,169,106,.22)', borderRadius: 20, padding: '13px 16px' }}>
        <div style={{ fontSize: 9.5, letterSpacing: 1.6, textTransform: 'uppercase', color: '#A8863F', fontWeight: 700 }}>
          Where we&rsquo;re heading
        </div>
        <div style={{ fontSize: 12.5, color: '#6B5D44', lineHeight: 1.55, marginTop: 6 }}>
          You told us your skin feels tight by evening — let&rsquo;s build afternoon hydration into the plan. A midday
          mist joins tomorrow&rsquo;s rhythm.
        </div>
      </div>

      <div style={{ ...rise(0.48), fontSize: 11, color: 'var(--att-muted)', textAlign: 'center', lineHeight: 1.5 }}>
        {CHECKIN_DISCLOSURE}
      </div>

      <button onClick={onDone} className="att-cta" style={{ alignSelf: 'center', padding: '11px 26px', fontSize: 12.5 }}>
        See what changed since last week ›
      </button>
    </Screen>
  );
}
