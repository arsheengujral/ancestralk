'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Voice playback bar with an animated waveform.
 *  - variant="light" → inline under a question (gold-wash .vpb)
 *  - variant="dark"  → the chapter header bar (.vbar)
 * Real audio (a Supabase signed URL) plays when `src` is provided; otherwise it
 * animates as a faithful preview, matching the prototype.
 */
export default function VoicePlayback({
  variant = 'light',
  label,
  sublabel,
  src,
  bars = 15,
}: {
  variant?: 'light' | 'dark';
  label?: string;
  sublabel?: string;
  src?: string;
  bars?: number;
}) {
  const [playing, setPlaying] = useState(false);
  const [heights, setHeights] = useState<number[]>(
    () => SEED.slice(0, bars).map((h) => h),
  );
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => stop(), []); // cleanup on unmount

  function stop() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    audio.current?.pause();
    setPlaying(false);
  }

  function toggle() {
    if (playing) {
      stop();
      return;
    }
    setPlaying(true);
    if (src) {
      audio.current = audio.current ?? new Audio(src);
      audio.current.play().catch(() => {});
      audio.current.onended = stop;
    }
    timer.current = setInterval(() => {
      setHeights((hs) => hs.map(() => Math.random() * 13 + 3));
    }, 130);
    // Auto-stop the preview animation after a beat if there's no real audio.
    if (!src) setTimeout(stop, 7000);
  }

  const isDark = variant === 'dark';

  if (isDark) {
    return (
      <div className="vbar">
        <button className="vbp" onClick={toggle} aria-label="Play voice">
          <i className={`ti ${playing ? 'ti-player-pause' : 'ti-player-play'}`} />
        </button>
        <div>
          <div className="vbn">{label ?? 'Voice recordings'}</div>
          <div className="vbd">{sublabel ?? 'Tap to hear them speak'}</div>
        </div>
        <div className="vbw">
          {heights.map((h, i) => (
            <div key={i} className="vbb" style={{ height: `${h + 4}px` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="vpb show">
      <button className="vp-btn" onClick={toggle} aria-label="Play voice">
        <i className={`ti ${playing ? 'ti-player-pause' : 'ti-player-play'}`} />
      </button>
      <div style={{ fontSize: 11, color: 'var(--g3)' }}>{label ?? 'Voice recorded'}</div>
      <div className="vwave">
        {heights.map((h, i) => (
          <div key={i} className="vwb" style={{ height: `${h}px` }} />
        ))}
      </div>
    </div>
  );
}

const SEED = [4, 8, 12, 15, 9, 6, 11, 16, 10, 7, 13, 5, 9, 12, 8, 6, 11, 14, 7, 10];
