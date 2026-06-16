'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  'Writing to your family archive',
  'Linking to the family tree',
  'Adding to their life timeline',
  'Securing voice recordings',
  'Notifying family members',
];

type StepState = 'pending' | 'doing' | 'ok';

/**
 * The 5-step save ceremony — the emotional beat where a story becomes permanent.
 * Sequences through each step, then reveals "Saved forever ✦". Ported from the
 * prototype's runSave().
 */
export default function SaveCeremony({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [states, setStates] = useState<StepState[]>(() => STEPS.map(() => 'pending'));
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStates(STEPS.map(() => 'pending'));
    setFinished(false);

    const timers: ReturnType<typeof setTimeout>[] = [];
    [0, 850, 1700, 2550, 3400].forEach((delay, i) => {
      timers.push(
        setTimeout(() => {
          setStates((prev) => {
            const next = [...prev];
            if (i > 0) next[i - 1] = 'ok';
            next[i] = 'doing';
            return next;
          });
        }, delay),
      );
    });
    timers.push(
      setTimeout(() => {
        setStates((prev) => {
          const next = [...prev];
          next[4] = 'ok';
          return next;
        });
        setFinished(true);
      }, 4400),
    );

    return () => timers.forEach(clearTimeout);
  }, [open]);

  if (!open) return null;

  const cls = (s: StepState) =>
    s === 'ok' ? 'ssi ssi-ok' : s === 'doing' ? 'ssi ssi-d' : 'ssi ssi-p';

  return (
    <div className="sov show">
      <div className="smod">
        <div style={{ fontSize: 32, color: 'var(--g)', marginBottom: 12 }}>✦</div>
        <div className="serif" style={{ fontSize: 26, marginBottom: 4 }}>
          {finished ? 'Saved forever ✦' : 'Saving forever'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink3)', marginBottom: 20, fontWeight: 300 }}>
          Watch where everything goes
        </div>
        <div>
          {STEPS.map((label, i) => (
            <div className="ssitem" key={label}>
              <div className={cls(states[i])}>{states[i] === 'ok' ? '✓' : i + 1}</div>
              <span>{label}</span>
            </div>
          ))}
        </div>
        {finished && (
          <button className="bp" style={{ marginTop: 18 }} onClick={onClose}>
            Open the archive ✦
          </button>
        )}
      </div>
    </div>
  );
}
