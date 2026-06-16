'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

// Contextual tips per route — ported from the prototype's `tips` map.
const TIPS: Record<string, string[]> = {
  '/begin': [
    'Tap the microphone on any question to speak instead of type.',
    'One sentence per question is enough to begin.',
  ],
  '/elderly': [
    'Large text, one question at a time. Just speak — nothing to type.',
    'Take all the time you need. Every pause is kept.',
  ],
  '/archive': [
    'Tap any branch of the tree to open that person’s chapter.',
    'Empty slots are invitations — tap a “+” to add someone.',
  ],
  '/album': [
    'Scan old printed photos with your phone — they’re enhanced automatically.',
    'Photos auto-organise by person and decade.',
  ],
  '/future': [
    'Sealed means sealed — even you can’t read it after.',
    'Voice messages mean they hear your actual voice when it opens.',
  ],
  '/collaborate': [
    'Every member owns their own chapter. No one can edit another’s.',
    'Reminders go out automatically on birthdays.',
  ],
  '/book': [
    'Add photos and videos — they appear inline here and as QR codes in print.',
    'What you see is exactly what ships.',
  ],
  '/settings': ['Everything can be edited later. Nothing is final.'],
  '/': ['Everything can be edited later. Nothing is final.'],
};

export default function FloatingGuide() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const idx = useRef(0);

  const tips = TIPS[pathname] ?? TIPS['/'];

  // Briefly surface the first tip on route change, like the prototype.
  useEffect(() => {
    idx.current = 0;
    const show = setTimeout(() => {
      setText(tips[0]);
      setOpen(true);
    }, 800);
    const hide = setTimeout(() => setOpen(false), 5300);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setText(tips[idx.current % tips.length]);
    idx.current += 1;
    setOpen(true);
  }

  return (
    <div className="guide">
      <div className={`gb${open ? ' show' : ''}`}>{text}</div>
      <button className="gbtn" onClick={toggle} aria-label="Guide">
        ✦
      </button>
    </div>
  );
}
