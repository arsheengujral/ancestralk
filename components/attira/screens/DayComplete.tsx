'use client';

import { Ring } from '../ui';

/* The day-complete payoff — full-bleed dark ceremony, reserved for milestones
 * (screen 2b). The highest-production moment in the module. */
const CONFETTI = [
  { left: '12%', w: 7, h: 11, r: 2, bg: '#E9CFA4', dur: 3.4, delay: 0.2 },
  { left: '28%', w: 6, h: 9, r: 2, bg: '#B9A8D9', dur: 4, delay: 1.1 },
  { left: '46%', w: 8, h: 8, r: 50, bg: '#E0B7AF', dur: 3.7, delay: 0.6 },
  { left: '64%', w: 6, h: 10, r: 2, bg: '#7FA8AB', dur: 4.3, delay: 1.7 },
  { left: '80%', w: 7, h: 7, r: 50, bg: '#E9CFA4', dur: 3.9, delay: 0.9 },
  { left: '90%', w: 6, h: 10, r: 2, bg: '#CBBFD9', dur: 4.5, delay: 2.3 },
];

export function DayComplete({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: 'linear-gradient(170deg,#373243 0%,#48405A 55%,#544860 100%)',
        color: '#EFEAF4',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 340,
          height: 340,
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(201,169,106,.28),rgba(201,169,106,0) 70%)',
          filter: 'blur(24px)',
          animation: 'attPulse 4s ease-in-out infinite',
        }}
      />
      {CONFETTI.map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 60,
            left: c.left,
            width: c.w,
            height: c.h,
            borderRadius: c.r,
            background: c.bg,
            animation: `attFall ${c.dur}s ${c.delay}s ease-in infinite`,
          }}
        />
      ))}

      <div
        className="att-canvas"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          gap: 14,
          padding: '70px 30px 44px',
          textAlign: 'center',
        }}
      >
        <div style={{ animation: 'attPop .9s .2s cubic-bezier(.2,.9,.3,1.2) both' }}>
          <Ring
            value={100}
            size={196}
            stroke={10}
            track="rgba(255,255,255,.12)"
            gradient={[
              { offset: 0, color: '#E9CFA4' },
              { offset: 1, color: '#C9A96A' },
            ]}
            delay={0.5}
            duration={1.8}
          >
            <div className="att-serif" style={{ fontSize: 56, fontWeight: 500, lineHeight: 1, color: '#F2E3C8' }}>
              14
            </div>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#CBBFD9', fontWeight: 600, marginTop: 4 }}>
              days complete
            </div>
          </Ring>
        </div>

        <div style={{ animation: 'attRise .8s .9s cubic-bezier(.2,.7,.2,1) both' }}>
          <div className="att-serif" style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.2 }}>
            Two full weeks
          </div>
          <div style={{ fontSize: 13, color: '#CBBFD9', lineHeight: 1.6, marginTop: 8, maxWidth: 270 }}>
            Every morning. Every night. Your skin has never been this consistent — and it shows.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 9, animation: 'attRise .8s 1.2s cubic-bezier(.2,.7,.2,1) both' }}>
          <RewardChip value="+60" label="Skin XP" />
          <RewardChip value="◆" label="Fortnight badge" />
          <RewardChip value="+1" label="Streak freeze" />
        </div>

        <div style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 18, padding: '12px 18px', animation: 'attRise .8s 1.45s cubic-bezier(.2,.7,.2,1) both' }}>
          <div style={{ fontSize: 11.5, color: '#B4A8C4' }}>
            Tomorrow morning: <span style={{ color: '#E9CFA4', fontWeight: 600 }}>your new skin score</span> + the Bakuchiol card unlocks
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280, animation: 'attRise .8s 1.6s cubic-bezier(.2,.7,.2,1) both' }}>
          <button
            onClick={onClose}
            style={{
              height: 48,
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              font: 'inherit',
              background: 'linear-gradient(135deg,#E9CFA4,#C9A96A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: '#54430F',
              boxShadow: '0 10px 26px rgba(201,169,106,.35)',
            }}
          >
            Good night ✓
          </button>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 11.5, color: '#9C90AC' }}
          >
            Save this moment to your journey
          </button>
        </div>
      </div>
    </div>
  );
}

function RewardChip({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,.09)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 16, padding: '10px 15px' }}>
      <div className="att-serif" style={{ fontSize: 21, color: '#E9CFA4' }}>
        {value}
      </div>
      <div style={{ fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', color: '#B4A8C4', fontWeight: 600 }}>{label}</div>
    </div>
  );
}
