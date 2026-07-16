'use client';

import { JOURNEY, type JourneyNode } from '../data';
import { Screen } from '../shell';

const HOME_BG = 'linear-gradient(168deg,#F4EEF7 0%,#F8F3EB 48%,#F2ECE1 100%)';

export function Journey({ streak, onBack }: { streak: number; onBack: () => void }) {
  return (
    <>
      <button className="att-back" onClick={onBack} aria-label="Back">
        ‹
      </button>
      <Screen
        bg={HOME_BG}
        blobs={[
          {
            top: '30%',
            right: -70,
            width: 250,
            height: 250,
            background: 'radial-gradient(circle,rgba(196,178,226,.4),rgba(196,178,226,0) 70%)',
            filter: 'blur(30px)',
            animation: 'attFloat 10s ease-in-out infinite',
          },
        ]}
        pad="68px 22px 30px"
        gap={10}
      >
        <div style={{ animation: 'attRise .7s .05s cubic-bezier(.2,.7,.2,1) both' }}>
          <div className="att-eyebrow">July challenge</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 2 }}>
            <div className="att-serif" style={{ fontSize: 30, fontWeight: 500 }}>
              30-Day Glow-Up
            </div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--att-lav)' }}>Day 18</div>
          </div>
        </div>

        {/* Node path */}
        <div style={{ position: 'relative', flex: 1, minHeight: 460, animation: 'attRise .7s .15s cubic-bezier(.2,.7,.2,1) both' }}>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: 2.5,
              background: 'linear-gradient(180deg,#EBE4F2 0%,#EBE4F2 42%,#C9A96A 42%,#B9A8D9 100%)',
              borderRadius: 2,
              transform: 'translateX(-50%)',
            }}
          />
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '6px 0' }}>
            {JOURNEY.map((node) => (
              <Node key={node.day} node={node} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="att-card"
          style={{
            animation: 'attRise .7s .3s cubic-bezier(.2,.7,.2,1) both',
            borderRadius: 20,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#40394A' }}>12 of 18 days perfect</div>
            <div style={{ fontSize: 10.5, color: 'var(--att-ink-soft)' }}>Finish strong — 92% of finishers keep their glow</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#F6F1FA', background: 'linear-gradient(135deg,#A995CF,#8A76B4)', padding: '9px 16px', borderRadius: 999 }}>
            Continue ›
          </span>
        </div>
      </Screen>
    </>
  );
}

function Node({ node }: { node: JourneyNode }) {
  const reverse = node.side === 'right';
  const text = (
    <div style={{ flex: 1, textAlign: 'right' }}>
      <div style={{ fontSize: node.state === 'here' ? 13 : 12, fontWeight: node.state === 'here' ? 800 : 700, color: labelInk(node) }}>
        {node.state === 'here' ? "Tonight's ritual" : node.title}
      </div>
      <div style={{ fontSize: 10.5, color: subInk(node), fontWeight: node.state === 'here' ? 600 : 400 }}>{node.sub}</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: reverse ? 'row-reverse' : 'row' }}>
      {text}
      <Bubble node={node} />
      <div style={{ flex: 1 }} />
    </div>
  );
}

function Bubble({ node }: { node: JourneyNode }) {
  const common: React.CSSProperties = {
    flex: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-cormorant)',
    position: 'relative',
    zIndex: 1,
    boxSizing: 'border-box',
  };

  switch (node.state) {
    case 'here':
      return (
        <div
          style={{
            ...common,
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'linear-gradient(140deg,#CFC2E6,#8A76B4)',
            fontSize: 18,
            color: '#F6F1FA',
            animation: 'attBreathe 2.6s ease-in-out infinite',
            boxShadow: '0 8px 22px rgba(138,118,180,.4)',
          }}
        >
          {node.day}
        </div>
      );
    case 'milestone-done':
      return (
        <div style={{ ...common, width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(140deg,#E9CFA4,#C9A96A)', boxShadow: '0 5px 14px rgba(201,169,106,.35)' }}>
          <div style={{ width: 12, height: 12, background: '#54430F', transform: 'rotate(45deg)', borderRadius: 2.5 }} />
        </div>
      );
    case 'milestone-next':
      return (
        <div style={{ ...common, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.8)', border: '1.5px solid rgba(138,118,180,.4)', fontSize: 14, color: 'var(--att-lav)' }}>
          {node.day}
        </div>
      );
    case 'done':
      return (
        <div style={{ ...common, width: 40, height: 40, borderRadius: '50%', background: '#C9A96A', color: '#fff', fontSize: 14 }}>✓</div>
      );
    default:
      return (
        <div style={{ ...common, width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,.7)', border: '1.5px dashed rgba(64,57,74,.2)', fontSize: 14, color: 'var(--att-muted)' }}>
          {node.day}
        </div>
      );
  }
}

function labelInk(node: JourneyNode): string {
  if (node.state === 'upcoming') return '#B0A7BC';
  if (node.state === 'milestone-next') return '#5C5168';
  return '#40394A';
}
function subInk(node: JourneyNode): string {
  if (node.state === 'upcoming') return '#B0A7BC';
  if (node.state === 'here') return 'var(--att-lav)';
  if (node.state === 'milestone-done') return '#A8863F';
  return 'var(--att-ink-soft)';
}
