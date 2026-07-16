'use client';

import { INGREDIENTS, type Ingredient, type Mastery } from '../data';
import { Screen } from '../shell';

const LEARN_BG = 'linear-gradient(168deg,#F1EBF6 0%,#F8F3EB 55%,#F2ECE1 100%)';
const rise = (d: number): React.CSSProperties => ({
  animation: `attRise .7s ${d}s cubic-bezier(.2,.7,.2,1) both`,
});

const masteryColor: Record<Mastery, string> = {
  Mastered: '#55898D',
  Learning: '#8A76B4',
  'New today': '#C9A96A',
  Tomorrow: '#8A76B4',
  Locked: '#B0A7BC',
};

export function Learn({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <Screen
      bg={LEARN_BG}
      blobs={[
        {
          top: -40,
          right: -60,
          width: 240,
          height: 240,
          background: 'radial-gradient(circle,rgba(196,178,226,.45),rgba(196,178,226,0) 70%)',
          filter: 'blur(30px)',
          animation: 'attFloat 10s ease-in-out infinite',
        },
      ]}
      gap={13}
    >
      {/* Header + level bar */}
      <div style={rise(0.05)}>
        <div className="att-eyebrow">Your library</div>
        <div className="att-serif" style={{ fontSize: 30, fontWeight: 500, marginTop: 2 }}>
          14 ingredients known
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#8A713F' }}>Enthusiast</div>
          <div style={{ flex: 1, height: 6, borderRadius: 99, background: '#EBE4F2', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: '35%',
                borderRadius: 99,
                background: 'linear-gradient(90deg,#E9CFA4,#C9A96A)',
                animation: 'attBar 1.2s .3s cubic-bezier(.25,.7,.25,1) both',
              }}
            />
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--att-muted)' }}>Expert at 40</div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ ...rise(0.15), display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {INGREDIENTS.map((ing) => (
          <Tile key={ing.id} ing={ing} onOpen={onOpen} />
        ))}
        <div
          style={{
            background: 'rgba(255,255,255,.4)',
            border: '1px dashed rgba(64,57,74,.15)',
            borderRadius: 20,
            padding: '13px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1.5px dashed rgba(64,57,74,.2)',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
              color: 'var(--att-muted)',
            }}
          >
            ?
          </div>
          <div style={{ fontSize: 9.5, color: 'var(--att-muted)', textAlign: 'center' }}>24 to discover</div>
        </div>
      </div>

      {/* Weekly challenge */}
      <div
        style={{
          ...rise(0.3),
          background: 'linear-gradient(135deg,rgba(201,169,106,.12),rgba(233,207,164,.18))',
          border: '1px solid rgba(201,169,106,.28)',
          borderRadius: 20,
          padding: '13px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 13,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            flex: 'none',
            background: 'linear-gradient(140deg,#E9CFA4,#C9A96A)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-cormorant)',
            fontSize: 16,
            color: '#54430F',
          }}
        >
          3
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#40394A' }}>Read 3 more cards this week</div>
          <div style={{ fontSize: 11, color: 'var(--att-ink-soft)' }}>July challenge · 4 of 7 done · +80 XP at the finish</div>
        </div>
      </div>

      {/* Why it matters */}
      <div className="att-card" style={{ ...rise(0.38), borderRadius: 20, padding: '13px 16px' }}>
        <div style={{ fontSize: 9.5, letterSpacing: 1.6, textTransform: 'uppercase', color: 'var(--att-muted)', fontWeight: 700 }}>
          Why it matters
        </div>
        <div style={{ fontSize: 12, color: '#6E6579', lineHeight: 1.55, marginTop: 6 }}>
          You now read labels like someone who knows. Last week you spotted the fragrance in a serum before we did.
        </div>
      </div>
    </Screen>
  );
}

function Tile({ ing, onOpen }: { ing: Ingredient; onOpen: (id: string) => void }) {
  const locked = ing.mastery === 'Tomorrow' || ing.mastery === 'Locked';
  const inner = (
    <>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%,${ing.swatch[0]},${ing.swatch[1]})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-cormorant)',
          fontSize: 17,
          fontStyle: 'italic',
          color: ing.ink,
          filter: locked ? 'blur(2px)' : undefined,
        }}
      >
        {ing.monogram}
      </div>
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          color: locked ? 'var(--att-muted)' : '#40394A',
          textAlign: 'center',
          filter: locked ? 'blur(2px)' : undefined,
        }}
      >
        {ing.name}
      </div>
      <div style={{ fontSize: 9, color: masteryColor[ing.mastery], fontWeight: ing.mastery === 'New today' ? 700 : 600 }}>
        {ing.mastery}
      </div>
    </>
  );

  const style: React.CSSProperties = {
    background: locked ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.72)',
    border: locked ? '1px dashed rgba(138,118,180,.4)' : '1px solid rgba(255,255,255,.9)',
    borderRadius: 20,
    padding: '13px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    boxShadow: locked ? undefined : '0 6px 18px rgba(90,75,110,.07)',
  };

  if (locked) return <div style={style}>{inner}</div>;
  return (
    <button
      onClick={() => onOpen(ing.id)}
      style={{ ...style, cursor: 'pointer', font: 'inherit', color: 'inherit' }}
      aria-label={`Open ${ing.name}`}
    >
      {inner}
    </button>
  );
}
