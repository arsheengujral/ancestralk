'use client';

import { CONSISTENCY, HEAT_COLORS } from '../data';
import { Screen } from '../shell';
import { CompareSlider } from '../ui';

const HOME_BG = 'linear-gradient(168deg,#F4EEF7 0%,#F8F3EB 48%,#F2ECE1 100%)';
const rise = (d: number): React.CSSProperties => ({
  animation: `attRise .7s ${d}s cubic-bezier(.2,.7,.2,1) both`,
});

export function You({
  streak,
  onOpenJourney,
  onReplayCeremony,
}: {
  streak: number;
  onOpenJourney: () => void;
  onReplayCeremony: () => void;
}) {
  return (
    <Screen
      bg={HOME_BG}
      blobs={[
        {
          bottom: -40,
          right: -70,
          width: 250,
          height: 250,
          background: 'radial-gradient(circle,rgba(201,169,106,.3),rgba(201,169,106,0) 70%)',
          filter: 'blur(30px)',
          animation: 'attFloat2 11s ease-in-out infinite',
        },
      ]}
      gap={12}
    >
      <div style={rise(0.05)}>
        <div className="att-eyebrow">Your journey · Week 6</div>
        <div className="att-serif" style={{ fontSize: 30, fontWeight: 500, marginTop: 2 }}>
          Your skin, getting stronger
        </div>
      </div>

      {/* Drag-to-compare */}
      <div className="att-card" style={{ ...rise(0.14), borderRadius: 24, boxShadow: '0 10px 30px rgba(90,75,110,.09)', padding: 13 }}>
        <CompareSlider />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, padding: '0 2px' }}>
          <div style={{ fontSize: 12, color: 'var(--att-ink-soft)' }}>Drag to compare</div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#55898D', background: 'rgba(85,137,141,.1)', padding: '4px 11px', borderRadius: 999 }}>
            +9 skin score
          </div>
        </div>
      </div>

      {/* Score chart + consistency heat strip */}
      <div className="att-card" style={{ ...rise(0.24), borderRadius: 22, padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#40394A' }}>Skin score</div>
          <div style={{ fontSize: 10.5, color: 'var(--att-muted)' }}>6 weeks</div>
        </div>
        <svg width="100%" height="60" viewBox="0 0 300 60" preserveAspectRatio="none" style={{ marginTop: 6 }}>
          <polyline
            points="6,48 55,43 104,45 153,33 202,28 251,21 294,13"
            fill="none"
            stroke="url(#attg3)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="294" cy="13" r="4.5" fill="#8A76B4" />
          <circle cx="294" cy="13" r="9" fill="none" stroke="#8A76B4" strokeOpacity="0.3" strokeWidth="2" style={{ animation: 'attPulse 2.4s ease-in-out infinite' }} />
          <defs>
            <linearGradient id="attg3" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#D9CCEC" />
              <stop offset="1" stopColor="#8A76B4" />
            </linearGradient>
          </defs>
        </svg>

        <div style={{ fontSize: 11, fontWeight: 600, color: '#40394A', marginTop: 10 }}>Ritual consistency</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(21,1fr)', gap: 3, marginTop: 7 }}>
          {CONSISTENCY.map((v, i) => (
            <div key={i} style={{ height: 9, borderRadius: 2.5, background: HEAT_COLORS[v] }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: '#B0A7BC', marginTop: 5 }}>
          <span>3 weeks ago</span>
          <span>this week</span>
        </div>
      </div>

      {/* Milestone reports */}
      <div style={{ ...rise(0.34), display: 'flex', flexDirection: 'column', gap: 9 }}>
        <button
          onClick={onReplayCeremony}
          style={{
            textAlign: 'left',
            cursor: 'pointer',
            font: 'inherit',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'linear-gradient(135deg,rgba(201,169,106,.14),rgba(233,207,164,.2))',
            border: '1px solid rgba(201,169,106,.3)',
            borderRadius: 20,
            padding: '11px 14px',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              flex: 'none',
              background: 'linear-gradient(140deg,#E9CFA4,#C9A96A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 5px 14px rgba(201,169,106,.35)',
            }}
          >
            <div style={{ width: 13, height: 13, background: '#54430F', transform: 'rotate(45deg)', borderRadius: 3 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#40394A' }}>Day 30 · your transformation story</div>
            <div style={{ fontSize: 11, color: 'var(--att-ink-soft)' }}>Generated Jul 2 — a chapter written from your photos</div>
          </div>
          <div style={{ fontSize: 12, color: '#A8863F' }}>›</div>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.85)', borderRadius: 20, padding: '11px 14px' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', flex: 'none', background: 'linear-gradient(140deg,#D9CCEC,#B9A8D9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2.5px solid #F6F1FA', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#40394A' }}>Day 90 · premium skin report</div>
            <div style={{ fontSize: 11, color: 'var(--att-ink-soft)' }}>48 days away — your consultation-grade review</div>
          </div>
          <div style={{ height: 4, width: 52, borderRadius: 99, background: '#EBE4F2', overflow: 'hidden', flex: 'none' }}>
            <div style={{ height: '100%', width: '47%', background: '#B9A8D9' }} />
          </div>
        </div>
      </div>

      {/* Journey entry */}
      <button
        onClick={onOpenJourney}
        style={{
          ...rise(0.42),
          textAlign: 'left',
          cursor: 'pointer',
          font: 'inherit',
          color: 'inherit',
          background: 'rgba(255,255,255,.72)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,.9)',
          borderRadius: 20,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#40394A' }}>30-Day Glow-Up · Day 18</div>
          <div style={{ fontSize: 10.5, color: 'var(--att-ink-soft)' }}>{streak}-day streak · see your path</div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#F6F1FA', background: 'linear-gradient(135deg,#A995CF,#8A76B4)', padding: '9px 16px', borderRadius: 999 }}>
          Open ›
        </span>
      </button>
    </Screen>
  );
}
