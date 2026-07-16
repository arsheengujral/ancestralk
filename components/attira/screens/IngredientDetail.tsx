'use client';

import { INGREDIENTS } from '../data';
import { Screen } from '../shell';

const LEARN_BG = 'linear-gradient(168deg,#F1EBF6 0%,#F8F3EB 55%,#F2ECE1 100%)';
const rise = (d: number): React.CSSProperties => ({
  animation: `attRise .6s ${d}s cubic-bezier(.2,.7,.2,1) both`,
});

export function IngredientDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const ing = INGREDIENTS.find((x) => x.id === id);
  if (!ing) return null;

  return (
    <>
      <button className="att-back" onClick={onBack} aria-label="Back">
        ‹
      </button>
      <Screen
        bg={LEARN_BG}
        blobs={[
          {
            top: -40,
            right: -60,
            width: 240,
            height: 240,
            background: 'radial-gradient(circle,rgba(196,178,226,.4),rgba(196,178,226,0) 70%)',
            filter: 'blur(30px)',
            animation: 'attFloat 10s ease-in-out infinite',
          },
        ]}
        pad="66px 20px 40px"
        gap={12}
      >
        {/* Hero */}
        <div style={{ ...rise(0.04), display: 'flex', alignItems: 'center', gap: 15 }}>
          <div
            style={{
              width: 66,
              height: 66,
              borderRadius: '50%',
              flex: 'none',
              background: `radial-gradient(circle at 35% 30%,${ing.swatch[0]},${ing.swatch[1]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-cormorant)',
              fontSize: 26,
              fontStyle: 'italic',
              color: ing.ink,
              boxShadow: '0 8px 20px rgba(90,75,110,.12)',
            }}
          >
            {ing.monogram}
          </div>
          <div>
            <div className="att-serif" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.1 }}>
              {ing.name}
            </div>
            <div style={{ fontSize: 12.5, color: '#6E6579', marginTop: 2 }}>{ing.tagline}</div>
            <div style={{ fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--att-lav)', fontWeight: 700, marginTop: 4 }}>
              {ing.mastery}
            </div>
          </div>
        </div>

        <Section label="What it does" body={ing.does} delay={0.1} />
        <Row label="Helps with" body={ing.concerns} delay={0.15} />
        <Row label="Who it suits" body={ing.suits} delay={0.2} />

        <div style={{ ...rise(0.25), display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <MiniCard label="When" body={ing.when} />
          <MiniCard label="How often" body={ing.frequency} />
        </div>

        <Section label="Realistic results" body={ing.results} tint="#55898D" delay={0.3} />

        <div style={{ ...rise(0.35), display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <MiniCard label="Pairs well" body={ing.pairs} />
          <MiniCard label="Use with care" body={ing.caution} caution />
        </div>

        {ing.myth && (
          <div
            style={{
              ...rise(0.4),
              background: 'linear-gradient(135deg,rgba(201,169,106,.12),rgba(233,207,164,.16))',
              border: '1px solid rgba(201,169,106,.26)',
              borderRadius: 20,
              padding: '13px 16px',
            }}
          >
            <div style={{ fontSize: 9.5, letterSpacing: 1.6, textTransform: 'uppercase', color: '#A8863F', fontWeight: 700 }}>
              Myth, corrected
            </div>
            <div style={{ fontSize: 12.5, color: '#6B5D44', lineHeight: 1.55, marginTop: 6 }}>
              <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>{ing.myth.claim}</span>{' '}
              <strong style={{ color: '#40394A' }}>{ing.myth.truth}</strong>
            </div>
          </div>
        )}

        <div style={{ ...rise(0.46), fontSize: 10.5, color: 'var(--att-muted)', textAlign: 'center', lineHeight: 1.5 }}>
          Curated for your skin — cosmetic guidance, never medical. For anything persistent, a dermatologist can see
          what we can&rsquo;t.
        </div>
      </Screen>
    </>
  );
}

function Section({ label, body, tint, delay }: { label: string; body: string; tint?: string; delay: number }) {
  return (
    <div className="att-card" style={{ ...rise(delay), borderRadius: 20, padding: '13px 16px' }}>
      <div style={{ fontSize: 9.5, letterSpacing: 1.6, textTransform: 'uppercase', color: tint || 'var(--att-muted)', fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: '#4A4353', lineHeight: 1.6, marginTop: 6 }}>{body}</div>
    </div>
  );
}

function Row({ label, body, delay }: { label: string; body: string; delay: number }) {
  return (
    <div style={{ ...rise(delay), display: 'flex', gap: 12, padding: '2px 4px' }}>
      <div style={{ fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--att-muted)', fontWeight: 700, width: 74, flex: 'none', paddingTop: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 12.5, color: '#4A4353', lineHeight: 1.55 }}>{body}</div>
    </div>
  );
}

function MiniCard({ label, body, caution }: { label: string; body: string; caution?: boolean }) {
  return (
    <div
      style={{
        background: caution ? 'rgba(224,183,175,.12)' : 'rgba(255,255,255,.66)',
        border: caution ? '1px solid rgba(224,183,175,.3)' : '1px solid rgba(255,255,255,.9)',
        borderRadius: 18,
        padding: '11px 13px',
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', color: caution ? '#B07C72' : 'var(--att-muted)', fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontSize: 11.5, color: '#5C5168', lineHeight: 1.5, marginTop: 5 }}>{body}</div>
    </div>
  );
}
