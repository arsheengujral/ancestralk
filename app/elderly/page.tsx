'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const QUESTIONS = [
  'What is the earliest memory you have that still feels vivid today?',
  'Who was the person in your childhood who made you feel most safe?',
  'What is the hardest year of your life, and what got you through it?',
  'What do you want to be remembered for, that has nothing to do with work or money?',
  'What message would you leave for a grandchild you may never meet?',
];

const DEMO =
  "I remember the courtyard of my mother's house. The smell of rain on the stones. I must have been four years old.";

/**
 * Elderly voice-only mode — full screen, one large serif question at a time,
 * one giant gold mic button, live transcript. No typing anywhere. Ported from
 * the prototype's elderly overlay.
 */
export default function ElderlyPage() {
  const router = useRouter();
  const [q, setQ] = useState(0);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hint, setHint] = useState('Tap and speak. Take your time.');
  const [answered, setAnswered] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function record() {
    if (recording) return;
    if (answered) {
      // advance to next question
      if (q + 1 < QUESTIONS.length) {
        setQ(q + 1);
        setTranscript('');
        setHint('Tap and speak. Take your time.');
        setAnswered(false);
      } else {
        router.push('/archive');
      }
      return;
    }
    setRecording(true);
    setHint('Listening… take all the time you need');
    const words = DEMO.split(' ');
    let i = 0;
    timer.current = setInterval(() => {
      setTranscript(words.slice(0, i + 1).join(' '));
      i += 1;
      if (i >= words.length) {
        if (timer.current) clearInterval(timer.current);
        setRecording(false);
        setAnswered(true);
        setHint('Saved ✓ — tap for the next question');
      }
    }, 140);
  }

  return (
    <div className="eld on">
      <button className="eld-x" onClick={() => router.push('/begin')} aria-label="Exit">
        ✕
      </button>
      <div className="eld-q serif">{QUESTIONS[q]}</div>
      <button
        className={`eld-mic${recording ? ' rec' : ''}`}
        onClick={record}
        aria-label="Record answer"
      >
        <i className="ti ti-microphone" />
      </button>
      <div className="eld-hint">{hint}</div>
      <div className="eld-trans">{transcript}</div>
    </div>
  );
}
