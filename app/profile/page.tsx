'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFlow } from '@/components/FlowProvider';
import VoicePlayback from '@/components/VoicePlayback';
import {
  BIO_VERSIONS,
  LANGUAGES,
  type BioVersionId,
  type BioContent,
} from '@/lib/bioVersions';

/**
 * A person's profile with the six biography versions (Feature Set E) and the
 * personal / professional chapter tabs (Feature Set C). Each version generates
 * on demand and is independently editable; all respect the chosen language.
 */

type VersionStore = Partial<Record<BioVersionId, BioContent>>;
const KEY = 'ank-bio-versions';

export default function ProfilePage() {
  const router = useRouter();
  const { state, ini } = useFlow();

  const [chapterType, setChapterType] = useState<'personal' | 'professional'>('personal');
  const [version, setVersion] = useState<BioVersionId>('full');
  const [language, setLanguage] = useState('en');
  const [store, setStore] = useState<VersionStore>({});
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const hasPerson = Boolean(state.name);
  const firstName = (state.name || 'This person').split(' ')[0];

  // Hydrate any previously generated versions.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setStore(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  function persist(next: VersionStore) {
    setStore(next);
    try {
      sessionStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  // Seed the "full" version from the chapter generated during onboarding.
  useEffect(() => {
    if (!store.full && state.chapter) {
      persist({ ...store, full: state.chapter });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.chapter]);

  async function generate(v: BioVersionId) {
    setLoading(true);
    try {
      const res = await fetch('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.name, year: state.year, town: state.town, known: state.known,
          q1: state.q1, q2: state.q2, q3: state.q3, q4: state.q4, q5: state.q5,
          who: state.who, language, version: v,
        }),
      });
      const data = (await res.json()) as BioContent;
      persist({ ...store, [v]: data });
    } finally {
      setLoading(false);
    }
  }

  const current = store[version];

  function updateBody(text: string) {
    if (!current) return;
    persist({
      ...store,
      [version]: { ...current, bodyParagraphs: text.split(/\n\n+/).filter(Boolean) },
    });
  }

  if (!hasPerson) {
    return (
      <div className="fw" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div className="ftit serif">No one to show yet</div>
        <div className="fsub">Begin a family member to see their profile and chapters.</div>
        <button className="bp" onClick={() => router.push('/begin')}>
          Begin a family member ✦
        </button>
      </div>
    );
  }

  return (
    <div className="dash" style={{ maxWidth: 640 }}>
      <button className="bb" style={{ marginBottom: 16 }} onClick={() => router.push('/archive')}>
        ← Archive
      </button>

      <div className="swrap" style={{ marginBottom: 14 }}>
        <div className="shead">
          <div className="sav">{state.photo ? <img src={state.photo} alt="" /> : ini}</div>
          <div>
            <div className="sname">{state.name}</div>
            <div className="smeta">
              {state.year ? `b. ${state.year}` : ''}
              {state.town ? `${state.year ? ' · ' : ''}${state.town}` : ''}
            </div>
          </div>
        </div>

        {/* Personal / Professional chapter tabs (Set C) */}
        <div className="stabs">
          <button className={`stab${chapterType === 'personal' ? ' on' : ''}`} onClick={() => setChapterType('personal')}>
            Personal
          </button>
          <button className={`stab${chapterType === 'professional' ? ' on' : ''}`} onClick={() => setChapterType('professional')}>
            Professional
          </button>
        </div>

        {Object.keys(state.recs).length > 0 && (
          <VoicePlayback variant="dark" label={`${state.name}'s voice`} bars={20} />
        )}
      </div>

      {chapterType === 'professional' ? (
        <div className="tout" style={{ padding: 20 }}>
          <div className="slbl" style={{ marginTop: 0 }}>Professional legacy</div>
          <div className="fsub" style={{ marginBottom: 14 }}>
            {firstName}&apos;s career, education, and achievements — the legacy of what they built.
            Bring this in automatically from a LinkedIn export.
          </div>
          <button className="bp" onClick={() => router.push('/import')}>
            Build from LinkedIn import →
          </button>
        </div>
      ) : (
        <>
          {/* Language */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span className="fl" style={{ margin: 0 }}>Language</span>
            <select
              className="lang-sel"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                persist({}); // language change invalidates generated versions
              }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Six version tabs */}
          <div className="stabs" style={{ borderRadius: 'var(--rl)', flexWrap: 'wrap' }}>
            {BIO_VERSIONS.map((v) => (
              <button
                key={v.id}
                className={`stab${version === v.id ? ' on' : ''}`}
                onClick={() => {
                  setVersion(v.id);
                  setEditing(false);
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="swrap" style={{ marginTop: 12 }}>
            <div style={{ padding: '14px 20px 0' }}>
              <div className="fsub" style={{ marginBottom: 8 }}>
                {BIO_VERSIONS.find((v) => v.id === version)?.blurb}
              </div>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink3)' }}>
                <div
                  style={{ width: 36, height: 36, border: '2px solid var(--paper3)', borderTopColor: 'var(--g)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px' }}
                />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <div className="serif" style={{ fontSize: 18 }}>Writing {firstName}&apos;s story…</div>
              </div>
            ) : current ? (
              <>
                {version === 'timeline' ? (
                  <div style={{ padding: 20 }}>
                    <div className="tl">
                      {current.timeline.length > 0 ? (
                        current.timeline.map((e, i) => (
                          <div className="tli" key={i}>
                            <div className="tly">{e.year}</div>
                            <div className="tlt">{e.title}</div>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: 12, color: 'var(--ink4)' }}>
                          No dated events yet — add life events to build the timeline.
                        </div>
                      )}
                    </div>
                  </div>
                ) : editing ? (
                  <div style={{ padding: 20 }}>
                    <textarea
                      className="fta"
                      rows={10}
                      value={current.bodyParagraphs.join('\n\n')}
                      onChange={(e) => updateBody(e.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <div className="sbody">
                      {current.bodyParagraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                      {current.quote && <div className="squote">{current.quote}</div>}
                    </div>
                    {current.tags.length > 0 && (
                      <div className="stags">
                        {current.tags.map((t) => (
                          <span className="stag" key={t}>{t}</span>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <div style={{ display: 'flex', gap: 8, padding: '0 20px 18px' }}>
                  {version !== 'timeline' && (
                    <button className="bb" onClick={() => setEditing((e) => !e)}>
                      {editing ? 'Done editing' : 'Edit'}
                    </button>
                  )}
                  <button className="bb" onClick={() => generate(version)}>
                    Regenerate
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: 30, textAlign: 'center' }}>
                <div className="fsub" style={{ marginBottom: 14 }}>
                  This version hasn&apos;t been written yet.
                </div>
                <button className="bp" onClick={() => generate(version)}>
                  Write the {BIO_VERSIONS.find((v) => v.id === version)?.label.toLowerCase()} ✦
                </button>
              </div>
            )}
          </div>

          <div className="enote" style={{ marginTop: 14 }}>
            <i className="ti ti-pencil" style={{ color: 'var(--g)' }} /> Each version is independently
            editable and regenerates on demand. Nothing is changed without your permission.
          </div>
        </>
      )}
    </div>
  );
}
