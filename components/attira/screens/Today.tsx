'use client';

import type { TabId } from '../data';
import { DEMO, WEEK_STRIP } from '../data';
import { Screen } from '../shell';
import { Ring } from '../ui';

const HOME_BG = 'linear-gradient(168deg,#F4EEF7 0%,#F8F3EB 48%,#F2ECE1 100%)';
const BLOBS: React.CSSProperties[] = [
  {
    top: -60,
    right: -70,
    width: 260,
    height: 260,
    background: 'radial-gradient(circle,rgba(196,178,226,.5),rgba(196,178,226,0) 70%)',
    filter: 'blur(30px)',
    animation: 'attFloat 9s ease-in-out infinite',
  },
  {
    bottom: 60,
    left: -80,
    width: 240,
    height: 240,
    background: 'radial-gradient(circle,rgba(231,198,192,.45),rgba(231,198,192,0) 70%)',
    filter: 'blur(30px)',
    animation: 'attFloat2 11s ease-in-out infinite',
  },
];

const rise = (d: number): React.CSSProperties => ({
  animation: `attRise .7s ${d}s cubic-bezier(.2,.7,.2,1) both`,
});

export function Today({
  streak,
  nightDone,
  onBeginNight,
  onGo,
}: {
  streak: number;
  nightDone: boolean;
  onBeginNight: () => void;
  onGo: (t: TabId) => void;
}) {
  return (
    <Screen bg={HOME_BG} blobs={BLOBS} gap={11}>
      {/* Header */}
      <div style={{ ...rise(0.05), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="att-eyebrow">Week 6 of your glow journey</div>
          <div className="att-serif" style={{ fontSize: 29, fontWeight: 500, lineHeight: 1.1, marginTop: 2 }}>
            Good morning, {DEMO.name}
          </div>
        </div>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'linear-gradient(140deg,#D9CCEC,#E7C6C0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-cormorant)',
            fontSize: 19,
            color: '#5C5168',
            border: '1.5px solid rgba(255,255,255,.9)',
            boxShadow: '0 4px 12px rgba(90,75,110,.15)',
          }}
        >
          M
        </div>
      </div>

      {/* Skin score card */}
      <div
        className="att-card"
        style={{
          ...rise(0.13),
          borderRadius: 26,
          boxShadow: '0 12px 34px rgba(90,75,110,.1)',
          padding: '15px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Ring
          value={DEMO.score}
          size={128}
          gradient={[
            { offset: 0, color: '#B9A8D9' },
            { offset: 0.6, color: '#C9A96A' },
            { offset: 1, color: '#E0B7AF' },
          ]}
        >
          <div className="att-serif" style={{ fontSize: 46, fontWeight: 500, lineHeight: 1, color: '#40394A' }}>
            {DEMO.score}
          </div>
          <div
            style={{
              fontSize: 9.5,
              letterSpacing: 1.8,
              textTransform: 'uppercase',
              color: 'var(--att-muted)',
              fontWeight: 600,
              marginTop: 2,
            }}
          >
            Skin score
          </div>
        </Ring>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
          <div
            style={{
              alignSelf: 'flex-start',
              fontSize: 11,
              fontWeight: 600,
              color: '#55898D',
              background: 'rgba(85,137,141,.1)',
              border: '1px solid rgba(85,137,141,.18)',
              padding: '4px 10px',
              borderRadius: 999,
            }}
          >
            ▲ +{DEMO.scoreTrend} this week
          </div>
          <div className="att-serif" style={{ fontSize: 19, fontStyle: 'italic', color: '#5C5168', lineHeight: 1.25 }}>
            Calm, growing more hydrated
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#A8863F',
                background: 'rgba(201,169,106,.12)',
                border: '1px solid rgba(201,169,106,.25)',
                padding: '4px 10px',
                borderRadius: 999,
              }}
            >
              {streak}-day streak
            </span>
            <span style={{ fontSize: 10.5, color: 'var(--att-muted)' }}>1 freeze saved</span>
          </div>
        </div>
      </div>

      {/* Streak + week strip (from 2a) */}
      <div
        className="att-card"
        style={{ ...rise(0.19), borderRadius: 20, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 16 }}
      >
        <div
          style={{
            width: 66,
            height: 66,
            borderRadius: '50%',
            flex: 'none',
            background: 'radial-gradient(circle at 35% 30%,#F2E3C8,#C9A96A)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'attBreathe 3s ease-in-out infinite',
          }}
        >
          <div className="att-serif" style={{ fontSize: 28, fontWeight: 600, lineHeight: 1, color: '#54430F' }}>
            {streak}
          </div>
          <div style={{ fontSize: 7, letterSpacing: 1.2, textTransform: 'uppercase', color: '#7A6230', fontWeight: 700 }}>
            day streak
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#40394A' }}>One ritual from day {streak + 1}</div>
            <div style={{ fontSize: 10, color: 'var(--att-muted)' }}>freeze ×1</div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 9, alignItems: 'center' }}>
            {WEEK_STRIP.map((w, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div
                  style={{
                    width: 17,
                    height: 17,
                    borderRadius: '50%',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    color: '#fff',
                    background: w.state === 'done' ? '#C9A96A' : w.state === 'today' ? '#EBE0F2' : 'transparent',
                    border:
                      w.state === 'today'
                        ? '1.5px solid #C9A96A'
                        : w.state === 'upcoming'
                          ? '1.5px solid #E4DCEE'
                          : 'none',
                    animation: w.state === 'today' ? 'attPulse 1.8s ease-in-out infinite' : undefined,
                  }}
                >
                  {w.state === 'done' ? '✓' : ''}
                </div>
                <div
                  style={{
                    fontSize: 8.5,
                    color: w.state === 'today' ? '#8A713F' : '#B0A7BC',
                    fontWeight: w.state === 'today' ? 700 : 400,
                  }}
                >
                  {w.d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* XP bar (from 2a) */}
      <div
        style={{
          ...rise(0.24),
          background: 'rgba(255,255,255,.62)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,.85)',
          borderRadius: 20,
          padding: '11px 15px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#40394A', letterSpacing: 0.3 }}>
            Skin XP · Level {DEMO.level}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--att-lav)', fontWeight: 600 }}>{DEMO.xpToNext} XP to Level {DEMO.level + 1}</div>
        </div>
        <div style={{ position: 'relative', height: 8, borderRadius: 99, background: '#EBE4F2', overflow: 'hidden', marginTop: 7 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: `${DEMO.xpPct}%`,
              borderRadius: 99,
              background: 'linear-gradient(90deg,#B9A8D9,#8A76B4)',
              animation: 'attBar 1.2s .4s cubic-bezier(.25,.7,.25,1) both',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: '40%',
                left: '-30%',
                background: 'linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.5),rgba(255,255,255,0))',
                animation: 'attSweep 2.6s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </div>

      {/* Tonight's ritual — glows subtly (or completed) */}
      {nightDone ? (
        <CompletedRow am={false} title="Night ritual — complete" sub="5 steps · day ring closed" delay={0.3} />
      ) : (
        <button
          onClick={onBeginNight}
          style={{
            ...rise(0.3),
            textAlign: 'left',
            cursor: 'pointer',
            font: 'inherit',
            color: 'inherit',
            background: 'rgba(255,255,255,.78)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(169,149,207,.5)',
            borderRadius: 22,
            padding: '13px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            animationName: 'attRise, attGlow',
            animationDuration: '.7s, 3.6s',
            animationTimingFunction: 'cubic-bezier(.2,.7,.2,1), ease-in-out',
            animationDelay: '.3s, 0s',
            animationIterationCount: '1, infinite',
            animationFillMode: 'both, none',
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              flex: 'none',
              background: 'linear-gradient(140deg,#CFC2E6,#A995CF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-cormorant)',
              fontSize: 15,
              fontWeight: 600,
              color: '#F6F1FA',
              letterSpacing: 1,
            }}
          >
            PM
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#40394A' }}>Tonight&rsquo;s ritual</div>
            <div style={{ fontSize: 11.5, color: 'var(--att-ink-soft)', marginTop: 1 }}>
              5 steps · 11 min · your skin is ready to step retinol up to 2×/week
            </div>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#F6F1FA',
              background: 'linear-gradient(135deg,#A995CF,#8A76B4)',
              padding: '8px 14px',
              borderRadius: 999,
            }}
          >
            Begin ›
          </span>
        </button>
      )}

      {/* Morning ritual — complete */}
      <CompletedRow am title="Morning ritual — complete" sub="4 steps · finished 8:12" delay={0.36} />

      {/* Climate + progress teaser */}
      <div style={{ ...rise(0.42), display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 10 }}>
        <div
          style={{
            background: 'rgba(255,255,255,.62)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,.85)',
            borderRadius: 20,
            padding: '12px 13px',
          }}
        >
          <div style={{ fontSize: 9.5, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--att-muted)', fontWeight: 600 }}>
            {DEMO.city} today
          </div>
          <div className="att-serif" style={{ fontSize: 19, color: '#40394A', margin: '3px 0 2px' }}>
            UV 6 · Dry air
          </div>
          <div style={{ fontSize: 11, color: 'var(--att-ink-soft)', lineHeight: 1.45 }}>
            Low humidity — a hydrating mist will carry you to evening.
          </div>
        </div>
        <button
          onClick={() => onGo('you')}
          style={{
            textAlign: 'left',
            cursor: 'pointer',
            font: 'inherit',
            color: 'inherit',
            background: 'rgba(255,255,255,.62)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,.85)',
            borderRadius: 20,
            padding: '12px 13px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontSize: 9.5, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--att-muted)', fontWeight: 600 }}>
            Your progress
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <div style={{ flex: 1, height: 44, borderRadius: 10, background: 'repeating-linear-gradient(45deg,#EDE7F0,#EDE7F0 5px,#E3DBE8 5px,#E3DBE8 10px)' }} />
            <div style={{ flex: 1, height: 44, borderRadius: 10, background: 'repeating-linear-gradient(45deg,#EAE2D6,#EAE2D6 5px,#E0D5C4 5px,#E0D5C4 10px)' }} />
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--att-lav)', marginTop: 7 }}>6 weeks compared ›</div>
        </button>
      </div>

      {/* Ingredient of the day */}
      <button
        onClick={() => onGo('learn')}
        style={{
          ...rise(0.48),
          textAlign: 'left',
          cursor: 'pointer',
          font: 'inherit',
          color: 'inherit',
          background: 'linear-gradient(135deg,rgba(85,137,141,.1),rgba(185,168,217,.12))',
          border: '1px solid rgba(85,137,141,.16)',
          borderRadius: 22,
          padding: '13px 16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 9.5, letterSpacing: 1.8, textTransform: 'uppercase', color: '#55898D', fontWeight: 700 }}>
            Ingredient of the day
          </div>
          <div style={{ fontSize: 10, color: 'var(--att-muted)' }}>20-sec read</div>
        </div>
        <div className="att-serif" style={{ fontSize: 19, color: '#40394A', marginTop: 4 }}>
          Squalane — your skin&rsquo;s mirror
        </div>
        <div style={{ fontSize: 11.5, color: '#6E6579', lineHeight: 1.5, marginTop: 2 }}>
          A weightless echo of the oils your skin already makes.
        </div>
        <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--att-lav)', marginTop: 7 }}>
          Tomorrow: Bakuchiol, the gentle retinol alternative
        </div>
      </button>

      {/* Memory-driven insight (a rendered pattern, only when real) */}
      <div
        style={{
          ...rise(0.54),
          background: 'linear-gradient(135deg,rgba(85,137,141,.12),rgba(185,168,217,.12))',
          border: '1px solid rgba(85,137,141,.2)',
          borderRadius: 20,
          padding: '12px 15px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: 1, color: '#F6F1FA', background: '#55898D', padding: '3px 8px', borderRadius: 999, flex: 'none' }}>
          NEW
        </span>
        <div style={{ fontSize: 12, color: '#4C5B5C', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700, color: '#2E5558' }}>Your skin&rsquo;s been calmer every week this month.</span> See what&rsquo;s driving it ›
        </div>
      </div>
    </Screen>
  );
}

function CompletedRow({ am, title, sub, delay }: { am: boolean; title: string; sub: string; delay: number }) {
  return (
    <div
      style={{
        ...rise(delay),
        background: 'rgba(255,255,255,.62)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,.85)',
        borderRadius: 22,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          flex: 'none',
          background: am ? 'linear-gradient(140deg,#F2E3C8,#E9CFA4)' : 'linear-gradient(140deg,#CFC2E6,#A995CF)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-cormorant)',
          fontSize: 13,
          fontWeight: 600,
          color: am ? '#8A713F' : '#F6F1FA',
          letterSpacing: 1,
        }}
      >
        {am ? 'AM' : 'PM'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#40394A' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--att-ink-soft)' }}>{sub}</div>
      </div>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#55898D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
        ✓
      </div>
    </div>
  );
}
