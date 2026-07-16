'use client';

import { useId, useRef, useState, useCallback, useEffect } from 'react';

/* ── Progress ring ───────────────────────────────────────────────────────────
 * The signature component. Thin stroke, accent fill proportional to the value,
 * serif number centred, small-caps label beneath. Fills with an animated draw.
 * -------------------------------------------------------------------------- */
export function Ring({
  value,
  size = 128,
  stroke = 11,
  track = '#EBE4F2',
  color,
  gradient,
  delay = 0.4,
  duration = 1.6,
  children,
}: {
  value: number; // 0–100
  size?: number;
  stroke?: number;
  track?: string;
  color?: string;
  gradient?: { offset: number; color: string }[];
  delay?: number;
  duration?: number;
  children?: React.ReactNode;
}) {
  const gid = useId().replace(/:/g, '');
  const r = 86;
  const c = 2 * Math.PI * r; // 540.35…
  const clamped = Math.max(0, Math.min(100, value));
  const offset = c * (1 - clamped / 100);
  const strokeColor = gradient ? `url(#${gid})` : color || '#8A76B4';

  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
          strokeDasharray={c.toFixed(1)}
          strokeDashoffset={offset.toFixed(1)}
          style={
            {
              ['--c' as string]: c.toFixed(1),
              ['--att-final-offset' as string]: offset.toFixed(1),
              animation: `attRing ${duration}s ${delay}s cubic-bezier(.25,.7,.25,1) both`,
            } as React.CSSProperties
          }
        />
        {gradient && (
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              {gradient.map((g, i) => (
                <stop key={i} offset={g.offset} stopColor={g.color} />
              ))}
            </linearGradient>
          </defs>
        )}
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* Small indicator ring (check-in results, screen 1d). */
export function MiniRing({
  value,
  color,
  delay = 0.5,
}: {
  value: number;
  color: string;
  delay?: number;
}) {
  const r = 26;
  const c = 2 * Math.PI * r; // 163.36
  const offset = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div style={{ position: 'relative', width: 58, height: 58 }}>
      <svg width="58" height="58" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#EBE4F2" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
          strokeDasharray={c.toFixed(1)}
          strokeDashoffset={offset.toFixed(1)}
          style={
            {
              ['--c' as string]: c.toFixed(1),
              ['--att-final-offset' as string]: offset.toFixed(1),
              animation: `attRing 1.4s ${delay}s cubic-bezier(.25,.7,.25,1) both`,
            } as React.CSSProperties
          }
        />
      </svg>
      <div
        className="att-serif"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 19,
          color: '#40394A',
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ── Swipe-to-complete ───────────────────────────────────────────────────────
 * The primary completion gesture for a ritual step. Drag the knob to the end
 * (or tap it, or use keyboard) to complete. Satisfying resistance-then-release.
 * -------------------------------------------------------------------------- */
export function SwipeToComplete({
  onComplete,
  dark = false,
  label = 'Swipe when done',
}: {
  onComplete: () => void;
  dark?: boolean;
  label?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const knob = 36;

  const maxX = useCallback(() => {
    const t = trackRef.current;
    if (!t) return 0;
    return t.clientWidth - knob - 10;
  }, []);

  const finish = useCallback(() => {
    if (done) return;
    setDone(true);
    setX(maxX());
    setTimeout(onComplete, 220);
  }, [done, maxX, onComplete]);

  const move = useCallback(
    (clientX: number) => {
      const t = trackRef.current;
      if (!t) return;
      const rect = t.getBoundingClientRect();
      const nx = Math.max(0, Math.min(maxX(), clientX - rect.left - knob / 2 - 5));
      setX(nx);
      if (nx >= maxX() - 4) finish();
    },
    [finish, maxX],
  );

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => move(e.clientX);
    const onUp = () => {
      setDragging(false);
      if (!done) setX(0); // snap back if not completed
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, move, done]);

  return (
    <div
      ref={trackRef}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={() => !dragging && finish()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          finish();
        }
      }}
      style={{
        marginTop: 14,
        height: 46,
        borderRadius: 999,
        background: dark ? 'rgba(255,255,255,.1)' : 'rgba(64,57,74,.05)',
        border: dark ? '1px solid rgba(255,255,255,.2)' : '1px solid rgba(64,57,74,.12)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      <div
        onPointerDown={(e) => {
          e.stopPropagation();
          setDragging(true);
        }}
        style={{
          position: 'absolute',
          left: 5,
          top: 5,
          width: knob,
          height: knob,
          borderRadius: '50%',
          background: 'linear-gradient(140deg,#E9CFA4,#C9A96A)',
          boxShadow: dark ? '0 3px 10px rgba(0,0,0,.3)' : '0 3px 10px rgba(90,80,60,.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#54430F',
          fontSize: 15,
          transform: `translateX(${x}px)`,
          transition: dragging ? 'none' : 'transform .3s cubic-bezier(.2,.8,.2,1)',
          zIndex: 2,
        }}
      >
        {done ? '✓' : '›'}
      </div>
      <div
        style={{
          fontSize: 12,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: dark ? '#CBBFD9' : '#9A93A5',
          fontWeight: 600,
          opacity: Math.max(0, 1 - x / 60),
          animation: 'attPulse 2.6s ease-in-out infinite',
        }}
      >
        {done ? 'Done' : label}
      </div>
    </div>
  );
}

/* ── Drag-to-compare (progress timeline, screen 1g) ──────────────────────────
 * A divider you drag left/right across two states, not a static before/after.
 * -------------------------------------------------------------------------- */
export function CompareSlider() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(58); // percent
  const [dragging, setDragging] = useState(false);

  const move = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(6, Math.min(94, p)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => move(e.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, move]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        height: 170,
        borderRadius: 16,
        overflow: 'hidden',
        touchAction: 'none',
        cursor: 'ew-resize',
      }}
      onPointerDown={(e) => {
        setDragging(true);
        move(e.clientX);
      }}
    >
      {/* "after" (week 6) fills the whole area */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(135deg,#F2E3D6,#E7CFC7 60%,#D9BEC8), radial-gradient(circle at 60% 40%, rgba(255,255,255,.5), transparent 55%)',
        }}
      />
      {/* "before" (week 1) clipped to the left of the divider */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: `${pos}%`,
          overflow: 'hidden',
          background:
            'linear-gradient(135deg,#E7DFD2,#D8CEBE 60%,#CFC3B4), radial-gradient(circle at 40% 40%, rgba(255,255,255,.35), transparent 55%)',
          borderRight: '2.5px solid rgba(255,255,255,.95)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: `${pos}%`,
          transform: 'translate(-50%,-50%)',
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: 'rgba(255,255,255,.95)',
          boxShadow: '0 4px 14px rgba(0,0,0,.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          pointerEvents: 'none',
          color: '#8A76B4',
          fontSize: 11,
        }}
      >
        ‹ ›
      </div>
      <span
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1,
          color: '#5C5168',
          background: 'rgba(255,255,255,.85)',
          padding: '3px 9px',
          borderRadius: 999,
          pointerEvents: 'none',
        }}
      >
        WEEK 1
      </span>
      <span
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1,
          color: '#F6F1FA',
          background: 'rgba(138,118,180,.9)',
          padding: '3px 9px',
          borderRadius: 999,
          pointerEvents: 'none',
        }}
      >
        WEEK 6
      </span>
    </div>
  );
}
