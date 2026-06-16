'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import VideoTutorial from '@/components/VideoTutorial';
import { TUTORIALS } from '@/lib/tutorials';

/**
 * Feature Set D — the "How it works" library. Short tutorial cards, each with a
 * demo player, a one-line description, and a "Try it now" deep link to that
 * feature. A `?topic=` query (from the contextual "?" buttons) opens that card.
 */
function LearnContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get('topic');
  const [open, setOpen] = useState<string | null>(initial ?? TUTORIALS[0].id);

  return (
    <div className="dash" style={{ maxWidth: 760 }}>
      <button className="bb" style={{ marginBottom: 16 }} onClick={() => router.push('/archive')}>
        ← Archive
      </button>
      <div className="dname serif" style={{ fontSize: 30, marginBottom: 2 }}>
        How it works
      </div>
      <div className="dsub" style={{ marginBottom: 18 }}>
        Short guides for everything — watch a demo, then try it yourself.
      </div>

      {TUTORIALS.map((t) => {
        const isOpen = open === t.id;
        return (
          <div className="tout" key={t.id} style={{ padding: 0, overflow: 'hidden' }}>
            <div
              className="thead"
              style={{ cursor: 'pointer' }}
              onClick={() => setOpen(isOpen ? null : t.id)}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="fi-icon" style={{ margin: 0, width: 34, height: 34 }}>
                  <i className={`ti ${t.icon}`} />
                </div>
                <div>
                  <div className="ttitle">{t.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink3)', fontWeight: 300 }}>{t.description}</div>
                </div>
              </div>
              <i className={`ti ti-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: 'var(--ink4)' }} />
            </div>
            {isOpen && (
              <div style={{ padding: 18 }}>
                <VideoTutorial src={t.src} title={t.title} steps={t.steps} icon={t.icon} />
                <button className="bp" style={{ marginTop: 14 }} onClick={() => router.push(t.href)}>
                  Try it now ✦
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="dash">Loading…</div>}>
      <LearnContent />
    </Suspense>
  );
}
