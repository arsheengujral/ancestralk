'use client';

import { MORNING_RITUAL, NIGHT_RITUAL, type Ritual } from '../data';
import { Screen } from '../shell';

const HOME_BG = 'linear-gradient(168deg,#F4EEF7 0%,#F8F3EB 48%,#F2ECE1 100%)';
const rise = (d: number): React.CSSProperties => ({
  animation: `attRise .7s ${d}s cubic-bezier(.2,.7,.2,1) both`,
});

export function Rituals({
  nightDone,
  onOpen,
}: {
  nightDone: boolean;
  onOpen: (which: 'am' | 'pm') => void;
}) {
  return (
    <Screen
      bg={HOME_BG}
      blobs={[
        {
          top: -60,
          right: -70,
          width: 260,
          height: 260,
          background: 'radial-gradient(circle,rgba(196,178,226,.45),rgba(196,178,226,0) 70%)',
          filter: 'blur(30px)',
          animation: 'attFloat 10s ease-in-out infinite',
        },
      ]}
      gap={13}
    >
      <div style={rise(0.05)}>
        <div className="att-eyebrow">Today&rsquo;s rituals</div>
        <div className="att-serif" style={{ fontSize: 30, fontWeight: 500, marginTop: 2 }}>
          Two moments, made yours
        </div>
      </div>

      <RitualCard
        ritual={MORNING_RITUAL}
        title="Morning ritual"
        tag="AM"
        tagBg="linear-gradient(140deg,#F2E3C8,#E9CFA4)"
        tagInk="#8A713F"
        status="1 of 5 · shave day"
        cta="Begin"
        onClick={() => onOpen('am')}
        delay={0.13}
      />

      <RitualCard
        ritual={NIGHT_RITUAL}
        title="Night ritual"
        tag="PM"
        tagBg="linear-gradient(140deg,#CFC2E6,#A995CF)"
        tagInk="#F6F1FA"
        status={nightDone ? 'Complete · day ring closed' : '2 of 5 · retinol night'}
        cta={nightDone ? 'Revisit' : 'Begin'}
        onClick={() => onOpen('pm')}
        glow={!nightDone}
        delay={0.2}
      />

      {/* Adaptive states — always present, never bolted on (spec §Safety) */}
      <div style={{ ...rise(0.3), display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <AdaptiveChip title="Skin Reset" sub="Calm everything to 3 steps if your barrier needs a rest." tint="#7FA8AB" />
        <AdaptiveChip title="Pregnancy-safe" sub="Retinoids swap to bakuchiol & peptides, automatically." tint="#A995CF" />
      </div>

      <div
        className="att-card"
        style={{ ...rise(0.38), borderRadius: 20, padding: '12px 16px', display: 'flex', gap: 11, alignItems: 'center' }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            flex: 'none',
            background: 'rgba(85,137,141,.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#55898D',
            fontSize: 16,
          }}
        >
          ☀
        </div>
        <div style={{ fontSize: 11.5, color: '#4C5B5C', lineHeight: 1.5 }}>
          <strong style={{ color: '#2E5558' }}>SPF is the day&rsquo;s last morning step.</strong> Whenever an active is
          in your routine, it&rsquo;s never optional here.
        </div>
      </div>
    </Screen>
  );
}

function RitualCard({
  ritual,
  title,
  tag,
  tagBg,
  tagInk,
  status,
  cta,
  onClick,
  glow,
  delay,
}: {
  ritual: Ritual;
  title: string;
  tag: string;
  tagBg: string;
  tagInk: string;
  status: string;
  cta: string;
  onClick: () => void;
  glow?: boolean;
  delay: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...rise(delay),
        textAlign: 'left',
        cursor: 'pointer',
        font: 'inherit',
        color: 'inherit',
        background: 'rgba(255,255,255,.75)',
        backdropFilter: 'blur(16px)',
        border: glow ? '1.5px solid rgba(169,149,207,.5)' : '1px solid rgba(255,255,255,.9)',
        borderRadius: 24,
        padding: '16px 18px',
        boxShadow: '0 10px 30px rgba(90,75,110,.08)',
        animation: glow ? 'attRise .7s ' + delay + 's both, attGlow 3.6s ease-in-out infinite' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            flex: 'none',
            background: tagBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-cormorant)',
            fontSize: 16,
            fontWeight: 600,
            color: tagInk,
            letterSpacing: 1,
          }}
        >
          {tag}
        </div>
        <div style={{ flex: 1 }}>
          <div className="att-serif" style={{ fontSize: 21, color: '#40394A' }}>
            {title}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--att-ink-soft)', marginTop: 1 }}>
            {ritual.steps.length} steps · {ritual.minutes} · {status}
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
          {cta} ›
        </span>
      </div>
    </button>
  );
}

function AdaptiveChip({ title, sub, tint }: { title: string; sub: string; tint: string }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,.6)',
        border: '1px solid rgba(255,255,255,.85)',
        borderRadius: 18,
        padding: '12px 13px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: tint }} />
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#40394A' }}>{title}</div>
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--att-ink-soft)', lineHeight: 1.45, marginTop: 5 }}>{sub}</div>
    </div>
  );
}
