'use client';

import { useMemo, useState } from 'react';
import { MORNING_RITUAL, NIGHT_RITUAL, type Ritual, type RitualStep } from '../data';
import { Screen } from '../shell';
import { SwipeToComplete } from '../ui';

const rise = (d: number): React.CSSProperties => ({
  animation: `attRise .7s ${d}s cubic-bezier(.2,.7,.2,1) both`,
});

interface Theme {
  bg: string;
  blob: React.CSSProperties;
  dark: boolean;
  eyebrow: string;
  ink: string;
  soft: string;
  doneBg: string;
  doneBorder: string;
  doneCheckBg: string;
  doneCheckInk: string;
  futureBg: string;
  futureBorder: string;
  futureInk: string;
  futureNumBg: string;
  futureNumInk: string;
  nowCardBg: string;
  nowCardBorder: string;
  nowShadow: string;
  chip: string;
  chipInk: string;
  chipCautionBg: string;
  chipCautionInk: string;
  chipCautionBorder: string;
  progressTrack: string;
}

const NIGHT_THEME: Theme = {
  bg: 'linear-gradient(170deg,#3B3547 0%,#4A4157 55%,#54465A 100%)',
  blob: {
    top: -50,
    right: -60,
    width: 260,
    height: 260,
    background: 'radial-gradient(circle,rgba(169,149,207,.35),rgba(169,149,207,0) 70%)',
    filter: 'blur(30px)',
    animation: 'attFloat 10s ease-in-out infinite',
  },
  dark: true,
  eyebrow: '#B4A8C4',
  ink: '#EFEAF4',
  soft: '#B4A8C4',
  doneBg: 'rgba(255,255,255,.07)',
  doneBorder: 'rgba(255,255,255,.1)',
  doneCheckBg: '#7FA8AB',
  doneCheckInk: '#2E3B3C',
  futureBg: 'rgba(255,255,255,.05)',
  futureBorder: 'rgba(255,255,255,.08)',
  futureInk: '#DDD3E6',
  futureNumBg: 'rgba(255,255,255,.1)',
  futureNumInk: '#CBBFD9',
  nowCardBg: 'rgba(255,255,255,.12)',
  nowCardBorder: '1.5px solid rgba(201,169,106,.55)',
  nowShadow: '0 14px 36px rgba(0,0,0,.28)',
  chip: 'rgba(255,255,255,.1)',
  chipInk: '#E6DCF2',
  chipCautionBg: 'rgba(224,183,175,.14)',
  chipCautionInk: '#F2C9C2',
  chipCautionBorder: 'rgba(224,183,175,.3)',
  progressTrack: 'rgba(255,255,255,.14)',
};

const MORNING_THEME: Theme = {
  bg: 'linear-gradient(168deg,#F2F0EC 0%,#F7F3EC 50%,#EFECE4 100%)',
  blob: {
    top: -50,
    left: -60,
    width: 250,
    height: 250,
    background: 'radial-gradient(circle,rgba(233,207,164,.45),rgba(233,207,164,0) 70%)',
    filter: 'blur(30px)',
    animation: 'attFloat 10s ease-in-out infinite',
  },
  dark: false,
  eyebrow: '#9A93A5',
  ink: '#413C46',
  soft: '#9A93A5',
  doneBg: 'rgba(255,255,255,.7)',
  doneBorder: 'rgba(255,255,255,.9)',
  doneCheckBg: '#55898D',
  doneCheckInk: '#fff',
  futureBg: 'rgba(255,255,255,.55)',
  futureBorder: 'rgba(255,255,255,.85)',
  futureInk: '#5C5168',
  futureNumBg: 'rgba(64,57,74,.06)',
  futureNumInk: '#9A93A5',
  nowCardBg: 'rgba(255,255,255,.85)',
  nowCardBorder: '1.5px solid rgba(201,169,106,.55)',
  nowShadow: '0 14px 36px rgba(90,80,60,.14)',
  chip: 'rgba(64,57,74,.06)',
  chipInk: '#5C5168',
  chipCautionBg: 'rgba(201,120,110,.1)',
  chipCautionInk: '#9A5148',
  chipCautionBorder: 'rgba(201,120,110,.25)',
  progressTrack: 'rgba(64,57,74,.1)',
};

export function RitualScreen({
  which,
  streak,
  onBack,
  onComplete,
}: {
  which: 'am' | 'pm';
  streak: number;
  onBack: () => void;
  onComplete: () => void;
}) {
  const ritual: Ritual = which === 'pm' ? NIGHT_RITUAL : MORNING_RITUAL;
  const t = which === 'pm' ? NIGHT_THEME : MORNING_THEME;

  const initial = useMemo(
    () => new Set(ritual.steps.filter((s) => s.done).map((s) => s.n)),
    [ritual],
  );
  const [done, setDone] = useState<Set<number>>(initial);

  const total = ritual.steps.length;
  const completeCount = done.size;
  const activeStep = ritual.steps.find((s) => !done.has(s.n));

  const complete = (n: number) => {
    const next = new Set(done);
    next.add(n);
    setDone(next);
    if (next.size >= total) setTimeout(onComplete, 300);
  };

  const closing =
    which === 'pm'
      ? `Night ${streak} of your streak · ${ritual.closing}`
      : `Day ${streak} — ${ritual.closing}.`;

  return (
    <>
      <button className="att-back" data-dark={t.dark} onClick={onBack} aria-label="Back">
        ‹
      </button>
      <Screen bg={t.bg} blobs={[t.blob]} pad="68px 18px 30px" gap={12} style={{ color: t.ink }}>
        {/* Header */}
        <div style={rise(0.05)}>
          <div style={{ fontSize: 11, letterSpacing: 2.2, textTransform: 'uppercase', color: t.eyebrow, fontWeight: 600 }}>
            {ritual.eyebrow}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 2 }}>
            <div className="att-serif" style={{ fontSize: 30, fontWeight: 500 }}>
              {ritual.greeting}
            </div>
            <div style={{ fontSize: 12, color: t.soft }}>{ritual.minutes}</div>
          </div>
          <div style={{ height: 5, borderRadius: 99, background: t.progressTrack, overflow: 'hidden', marginTop: 12 }}>
            <div
              style={{
                height: '100%',
                width: `${(completeCount / total) * 100}%`,
                borderRadius: 99,
                background: 'linear-gradient(90deg,#E9CFA4,#C9A96A)',
                transition: 'width .5s cubic-bezier(.25,.7,.25,1)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <div style={{ fontSize: 11, color: t.soft }}>
              {completeCount} of {total} complete
            </div>
            {which === 'pm' && <div style={{ fontSize: 11, color: '#D8C9A8' }}>Completes your day ring</div>}
          </div>
        </div>

        {/* Steps */}
        {ritual.steps.map((s, i) => {
          if (done.has(s.n)) return <DoneStep key={s.n} step={s} theme={t} delay={0.15 + i * 0.06} />;
          if (activeStep && s.n === activeStep.n)
            return <NowStep key={s.n} step={s} theme={t} onComplete={() => complete(s.n)} delay={0.3} />;
          return <FutureStep key={s.n} step={s} theme={t} delay={0.38 + i * 0.06} />;
        })}

        <div
          className="att-serif"
          style={{ textAlign: 'center', fontStyle: 'italic', fontSize: 14.5, color: t.soft, marginTop: 2 }}
        >
          {closing}
        </div>
      </Screen>
    </>
  );
}

function stepNumberStyle(step: RitualStep, bg: string, ink: string): React.CSSProperties {
  return {
    width: 40,
    height: 40,
    borderRadius: 14,
    flex: 'none',
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-cormorant)',
    fontSize: 17,
    color: ink,
  };
}

function DoneStep({ step, theme: t, delay }: { step: RitualStep; theme: Theme; delay: number }) {
  return (
    <div
      style={{
        ...rise(delay),
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        background: t.doneBg,
        border: `1px solid ${t.doneBorder}`,
        borderRadius: 20,
        padding: '11px 14px',
        opacity: 0.62,
      }}
    >
      <div style={stepNumberStyle(step, 'linear-gradient(140deg,#8FB5B8,#6D9598)', '#F2F7F7')}>{step.n}</div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'line-through',
            textDecorationColor: t.dark ? 'rgba(255,255,255,.4)' : 'rgba(64,57,74,.35)',
          }}
        >
          {step.name}
        </div>
        <div style={{ fontSize: 11, color: t.soft }}>
          {step.duration} · {step.why}
        </div>
      </div>
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: t.doneCheckBg,
          color: t.doneCheckInk,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
        }}
      >
        ✓
      </div>
    </div>
  );
}

function FutureStep({ step, theme: t, delay }: { step: RitualStep; theme: Theme; delay: number }) {
  return (
    <div
      style={{
        ...rise(delay),
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        background: t.futureBg,
        border: `1px solid ${t.futureBorder}`,
        borderRadius: 20,
        padding: '11px 14px',
      }}
    >
      <div style={stepNumberStyle(step, t.futureNumBg, t.futureNumInk)}>{step.n}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.futureInk }}>{step.name}</div>
        <div style={{ fontSize: 11, color: t.soft }}>
          {step.duration} · {step.why}
        </div>
      </div>
    </div>
  );
}

function NowStep({
  step,
  theme: t,
  onComplete,
  delay,
}: {
  step: RitualStep;
  theme: Theme;
  onComplete: () => void;
  delay: number;
}) {
  return (
    <div
      style={{
        ...rise(delay),
        background: t.nowCardBg,
        backdropFilter: 'blur(14px)',
        border: t.nowCardBorder,
        borderRadius: 24,
        padding: 16,
        boxShadow: t.nowShadow,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            flex: 'none',
            background: 'linear-gradient(140deg,#E9CFA4,#C9A96A)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-cormorant)',
            fontSize: 20,
            color: '#54430F',
          }}
        >
          {step.n}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{step.name}</div>
          <div style={{ fontSize: 11.5, color: t.dark ? '#D8C9A8' : '#A8863F' }}>{step.duration}</div>
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.2,
            color: '#54430F',
            background: '#E9CFA4',
            padding: '4px 9px',
            borderRadius: 999,
          }}
        >
          NOW
        </div>
      </div>
      <div style={{ fontSize: 12, color: t.dark ? '#DDD3E6' : '#6E6579', lineHeight: 1.55, marginTop: 12 }}>
        {step.why}
      </div>
      {step.chips && (
        <div style={{ display: 'flex', gap: 7, marginTop: 11, flexWrap: 'wrap' }}>
          {step.chips.map((c, i) => (
            <div
              key={i}
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 999,
                color: c.tone === 'caution' ? t.chipCautionInk : t.chipInk,
                background: c.tone === 'caution' ? t.chipCautionBg : t.chip,
                border: `1px solid ${c.tone === 'caution' ? t.chipCautionBorder : t.dark ? 'rgba(255,255,255,.16)' : 'rgba(64,57,74,.1)'}`,
              }}
            >
              {c.label}
            </div>
          ))}
        </div>
      )}
      <SwipeToComplete dark={t.dark} onComplete={onComplete} />
    </div>
  );
}
