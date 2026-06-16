'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * First-run interactive walkthrough for brand-new families (Feature Set D).
 * Five warm steps highlighting the things that matter most — record, tree,
 * invite, future messages, and designs. Shows once (localStorage flag); a step
 * can deep-link straight into that feature.
 */

// A complete, skippable, replayable tour of the whole app (Phase 3 must-have #3).
const STEPS = [
  { icon: 'ti-microphone', title: 'Speak a story', body: 'Every question can be answered by voice — in any of 17 languages. We keep their exact words, forever.', href: '/begin', cta: 'Record a story' },
  { icon: 'ti-git-fork', title: 'Grow your family tree', body: 'Each branch holds a full chapter, photos, and a life timeline. Tap a “+” to add anyone.', href: '/archive', cta: 'See the tree' },
  { icon: 'ti-photos', title: 'Gather photos & videos', body: 'Upload or scan old printed photos — they’re organised by person and decade automatically.', href: '/album', cta: 'Open the album' },
  { icon: 'ti-book-2', title: 'Compose your book', body: 'Flip through a living book of chapters and media, then order it in print with QR codes that play voices.', href: '/book', cta: 'Open the Book Studio' },
  { icon: 'ti-clock', title: 'Write to the future', body: 'Seal a letter until a grandchild’s 18th birthday. Delivered, decades from now.', href: '/future', cta: 'Write a letter' },
  { icon: 'ti-map-2', title: 'Map your journeys', body: 'Birthplaces, homes, and migration routes — watch your family spread across the world.', href: '/map', cta: 'Open the map' },
  { icon: 'ti-heart-handshake', title: 'Keep your values', body: 'Principles, traditions, recipes, and elder wisdom — the soul of the family, in one place.', href: '/values', cta: 'Open Values' },
  { icon: 'ti-message-circle-search', title: 'Ask your archive', body: 'Ask anything about your family — answers come only from what you’ve saved. Never invented.', href: '/ask', cta: 'Ask a question' },
  { icon: 'ti-users', title: 'Invite your family', body: 'A sister in Dubai, a cousin in Toronto — each adds their own chapter, in their own voice.', href: '/collaborate', cta: 'Invite family' },
  { icon: 'ti-palette', title: 'Make it beautiful', body: 'Choose from 20 designs — your tree, book, and printed album all re-skin instantly.', href: '/designs', cta: 'Choose a design' },
  { icon: 'ti-infinity', title: 'Pass it on', body: 'Decide how the archive lives on across generations. It’s built to outlive us all.', href: '/legacy', cta: 'Set the legacy plan' },
  { icon: 'ti-settings', title: 'Settings & languages', body: 'Your plan, 17 languages, privacy, export, and everything else — all in one calm place.', href: '/settings', cta: 'Open settings' },
];

const KEY = 'ank-walkthrough-seen';

export default function Walkthrough() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Open on first run, or whenever replayed via ?tour=1.
    const replay = typeof window !== 'undefined' && window.location.search.includes('tour=1');
    try {
      if (replay || !localStorage.getItem(KEY)) {
        setStep(0);
        setOpen(true);
      }
    } catch {
      if (replay) setOpen(true);
    }
  }, []);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* ignore */
    }
  }

  function goto(href: string) {
    close();
    router.push(href);
  }

  if (!open) return null;
  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div className="sov show" style={{ zIndex: 700 }}>
      <motion.div
        className="smod"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 400 }}
      >
        <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--g)', marginBottom: 14 }}>
          WELCOME · {step + 1} OF {STEPS.length}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="fi-icon"
              style={{ width: 52, height: 52, margin: '0 auto 14px', fontSize: 24 }}
            >
              <i className={`ti ${s.icon}`} />
            </div>
            <div className="serif" style={{ fontSize: 24, marginBottom: 8 }}>{s.title}</div>
            <div style={{ fontSize: 13, color: 'var(--ink3)', lineHeight: 1.7, fontWeight: 300, marginBottom: 18 }}>
              {s.body}
            </div>
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{ width: i === step ? 18 : 6, height: 6, borderRadius: 3, background: i === step ? 'var(--g)' : 'var(--paper3)', transition: 'all .2s' }}
            />
          ))}
        </div>

        <button className="bp" onClick={() => goto(s.href)}>
          {s.cta} ✦
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <button className="bb" style={{ padding: '8px 14px', fontSize: 12 }} onClick={close}>
            Skip
          </button>
          <button
            className="bb"
            style={{ padding: '8px 14px', fontSize: 12 }}
            onClick={() => (last ? close() : setStep(step + 1))}
          >
            {last ? 'Done' : 'Next →'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
