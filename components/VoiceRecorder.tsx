'use client';

import { useEffect, useRef, useState } from 'react';
import VoicePlayback from './VoicePlayback';
import { putAudio } from '@/lib/voiceBuffer';

type Phase = 'idle' | 'recording' | 'transcribing' | 'review' | 'done';

/**
 * Voice input that actually records. Tap to record real audio (MediaRecorder),
 * tap again to stop; the clip is sent to /api/voice/transcribe (Whisper) and the
 * transcript is shown for you to REVIEW and APPROVE before it fills the field.
 *
 * Fallbacks, in order: no microphone / permission denied, or transcription not
 * configured yet → it streams the sample text so the flow still works. When
 * `captureAudio` is set, the approved recording is buffered (lib/voiceBuffer)
 * to upload to private storage when the member is saved.
 */
export default function VoiceRecorder({
  id,
  label = 'Speak',
  iconOnly = false,
  demoText,
  captureAudio = false,
  language,
  onTranscript,
  onComplete,
}: {
  id: string;
  label?: string;
  iconOnly?: boolean;
  demoText?: string;
  captureAudio?: boolean;
  language?: string;
  onTranscript: (text: string) => void;
  onComplete?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [status, setStatus] = useState('');
  const [draft, setDraft] = useState(''); // transcript awaiting approval
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const lastBlob = useRef<Blob | null>(null);
  const simTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Release the simulation timer and any live microphone stream on unmount, so
  // navigating away mid-recording never leaves the mic open or a timer firing.
  useEffect(() => {
    return () => {
      if (simTimer.current) clearInterval(simTimer.current);
      try {
        recorder.current?.state === 'recording' && recorder.current.stop();
      } catch {
        /* already stopped */
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── Simulated fallback (no mic / no transcription key) ────────────────────
  function runSimulation() {
    setPhase('recording');
    setStatus('Listening…');
    const words = (demoText || 'A remarkable person who shaped everyone around them').split(' ');
    let i = 0;
    simTimer.current = setInterval(() => {
      onTranscript(words.slice(0, i + 1).join(' '));
      i += 1;
      if (i >= words.length) {
        if (simTimer.current) clearInterval(simTimer.current);
        setPhase('done');
        setStatus('Saved ✓');
        onComplete?.();
      }
    }, 90);
  }

  // ── Real recording ────────────────────────────────────────────────────────
  async function startRecording() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      runSimulation();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const blob = new Blob(chunks.current, { type: mr.mimeType || 'audio/webm' });
        lastBlob.current = blob;
        await transcribe(blob);
      };
      mr.start();
      recorder.current = mr;
      setPhase('recording');
      setStatus('Recording… tap to stop');
    } catch {
      // Permission denied / unsupported → graceful fallback.
      runSimulation();
    }
  }

  async function transcribe(blob: Blob) {
    setPhase('transcribing');
    setStatus('Turning your words into text…');
    try {
      const fd = new FormData();
      fd.append('audio', blob, 'recording.webm');
      if (language) fd.append('language', language);
      const res = await fetch('/api/voice/transcribe', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.configured === false) {
        // No transcription service yet → keep the audio, fall back to sample text.
        setStatus('Recorded. Voice-to-text turns on once the voice service is connected.');
        if (captureAudio && lastBlob.current) putAudio(id, lastBlob.current);
        runSimulation();
        return;
      }
      setDraft(data.transcript ?? '');
      setPhase('review');
      setStatus('Review your words, then approve.');
    } catch {
      setStatus('Could not transcribe — you can type instead.');
      setPhase('idle');
    }
  }

  function approve() {
    onTranscript(draft);
    if (captureAudio && lastBlob.current) putAudio(id, lastBlob.current);
    setPhase('done');
    setStatus('Saved ✓');
    onComplete?.();
  }

  function toggle() {
    if (phase === 'recording') {
      // Stop.
      if (recorder.current && recorder.current.state !== 'inactive') {
        recorder.current.stop();
        recorder.current = null;
      } else if (simTimer.current) {
        clearInterval(simTimer.current);
        setPhase('done');
        setStatus('Saved ✓');
        onComplete?.();
      }
      return;
    }
    setDraft('');
    void startRecording();
  }

  const recording = phase === 'recording';

  return (
    <>
      <div className="vrow">
        <button
          className={`vbtn${recording ? ' rec' : ''}`}
          onClick={toggle}
          type="button"
          aria-pressed={recording}
          disabled={phase === 'transcribing'}
        >
          <span className="vd" />
          <i className="ti ti-microphone" />
          {!iconOnly && <span>{recording ? 'Stop' : label}</span>}
        </button>
      </div>
      <div className="vstat">{status}</div>

      {phase === 'review' && (
        <div className="sug show" style={{ display: 'block' }}>
          <div className="sug-l">
            <i className="ti ti-check" style={{ fontSize: 12 }} /> Your recording — edit if needed, then approve
          </div>
          <textarea
            className="fta"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="ibtn" onClick={approve}>
              Use this ✓
            </button>
            <button className="bb" style={{ padding: '8px 14px', fontSize: 12 }} onClick={toggle}>
              Re-record
            </button>
          </div>
        </div>
      )}

      {phase === 'done' && <VoicePlayback variant="light" label="Recorded" />}
    </>
  );
}
