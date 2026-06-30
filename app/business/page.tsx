'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import VoiceRecorder from '@/components/VoiceRecorder';
import { getFamilyContext, loadBusiness, saveBusiness } from '@/lib/familyStore';

/**
 * Feature Set I — Family Business Legacy. A dedicated module for business
 * families: founder story, company timeline, business values, major decisions,
 * lessons for the next generation, and the family enterprise archive. Feeds the
 * main Timeline + Map; the LinkedIn import (Set C) populates career data here.
 *
 * Persisted to sessionStorage in degraded mode (the `businesses` table is the
 * real store once Supabase is wired).
 */

interface TimelineEntry { year: string; title: string; note?: string }
interface Decision { title: string; thinking: string; by: string }
interface BusinessData {
  name: string;
  founder: string;
  foundedYear: string;
  founderStory: string;
  timeline: TimelineEntry[];
  values: string[];
  decisions: Decision[];
  lessons: string[];
}

const KEY = 'ank-business';
const SEED: BusinessData = {
  name: 'Ellis & Sons',
  founder: 'Margaret Ellis',
  foundedYear: '1974',
  founderStory: 'She opened the shop with one oven and a borrowed counter, and never advertised — the bread spoke for itself.',
  timeline: [
    { year: '1974', title: 'The shop opens', note: 'One oven, one recipe.' },
    { year: '1989', title: 'Second branch', note: 'The town outgrew the first.' },
    { year: '2003', title: 'Passed to the next generation', note: 'The children took the keys.' },
  ],
  values: ['Quality over speed', 'Treat staff as family', 'Never owe what you cannot repay'],
  decisions: [
    { title: 'Refused to franchise in 1995', thinking: 'Growth would have cost the quality the name was built on.', by: 'Margaret Ellis' },
  ],
  lessons: ['Keep the recipes, but let each generation add one of their own.'],
};

export default function BusinessPage() {
  const router = useRouter();
  const [data, setData] = useState<BusinessData>(SEED);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const ctx = await getFamilyContext();
      if (ctx && active) {
        setFamilyId(ctx.familyId);
        const rec = await loadBusiness();
        // Show the saved record; empty until they fill it in (no demo seed).
        if (active) setData(rec ?? { name: '', founder: '', foundedYear: '', founderStory: '', timeline: [], values: [], decisions: [], lessons: [] });
        return;
      }
      try {
        const raw = sessionStorage.getItem(KEY);
        if (raw && active) setData(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function update(next: BusinessData) {
    setData(next);
    if (familyId) {
      // Debounce DB writes while the owner types.
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void saveBusiness(familyId, next), 600);
    } else {
      try {
        sessionStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
  }

  // Simple add-helpers.
  const [newValue, setNewValue] = useState('');
  const [newLesson, setNewLesson] = useState('');
  const [tl, setTl] = useState({ year: '', title: '', note: '' });
  const [dec, setDec] = useState({ title: '', thinking: '', by: '' });

  return (
    <div className="dash" style={{ maxWidth: 640 }}>
      <button className="bb" style={{ marginBottom: 16 }} onClick={() => router.push('/archive')}>
        ← Archive
      </button>
      <div className="dname serif" style={{ fontSize: 30, marginBottom: 2 }}>
        The family enterprise
      </div>
      <div className="dsub" style={{ marginBottom: 16 }}>
        How it began, what it stood for, the choices that shaped it — and what it leaves to whoever
        inherits it next.
      </div>

      {/* Founder story */}
      <div className="swrap" style={{ marginBottom: 14 }}>
        <div className="shead">
          <div className="sav"><i className="ti ti-building-store" /></div>
          <div>
            <input
              className="fi2"
              style={{ border: 'none', fontFamily: 'var(--font-cormorant)', fontSize: 21, padding: 0, background: 'transparent' }}
              value={data.name}
              onChange={(e) => update({ ...data, name: e.target.value })}
            />
            <div className="smeta">
              Founded {data.foundedYear} · by {data.founder}
            </div>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <div className="slbl" style={{ marginTop: 0 }}>Founder&apos;s story</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
            <input className="fi2" placeholder="Founder name" value={data.founder} onChange={(e) => update({ ...data, founder: e.target.value })} />
            <input className="fi2" placeholder="Founded year" value={data.foundedYear} onChange={(e) => update({ ...data, foundedYear: e.target.value })} />
          </div>
          <VoiceRecorder id="founder-story" label="Speak the founder's story" demoText={SEED.founderStory} onTranscript={(t) => update({ ...data, founderStory: t })} />
          <textarea className="fta" rows={3} value={data.founderStory} onChange={(e) => update({ ...data, founderStory: e.target.value })} placeholder="How the business began…" />
        </div>
      </div>

      {/* Company timeline */}
      <div className="slbl">Company timeline</div>
      <div className="tout" style={{ padding: '14px 18px' }}>
        <div className="tl">
          {data.timeline.map((t, i) => (
            <div className="tli" key={i}>
              <div className="tly">{t.year}</div>
              <div className="tlt">{t.title}</div>
              {t.note && <div className="tld">{t.note}</div>}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: 8, marginTop: 12 }}>
          <input className="fi2" placeholder="Year" value={tl.year} onChange={(e) => setTl({ ...tl, year: e.target.value })} />
          <input className="fi2" placeholder="Milestone" value={tl.title} onChange={(e) => setTl({ ...tl, title: e.target.value })} />
        </div>
        <input className="fi2" placeholder="A note (optional)" style={{ marginTop: 8 }} value={tl.note} onChange={(e) => setTl({ ...tl, note: e.target.value })} />
        <button
          className="bb"
          style={{ marginTop: 8 }}
          onClick={() => {
            if (!tl.year && !tl.title) return;
            update({ ...data, timeline: [...data.timeline, tl].sort((a, b) => Number(a.year) - Number(b.year)) });
            setTl({ year: '', title: '', note: '' });
          }}
        >
          + Add milestone
        </button>
      </div>

      {/* Business values */}
      <div className="slbl">Business values</div>
      <div className="tout" style={{ padding: 18 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {data.values.map((v, i) => (
            <span key={i} className="stag" style={{ background: 'var(--g5)', display: 'flex', gap: 6, alignItems: 'center' }}>
              {v}
              <span style={{ cursor: 'pointer', color: 'var(--ink4)' }} onClick={() => update({ ...data, values: data.values.filter((_, j) => j !== i) })}>✕</span>
            </span>
          ))}
        </div>
        <div className="irow" style={{ padding: 0, borderTop: 'none' }}>
          <input className="iin" placeholder="A principle the enterprise was built on…" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
          <button
            className="ibtn"
            onClick={() => {
              if (!newValue.trim()) return;
              update({ ...data, values: [...data.values, newValue.trim()] });
              setNewValue('');
            }}
          >
            Add
          </button>
        </div>
        <div className="enote" style={{ marginTop: 10 }}>
          <i className="ti ti-link" style={{ color: 'var(--g)' }} /> These connect to your{' '}
          <b style={{ cursor: 'pointer', color: 'var(--g3)' }} onClick={() => router.push('/values')}>family values</b>.
        </div>
      </div>

      {/* Major decisions */}
      <div className="slbl">Major decisions</div>
      <div className="tout" style={{ padding: 18 }}>
        {data.decisions.map((d, i) => (
          <div key={i} style={{ marginBottom: 12, borderLeft: '2px solid var(--g2)', paddingLeft: 12 }}>
            <div style={{ fontWeight: 500, fontSize: 13 }}>{d.title}</div>
            <div style={{ fontSize: 12, color: 'var(--ink3)', fontWeight: 300, lineHeight: 1.6 }}>{d.thinking}</div>
            <div style={{ fontSize: 11, color: 'var(--g3)' }}>— {d.by}</div>
          </div>
        ))}
        <input className="fi2" placeholder="The decision" value={dec.title} onChange={(e) => setDec({ ...dec, title: e.target.value })} />
        <textarea className="fta" rows={2} style={{ marginTop: 8 }} placeholder="The thinking behind it…" value={dec.thinking} onChange={(e) => setDec({ ...dec, thinking: e.target.value })} />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input className="fi2" placeholder="Decided by…" value={dec.by} onChange={(e) => setDec({ ...dec, by: e.target.value })} />
          <button
            className="ibtn"
            onClick={() => {
              if (!dec.title.trim()) return;
              update({ ...data, decisions: [...data.decisions, dec] });
              setDec({ title: '', thinking: '', by: '' });
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Lessons for the next generation */}
      <div className="slbl">Lessons for the next generation</div>
      <div className="tout" style={{ padding: 18 }}>
        {data.lessons.map((l, i) => (
          <div className="squote" key={i} style={{ marginTop: i === 0 ? 0 : 10 }}>{l}</div>
        ))}
        <div className="irow" style={{ padding: '12px 0 0', borderTop: 'none' }}>
          <input className="iin" placeholder="What whoever inherits should know…" value={newLesson} onChange={(e) => setNewLesson(e.target.value)} />
          <button
            className="ibtn"
            onClick={() => {
              if (!newLesson.trim()) return;
              update({ ...data, lessons: [...data.lessons, newLesson.trim()] });
              setNewLesson('');
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Enterprise archive */}
      <div className="slbl">Family enterprise archive</div>
      <div className="tout" style={{ padding: 18 }}>
        <div className="fsub" style={{ marginBottom: 12 }}>
          Documents, logos, photos, press, and key contracts — kept in the Memory Vault, tagged
          &ldquo;business&rdquo;.
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="ibtn" onClick={() => router.push('/album')}>
            <i className="ti ti-folder" /> Open the archive
          </button>
          <button className="bb" style={{ padding: '9px 14px', fontSize: 12 }} onClick={() => router.push('/import')}>
            <i className="ti ti-brand-linkedin" /> Import career history
          </button>
          <button className="bb" style={{ padding: '9px 14px', fontSize: 12 }} onClick={() => router.push('/map')}>
            <i className="ti ti-map-pin" /> Pin business locations
          </button>
        </div>
      </div>
    </div>
  );
}
