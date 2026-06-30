'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VoiceRecorder from '@/components/VoiceRecorder';
import {
  TRADITION_SECTIONS,
  type TraditionItem,
  type TraditionType,
} from '@/lib/traditions';
import { getFamilyContext, loadTraditions, addTradition, removeTradition } from '@/lib/familyStore';

/**
 * Feature Set F — Family Values & Traditions. The soul of the archive, separate
 * from individual stories: principles, traditions/rituals, recipes, elder advice,
 * and a "What our family stands for" page auto-composed from them all (suitable
 * for the printed book's opening).
 *
 * Each item is voice- or text-entered, attributable, taggable, editable. Reads
 * in the active design theme; persisted to sessionStorage in degraded mode (the
 * `traditions` table is the real store once Supabase is wired).
 */

type View = TraditionType | 'summary';
const KEY = 'ank-traditions';

const SEED: TraditionItem[] = [
  { id: 's1', type: 'principle', title: 'We show up', body: 'When someone in this family is in trouble, everyone comes — no questions asked.', author: 'Grandfather', tags: ['loyalty', 'family'] },
  { id: 's2', type: 'tradition', title: 'Sunday table', body: 'Every Sunday the whole family eats together, phones away, the eldest serves first.', author: 'Mother', tags: ['ritual', 'gathering'] },
];

export default function ValuesPage() {
  const router = useRouter();
  const [view, setView] = useState<View>('principle');
  const [items, setItems] = useState<TraditionItem[]>(SEED);
  const [familyId, setFamilyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const ctx = await getFamilyContext();
      if (ctx && active) {
        // Database is the source of truth when signed in.
        setFamilyId(ctx.familyId);
        const rows = await loadTraditions();
        if (active) setItems(rows);
        return;
      }
      try {
        const raw = sessionStorage.getItem(KEY);
        if (raw && active) setItems(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function persistLocal(next: TraditionItem[]) {
    setItems(next);
    try {
      sessionStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  async function add(item: TraditionItem) {
    if (familyId) {
      const id = await addTradition(familyId, item);
      setItems((cur) => [...cur, { ...item, id: id ?? item.id }]);
    } else {
      persistLocal([...items, item]);
    }
  }

  function remove(id: string) {
    if (familyId) {
      void removeTradition(id);
      setItems((cur) => cur.filter((i) => i.id !== id));
    } else {
      persistLocal(items.filter((i) => i.id !== id));
    }
  }

  return (
    <div className="dash" style={{ maxWidth: 640 }}>
      <button className="bb" style={{ marginBottom: 16 }} onClick={() => router.push('/archive')}>
        ← Archive
      </button>
      <div className="dname serif" style={{ fontSize: 30, marginBottom: 2 }}>
        What our family stands for
      </div>
      <div className="dsub" style={{ marginBottom: 16 }}>
        The beliefs, traditions, recipes, and wisdom that make this family itself — kept apart from
        any one person&apos;s story.
      </div>

      <div className="atabs">
        {TRADITION_SECTIONS.map((s) => (
          <button key={s.type} className={`atab${view === s.type ? ' on' : ''}`} onClick={() => setView(s.type)}>
            {s.label.split(' ')[0]}
          </button>
        ))}
        <button className={`atab${view === 'summary' ? ' on' : ''}`} onClick={() => setView('summary')}>
          Stands for
        </button>
      </div>

      {view === 'summary' ? (
        <SummaryPage items={items} />
      ) : (
        <SectionView
          type={view}
          items={items.filter((i) => i.type === view)}
          onAdd={add}
          onRemove={remove}
        />
      )}
    </div>
  );
}

function SectionView({
  type,
  items,
  onAdd,
  onRemove,
}: {
  type: TraditionType;
  items: TraditionItem[];
  onAdd: (i: TraditionItem) => void;
  onRemove: (id: string) => void;
}) {
  const section = TRADITION_SECTIONS.find((s) => s.type === type)!;
  const isRecipe = type === 'recipe';

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [method, setMethod] = useState('');
  const [occasion, setOccasion] = useState('');

  function submit() {
    if (!title.trim() && !body.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      type,
      title: title.trim() || section.label,
      body: body.trim(),
      author: author.trim() || 'Unattributed',
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      ...(isRecipe ? { ingredients: ingredients.trim(), method: method.trim(), occasion: occasion.trim() } : {}),
    });
    setTitle(''); setBody(''); setAuthor(''); setTags(''); setIngredients(''); setMethod(''); setOccasion('');
  }

  return (
    <>
      <div className="slbl">{section.label}</div>
      <div className="fsub" style={{ marginBottom: 14 }}>
        {section.blurb}
      </div>

      {items.length === 0 && (
        <div className="enote" style={{ marginBottom: 14 }}>
          <i className="ti ti-sparkles" style={{ color: 'var(--g)' }} /> Nothing here yet — add the
          first one below.
        </div>
      )}

      {items.map((it) => (
        <div className="tout" key={it.id} style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="serif" style={{ fontSize: 18 }}>{it.title}</div>
            <button className="bb" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => onRemove(it.id)}>
              Remove
            </button>
          </div>
          {it.body && <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.7, margin: '6px 0', fontWeight: 300 }}>{it.body}</div>}
          {it.type === 'recipe' && (it.ingredients || it.method) && (
            <div style={{ fontSize: 12, color: 'var(--ink3)', fontWeight: 300, lineHeight: 1.6 }}>
              {it.ingredients && <div><b style={{ color: 'var(--g3)' }}>Ingredients:</b> {it.ingredients}</div>}
              {it.method && <div><b style={{ color: 'var(--g3)' }}>Method:</b> {it.method}</div>}
              {it.occasion && <div><b style={{ color: 'var(--g3)' }}>Occasion:</b> {it.occasion}</div>}
            </div>
          )}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
            <span className="stag">— {it.author}</span>
            {it.tags.map((t) => (
              <span className="stag" key={t} style={{ background: 'var(--g5)' }}>{t}</span>
            ))}
          </div>
        </div>
      ))}

      <div className="tout" style={{ padding: 18 }}>
        <div className="slbl" style={{ marginTop: 0 }}>Add to {section.label.toLowerCase()}</div>
        <div className="field">
          <label className="fl">Title</label>
          <input className="fi2" placeholder={section.placeholder} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label className="fl">{isRecipe ? 'The story behind it' : 'In their words'}</label>
          <VoiceRecorder id={`trad-${type}`} label="Speak" demoText={section.placeholder} onTranscript={setBody} />
          <textarea className="fta" rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Speak or type…" />
        </div>
        {isRecipe && (
          <>
            <div className="field">
              <label className="fl">Ingredients</label>
              <textarea className="fta" rows={2} value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="Flour, water, patience…" />
            </div>
            <div className="field">
              <label className="fl">Method</label>
              <textarea className="fta" rows={2} value={method} onChange={(e) => setMethod(e.target.value)} placeholder="How it's made…" />
            </div>
            <div className="field">
              <label className="fl">Occasion</label>
              <input className="fi2" value={occasion} onChange={(e) => setOccasion(e.target.value)} placeholder="Eid, Sunday mornings…" />
            </div>
          </>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label className="fl">Who said / made it</label>
            <input className="fi2" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Grandmother, Dad…" />
          </div>
          <div className="field">
            <label className="fl">Tags (comma-separated)</label>
            <input className="fi2" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="kindness, ritual…" />
          </div>
        </div>
        <button className="bp" onClick={submit}>
          Add ✦
        </button>
      </div>
    </>
  );
}

function SummaryPage({ items }: { items: TraditionItem[] }) {
  const byType = (t: TraditionType) => items.filter((i) => i.type === t);
  const principles = byType('principle');
  const traditions = byType('tradition');
  const recipes = byType('recipe');
  const advice = byType('advice');

  return (
    <div className="swrap" style={{ padding: 26 }}>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 20, color: 'var(--g)' }}>✦</div>
        <div className="serif" style={{ fontSize: 26 }}>What our family stands for</div>
        <div style={{ fontSize: 11, color: 'var(--ink3)', fontWeight: 300 }}>
          Composed from everything above — the opening page of your book.
        </div>
      </div>

      {principles.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="slbl" style={{ marginTop: 0 }}>We believe</div>
          {principles.map((p) => (
            <div key={p.id} className="serif" style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink2)', marginBottom: 6 }}>
              “{p.body || p.title}” <span style={{ fontSize: 11, color: 'var(--ink4)', fontStyle: 'italic' }}>— {p.author}</span>
            </div>
          ))}
        </div>
      )}

      {traditions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="slbl">We gather</div>
          {traditions.map((t) => (
            <div key={t.id} style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 300, lineHeight: 1.7, marginBottom: 4 }}>
              <b>{t.title}.</b> {t.body}
            </div>
          ))}
        </div>
      )}

      {recipes.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="slbl">We cook</div>
          {recipes.map((r) => (
            <div key={r.id} style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 300, marginBottom: 4 }}>
              <b>{r.title}</b>{r.occasion ? ` · ${r.occasion}` : ''} — {r.author}
            </div>
          ))}
        </div>
      )}

      {advice.length > 0 && (
        <div>
          <div className="slbl">We remember</div>
          {advice.map((a) => (
            <div key={a.id} className="squote" style={{ marginTop: 6 }}>
              {a.body || a.title} <span style={{ fontSize: 11, color: 'var(--ink4)' }}>— {a.author}</span>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--ink4)', textAlign: 'center' }}>
          Add principles, traditions, recipes, and advice — this page composes itself from them.
        </div>
      )}
    </div>
  );
}
