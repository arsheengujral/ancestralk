'use client';

import { useRef, useState } from 'react';
import VoicePlayback from './VoicePlayback';
import { putAudio } from '@/lib/voiceBuffer';

/**
 * Voice input for any question. Tap to record; the transcript streams into the
 * bound field, then a playback bar appears.
 *
 * When `captureAudio` is set and the browser allows microphone access, this
 * captures REAL audio via MediaRecorder and buffers it (lib/voiceBuffer) to be
 * uploaded to private storage when the member is saved. The transcript itself is
 * still streamed from `demoText` until a Whisper key is configured (transcription
 * then replaces it). With no mic / permission, it degrades to text-only.
 */
export default function VoiceRecorder({
  id,
  label = 'Speak',
  iconOnly = false,
  demoText,
  captureAudio = false,
  onTranscript,
  onComplete,
}: {
  id: string;
  label?: string;
  iconOnly?: boolean;
  demoText?: string;
  captureAudio?: boolean;
  onTranscript: (text: string) => void;
  onComplete?: () => void;
}) {
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState('');
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  function stopMic() {
    const mr = recorder.current;
    if (mr && mr.state !== 'inactive') {
      try {
        mr.stop();
      } catch {
        /* ignore */
      }
    }
    recorder.current = null;
  }

  function finish() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    stopMic();
    setRecording(false);
    setStatus('Saved ✓');
    setDone(true);
    onComplete?.();
  }

  async function startMic() {
    if (!captureAudio || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunks.current, { type: mr.mimeType || 'audio/webm' });
        if (blob.size) putAudio(id, blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      recorder.current = mr;
    } catch {
      /* mic denied / unsupported — fall back to transcript only */
    }
  }

  function toggle() {
    if (recording) {
      finish();
      return;
    }
    setRecording(true);
    setStatus('Listening…');
    void startMic();

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
