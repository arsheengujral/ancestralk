'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import VoiceRecorder from '@/components/VoiceRecorder';
import { buildCorpus } from '@/lib/askCorpus';

/**
 * Feature Set G — Ask your family archive. A warm search/chat that answers ONLY
 * from the family's own content (never invented), with citations back to the
 * source. Framed as "ask your family archive" — never as "AI".
 */

interface Citation {
  title: string;
  href: string;
  type: string;
}
interface Turn {
  question: string;
  answer: string;
  citations: Citation[];
  grounded: boolean;
}

const EXAMPLES = [
  'Who started our family business?',
  'Show me everything about Dubai.',
  'What are our family values?',
  'Show our migration history.',
  'What did the elders advise?',
];

export default function AskPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || loading) return;
    setLoading(true);
    setQ('');
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, corpus: buildCorpus() }),
      });
      const data = await res.json();
      setTurns((t) => [
        ...t,
        { question: text, answer: data.answer ?? '', citations: data.citations ?? [], grounded: data.grounded ?? false },
      ]);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } finally {
      setLoading(false);
    }
  }

  function readAloud(text: string) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {
      /* not supported */
    }
  }

  return (
    <div className="fw" style={{ maxWidth: 620 }}>
      <button className="bb" style={{ marginBottom: 16 }} onClick={() => router.push('/archive')}>
        ← Archive
      </button>
      <div className="fey">YOUR FAMILY ARCHIVE</div>
      <div className="ftit serif">Ask your family</div>
      <div className="fsub">
        Ask anything about your family&apos;s story — people, places, values, business, journeys.
        Every answer comes only from what your family has saved. Nothing is ever invented.
      </div>

      {turns.length === 0 && (
        <div style={{ marginBottom: 18 }}>
          <div className="slbl" style={{ marginTop: 0 }}>Try asking</div>
          <div className="sug-c">
            {EXAMPLES.map((e) => (
              <button key={e} className="schip" onClick={() => ask(e)}>
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {turns.map((t, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <div
            style={{ background: 'var(--g)', color: 'var(--w)', padding: '10px 14px', borderRadius: '14px 14px 4px 14px', fontSize: 13, marginLeft: 'auto', maxWidth: '85%', width: 'fit-content', marginBottom: 8 }}
          >
            {t.question}
          </div>
          <div className="swrap" style={{ padding: 16 }}>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.7, color: 'var(--ink2)', fontWeight: 300 }}>
              {t.answer}
            </div>
            {t.citations.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div className="slbl" style={{ marginTop: 0, marginBottom: 6 }}>From</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {t.citations.map((c, j) => (
                    <button key={j} className="schip" onClick={() => router.push(c.href)}>
                      <i className="ti ti-link" style={{ fontSize: 11, marginRight: 4 }} />
                      {c.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button className="bb" style={{ marginTop: 12, fontSize: 12, padding: '6px 12px' }} onClick={() => readAloud(t.answer)}>
              <i className="ti ti-volume" /> Read aloud
            </button>
          </div>
        </div>
      ))}

      {loading && (
        <div className="swrap" style={{ padding: 16, marginBottom: 16, color: 'var(--ink3)', fontStyle: 'italic', fontSize: 13 }}>
          Looking through your family&apos;s archive…
        </div>
      )}

      <div ref={endRef} />

      <div className="tout" style={{ padding: 14, position: 'sticky', bottom: 16 }}>
        <VoiceRecorder id="ask" label="Speak your question" demoText="What are our family values" onTranscript={setQ} />
        <div className="irow" style={{ padding: 0, borderTop: 'none', marginTop: 6 }}>
          <input
            className="iin"
            placeholder="Ask your family archive…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask(q)}
          />
          <button className="ibtn" onClick={() => ask(q)} disabled={loading}>
            Ask
          </button>
        </div>
      </div>

      <div className="ibox" style={{ marginTop: 14 }}>
        <i className="ti ti-shield-lock" /> Answers are drawn only from your family&apos;s own archive
        and never leave it. If something isn&apos;t there, you&apos;ll be told — never guessed.
      </div>
    </div>
  );
}
