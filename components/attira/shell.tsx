'use client';

import type { TabId } from './data';

/* A screen: a fixed background with ambient blobs + a scrollable content canvas.
 * Blobs stay put while content scrolls, matching the imported mockups. */
export function Screen({
  bg,
  blobs = [],
  pad = '68px 18px 96px',
  gap = 11,
  children,
  style,
}: {
  bg: string;
  blobs?: React.CSSProperties[];
  pad?: string;
  gap?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: bg }}>
      {blobs.map((b, i) => (
        <div key={i} style={{ position: 'absolute', borderRadius: '50%', ...b }} />
      ))}
      <div
        className="att-canvas"
        style={{ display: 'flex', flexDirection: 'column', gap, padding: pad, ...style }}
      >
        {children}
      </div>
    </div>
  );
}

/* The device frame — a bezel + notch on desktop, full-bleed on phones (CSS). */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="att-phone">
      <div className="att-screen">
        <div className="att-notch" />
        {children}
      </div>
    </div>
  );
}

/* Bottom navigation — Today · Check-in · Rituals · Learn · You (design §4). */
const NAV: { id: TabId; label: string; dot?: boolean }[] = [
  { id: 'today', label: 'Today' },
  { id: 'checkin', label: 'Check-in' },
  { id: 'rituals', label: 'Rituals' },
  { id: 'learn', label: 'Learn', dot: true },
  { id: 'you', label: 'You' },
];

export function BottomNav({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (t: TabId) => void;
}) {
  return (
    <nav className="att-nav" aria-label="Primary">
      {NAV.map((item) => {
        const on = item.id === active;
        const glyphColor = on ? 'var(--att-lav)' : 'var(--att-muted)';
        return (
          <button
            key={item.id}
            className="att-nav-item"
            data-active={on}
            aria-current={on ? 'page' : undefined}
            onClick={() => onChange(item.id)}
          >
            <span
              aria-hidden
              style={{ color: glyphColor, display: 'flex', position: 'relative' }}
            >
              <Glyph id={item.id} active={on} />
              {item.dot && <span className="att-nav-dot" />}
            </span>
            <span className="att-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* Small nav glyphs matching the imported design's shapes. */
function Glyph({ id, active }: { id: TabId; active: boolean }) {
  const c = active ? 'var(--att-lav)' : 'var(--att-muted)';
  const base = { width: 8, height: 8, boxSizing: 'border-box' as const };
  switch (id) {
    case 'today':
      return <span style={{ ...base, borderRadius: '50%', background: c }} />;
    case 'checkin':
      return <span style={{ ...base, borderRadius: '50%', border: `1.5px solid ${c}` }} />;
    case 'rituals':
      return <span style={{ ...base, background: c, transform: 'rotate(45deg)', borderRadius: 2 }} />;
    case 'learn':
      return <span style={{ width: 9, height: 9, borderRadius: 2.5, border: `1.5px solid ${c}`, boxSizing: 'border-box' }} />;
    case 'you':
      return <span style={{ ...base, background: c, borderRadius: '50% 50% 50% 0' }} />;
  }
}
