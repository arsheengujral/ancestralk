'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFlow } from '@/components/FlowProvider';
import VoicePlayback from '@/components/VoicePlayback';
import { BIO_VERSIONS, type BioVersionId, type BioContent } from '@/lib/bioVersions';
import { LANGUAGES } from '@/lib/languages';
import {
  getFamilyContext,
  loadMemberWithStory,
  saveVersion,
  loadContributions,
  addContribution,
  updateMember,
  deleteMember,
  type SavedMember,
  type Contribution,
} from '@/lib/familyStore';

function initials(name: string | null | undefined): string {
  return (name ?? '').trim().split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

/**
 * A person's profile with the six biography versions (Feature Set E) and the
 * personal / professional chapter tabs (Feature Set C). Each version generates
 * on demand and is independently editable; all respect the chosen language.
 */

type VersionStore = Partial<Record<BioVersionId, BioContent>>;
const KEY = 'ank-bio-versions';

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="fw">…</div>}>
      <ProfileInner />
    </Suspense>
  );
}

function ProfileInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const { state, ini } = useFlow();

  const [chapterType, setChapterType] = useState<'personal' | 'professional'>('personal');
  const [version, setVersion] = useState<BioVersionId>('full');
  const [language, setLanguage] = useState('en');
  const [store, setStore] = useState<VersionStore>({});
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  // When signed in, the profile is loaded from the database for a saved member.
  const [dbMember, setDbMember] = useState<SavedMember | null>(null);
  const [dbRaw, setDbRaw] = useState<Record<string, string> | null>(null);
  const [dbCtx, setDbCtx] = useState<{ familyId: string; profileId: string } | null>(null);
  const [testimonials, setTestimonials] = useState<Contribution[]>([]);
  const [tAuthor, setTAuthor] = useState('');
  const [tBody, setTBody] = useState('');
  const [tSent, setTSent] = useState(false);
  // Edit / delete member (account management).
  const [editingMember, setEditingMember] = useState(false);
  const [edit, setEdit] = useState({ full_name: '', birth_year: '', hometown: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);

  function openEdit() {
    setEdit({
      full_name: dbMember?.full_name ?? '',
      birth_year: dbMember?.birth_year ?? '',
      hometown: dbMember?.hometown ?? '',
    });
    setEditingMember(true);
  }
  async function saveEditMember() {
    if (!dbCtx) return;
    await updateMember(dbCtx.profileId, edit);
    setDbMember((m) => (m ? { ...m, ...edit } : m));
    setEditingMember(false);
  }
  async function removeMember() {
    if (!dbCtx) return;
    await deleteMember(dbCtx.profileId);
    router.push('/archive');
  }

  // Subject of the page: the saved member when present, else the in-flow person.
  const subjName = dbMember?.full_name || state.name;
  const subjYear = dbMember?.birth_year ?? state.year;
  const subjTown = dbMember?.hometown ?? state.town;
  const subjKnown = dbMember?.known_for ?? state.known;
  const subjPhoto = dbMember?.photo_url || state.photo || '';
  const subjIni = dbMember ? initials(dbMember.full_name) : ini;
  const hasPerson = Boolean(subjName);
  const firstName = (subjName || 'This person').split(' ')[0];

  // Hydrate previously generated versions (sessionStorage fallback).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setStore(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  // Load the selected member + their stored versions. Re-runs when the ?id in
  // the URL changes, so opening a different person shows THAT person (Bug 2).
  useEffect(() => {
    let active = true;
    (async () => {
      let id = idParam ?? '';
      if (!id) {
        try {
          id = sessionStorage.getItem('ank-active-member') || '';
        } catch {
          /* ignore */
        }
      }
      if (!id) return;
      const ctx = await getFamilyContext();
      if (!ctx) return; // not signed in / not configured
      const loaded = await loadMemberWithStory(id);
      if (!active || !loaded) return;
      setDbMember(loaded.member);
      setDbCtx({ familyId: ctx.familyId, profileId: id });
      setDbRaw((loaded.story?.raw_answers as Record<string, string>) ?? null);
      loadContributions({ status: 'approved', profileId: id }).then((c) => active && setTestimonials(c));
      setStore(
        loaded.story?.versions && Object.keys(loaded.story.versions).length
          ? (loaded.story.versions as VersionStore)
          : {},
      );
    })();
    return () => {
      active = false;
    };
  }, [idParam]);

  function persist(next: VersionStore) {
    setStore(next);
    try {
      sessionStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  // Seed the "full" version from the in-flow onboarding chapter (only when not
  // viewing a saved member, to avoid cross-contaminating a loaded profile).
  useEffect(() => {
    if (!dbMember && !store.full && state.chapter) {
      persist({ ...store, full: state.chapter });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.chapter, dbMember]);

  async function generate(v: BioVersionId) {
    setLoading(true);
    try {
      const res = await fetch('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: subjName, year: subjYear, town: subjTown, known: subjKnown,
          answers: (dbRaw as any)?.answers ?? state.answers,
          milestones: (dbRaw as any)?.milestones ?? state.milestones,
          who: state.who, language, version: v,
        }),
      });
      const data = (await res.json()) as BioContent;
      persist({ ...store, [v]: data });
      // Save this version permanently when viewing a saved member.
      if (dbCtx) {
        try {
          await saveVersion(dbCtx.profileId, dbCtx.familyId, v, data);
        } catch (err) {
          console.error('Saving version failed:', err);
        }
      }
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
          <div className="sav">{subjPhoto ? <img src={subjPhoto} alt="" /> : subjIni}</div>
          <div>
            <div className="sname">{subjName}</div>
            <div className="smeta">
              {subjYear ? `b. ${subjYear}` : ''}
              {subjTown ? `${subjYear ? ' · ' : ''}${subjTown}` : ''}
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

        {Object.keys(state.recs).length > 0 && !dbMember && (
          <VoicePlayback variant="dark" label={`${subjName}'s voice`} bars={20} />
        )}
      </div>

      {/* Manage this member (edit details / delete) — for saved members. */}
      {dbMember && (
        <div style={{ marginBottom: 14 }}>
          {editingMember ? (
            <div className="tout" style={{ padding: 18 }}>
              <div className="slbl" style={{ marginTop: 0 }}>Edit details</div>
              <div className="field">
                <label className="fl">Full name</label>
                <input className="fi2" value={edit.full_name} onChange={(e) => setEdit({ ...edit, full_name: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label className="fl">Birth year</label>
                  <input className="fi2" value={edit.birth_year} onChange={(e) => setEdit({ ...edit, birth_year: e.target.value })} />
                </div>
                <div className="field">
                  <label className="fl">Hometown</label>
                  <input className="fi2" value={edit.hometown} onChange={(e) => setEdit({ ...edit, hometown: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="ibtn" onClick={saveEditMember}>Save</button>
                <button className="bb" style={{ padding: '8px 14px', fontSize: 12 }} onClick={() => setEditingMember(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="bb" style={{ padding: '8px 14px', fontSize: 12 }} onClick={openEdit}>
                <i className="ti ti-pencil" /> Edit details
              </button>
              {confirmDelete ? (
                <>
                  <button className="bb" style={{ padding: '8px 14px', fontSize: 12, borderColor: '#D0483C', color: '#D0483C' }} onClick={removeMember}>
                    Confirm delete
                  </button>
                  <button className="bb" style={{ padding: '8px 14px', fontSize: 12 }} onClick={() => setConfirmDelete(false)}>
                    Keep
                  </button>
                </>
              ) : (
                <button className="bb" style={{ padding: '8px 14px', fontSize: 12 }} onClick={() => setConfirmDelete(true)}>
                  <i className="ti ti-trash" /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}

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
                  {l.native}
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

          {/* Testimonials — family write about this person; owner approves first. */}
          {dbCtx && (
            <>
              <div className="slbl">Testimonials</div>
              {testimonials.length > 0 ? (
                testimonials.map((c) => (
                  <div className="tout" key={c.id} style={{ padding: 16 }}>
                    <div className="serif" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink2)', fontStyle: 'italic' }}>
                      “{c.body}”
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--g3)', marginTop: 6 }}>— {c.author_name || 'A family member'}</div>
                  </div>
                ))
              ) : (
                <div className="fsub" style={{ marginBottom: 12 }}>
                  No testimonials yet. Be the first to share what {firstName} means to you.
                </div>
              )}

              <div className="tout" style={{ padding: 18 }}>
                <div className="slbl" style={{ marginTop: 0 }}>Write a testimonial</div>
                {tSent ? (
                  <div className="enote" style={{ color: 'var(--g3)' }}>
                    <i className="ti ti-check" style={{ color: 'var(--g)' }} /> Sent — it will appear
                    once the family owner approves it.
                  </div>
                ) : (
                  <>
                    <input className="fi2" placeholder="Your name" value={tAuthor} onChange={(e) => setTAuthor(e.target.value)} style={{ marginBottom: 8 }} />
                    <textarea className="fta" rows={3} placeholder={`What ${firstName} means to you…`} value={tBody} onChange={(e) => setTBody(e.target.value)} />
                    <button
                      className="bp"
                      style={{ marginTop: 8 }}
                      disabled={!tBody.trim()}
                      onClick={async () => {
                        if (!tBody.trim()) return;
                        await addContribution(dbCtx.familyId, {
                          profileId: dbCtx.profileId,
                          authorName: tAuthor.trim() || undefined,
                          kind: 'testimonial',
                          body: tBody.trim(),
                        });
                        setTSent(true);
                        setTBody('');
                      }}
                    >
                      Submit for approval ✦
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
