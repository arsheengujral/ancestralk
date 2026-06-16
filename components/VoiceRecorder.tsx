'use client';

import { useRef, useState } from 'react';
import VoicePlayback from './VoicePlayback';

/**
 * Voice input for any question. Tap to record; the transcript streams into the
 * bound field live, then a playback bar appears.
 *
 * In Phase 1 / degraded mode this simulates near-live transcription (mirroring
 * the prototype) using `demoText`, so the experience is complete offline. When
 * Whisper is wired (Phase 3), the same component will stream real MediaRecorder
 * audio to /api/voice/transcribe; the props are already shaped for that.
 */
export default function VoiceRecorder({
  id,
  label = 'Speak',
  iconOnly = false,
  demoText,
  onTranscript,
  onComplete,
}: {
  id: string;
  label?: string;
  iconOnly?: boolean;
  demoText?: string;
  onTranscript: (text: string) => void;
  onComplete?: () => void;
}) {
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState('');
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function finish() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setRecording(false);
    setStatus('Saved ✓');
    setDone(true);
    onComplete?.();
  }

  function toggle() {
    if (recording) {
      finish();
      return;
    }
    setRecording(true);
    setStatus('Listening…');

    const words = (demoText || 'A remarkable person who shaped everyone around them').split(' ');
    let i = 0;
    timer.current = setInterval(() => {
      onTranscript(words.slice(0, i + 1).join(' '));
      setStatus(`Recording: "${words.slice(0, Math.min(i + 1, 5)).join(' ')}…"`);
      i += 1;
      if (i >= words.length) finish();
    }, 105);
  }

  return (
    <>
      <div className="vrow">
        <button
          className={`vbtn${recording ? ' rec' : ''}`}
          onClick={toggle}
          type="button"
          aria-pressed={recording}
        >
          <span className="vd" />
          <i className="ti ti-microphone" />
          {!iconOnly && <span>{label}</span>}
        </button>
      </div>
      <div className="vstat">{status}</div>
      {done && <VoicePlayback variant="light" label="Recorded" />}
    </>
  );
}
