'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFamilyContext, quickAddMember } from '@/lib/familyStore';

/**
 * Step-by-step family-tree builder (per feedback: make it much easier).
 * Walks through relationships one group at a time — Me → Parents → Siblings →
 * Grandparents → Aunts & uncles → Cousins → Spouse → Children — with a quick
 * add (name + optional year + optional photo) at each step.
 *
 * Keeps it simple to start; deeper couple/parent linking after marriage builds
 * on this. Requires an account (data is saved as you go).
 */

const STEPS: { key: string; title: string; blurb: string; single?: boolean }[] = [
  { key: 'myself', title: 'Start with you', blurb: 'Add yourself first — the centre of the tree.', single: true },
  { key: 'parent_you', title: 'Your parents', blurb: 'Add your mother and father.' },
  { key: 'sibling', title: 'Your siblings', blurb: 'Brothers and sisters.' },
  { key: 'grandparent', title: 'Grandparents', blurb: "Your parents' parents, on both sides." },
  { key: 'aunt_uncle', title: 'Aunts & uncles', blurb: "Your parents' brothers and sisters." },
  { key: 'cousin', title: 'Cousins', blurb: 'Your aunts’ and uncles’ children.' },
  { key: 'spouse', title: 'Spouse or partner', blurb: 'Your husband, wife, or partner.' },
  { key: 'child', title: 'Your children', blurb: 'Your sons and daughters.' },
];

export default function TreeBuilderPage() {
  const router = useRouter();
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [added, setAdded] = useState<Record<string, string[]>>({});
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getFamilyContext().then((ctx) => ctx && setFamilyId(ctx.familyId));
  }, []);

  const step = STEPS[stepIdx];
  const list = added[step.key] ?? [];

  async function add() {
    if (!name.trim() || !familyId) return;
    setBusy(true);
    try {
      await quickAddMember(familyId, { name: name.trim(), relationship: step.key, birthYear: year, photo });
      setAdded((a) => ({ ...a, [step.key]: [...(a[step.key] ?? []), name.trim()] }));
      setName('');
      setYear('');
      setPhoto(null);
      if (fileRef.current) fileRef.current.value = '';
    } finally {
      setBusy(false);
    }
  }

  const last = stepIdx === STEPS.length - 1;

  return (
    <div className="fw">
      <button className="bb" style={{ marginBottom: 16 }} onClick={() => router.push('/archive')}>
        ← Archive
      </button>
      <div className="prog">
        {STEPS.map((_, i) => (
          <div key={i} className={`pd${i < stepIdx ? ' done' : i === stepIdx ? ' act' : ''}`} />
        ))}
      </div>
      <div style={{ height: 18 }} />

      <div className="fey">
        STEP {stepIdx + 1} OF {STEPS.length}
      </div>
      <div className="ftit serif">{step.title}</div>
      <div className="fsub">{step.blurb}</div>

      {!familyId && (
        <div className="ibox">
          <i className="ti ti-info-circle" /> Sign in to save your tree as you build it.
        </div>
      )}

      {list.length > 0 && (
        <div className="tout" style={{ padding: '10px 16px', marginBottom: 12 }}>
          {list.map((n, i) => (
            <div key={i} style={{ fontSize: 13, padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-check" style={{ color: 'var(--g)' }} /> {n}
            </div>
          ))}
        </div>
      )}

      {!(step.single && list.length >= 1) && (
        <div className="tout" style={{ padding: 18, marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 8 }}>
            <input className="fi2" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="fi2" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} id="tb-photo" />
          <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
            <button className="bb" style={{ padding: '9px 14px', fontSize: 12 }} onClick={() => fileRef.current?.click()}>
              <i className="ti ti-camera" /> {photo ? photo.name.slice(0, 16) : 'Photo (optional)'}
            </button>
            <button className="bp" style={{ flex: 1 }} disabled={!name.trim() || busy} onClick={add}>
              {busy ? 'Adding…' : `Add ${step.single ? 'me' : 'to the tree'} ✦`}
            </button>
          </div>
        </div>
      )}

      <div className="brow">
        {stepIdx > 0 && (
          <button className="bb" onClick={() => setStepIdx(stepIdx - 1)}>
            Back
          </button>
        )}
        <button
          className="bp"
          onClick={() => (last ? router.push('/archive') : setStepIdx(stepIdx + 1))}
        >
          {last ? 'Done — see your tree ✦' : list.length ? 'Next →' : 'Skip →'}
        </button>
      </div>

      <div className="ibox" style={{ marginTop: 16 }}>
        <i className="ti ti-heart-handshake" /> After marriage, you&apos;ll be able to link a
        spouse&apos;s family — connecting them and their children into your tree.
      </div>
    </div>
  );
}
