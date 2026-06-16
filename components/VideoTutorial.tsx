'use client';

import { useRef, useState } from 'react';

/**
 * Reusable tutorial player (Feature Set D): a poster surface with a play button,
 * captions support, and a step list beside it. Real screen-recordings drop into
 * /public/tutorials/ (see the README there); until then the player shows a
 * branded placeholder surface and degrades gracefully if the MP4 is absent.
 */
export default function VideoTutorial({
  src,
  title,
  steps,
  icon = 'ti-player-play',
}: {
  src: string;
  title: string;
  steps: string[];
  icon?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [missing, setMissing] = useState(false);

  function play() {
    const v = videoRef.current;
    if (!v) return;
    v.play()
      .then(() => setPlaying(true))
      .catch(() => setMissing(true)); // placeholder path / not yet recorded
  }

  return (
    <div className="tut-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, alignItems: 'start' }}>
      <div
        style={{ position: 'relative', borderRadius: 'var(--rl)', overflow: 'hidden', background: 'var(--dk)', aspectRatio: '16/9' }}
      >
        <video
          ref={videoRef}
          src={src}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: playing ? 'block' : 'none' }}
          controls={playing}
          onEnded={() => setPlaying(false)}
        >
          {/* Captions go here when recordings land: <track kind="captions" src=… /> */}
        </video>
        {!playing && (
          <button
            onClick={play}
            style={{
              position: 'absolute', inset: 0, border: 'none', cursor: 'pointer', color: 'var(--w)',
              background: 'radial-gradient(ellipse at center, color-mix(in srgb, var(--g) 22%, transparent), transparent 70%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            aria-label={`Play: ${title}`}
          >
            <div
              style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--g)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 8px 30px rgba(0,0,0,.4)' }}
            >
              <i className={`ti ${icon}`} />
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>
              {missing ? 'Demo recording coming soon' : 'Watch the demo'}
            </div>
          </button>
        )}
      </div>

      <div>
        <div className="slbl" style={{ marginTop: 0 }}>Steps</div>
        <div className="tl">
          {steps.map((s, i) => (
            <div className="tli" key={i}>
              <div className="tlt" style={{ fontWeight: 400, fontSize: 12, color: 'var(--ink2)' }}>
                {s}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
