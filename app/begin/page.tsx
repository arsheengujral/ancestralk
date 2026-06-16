'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFlow, type ChapterResult } from '@/components/FlowProvider';
import { useUser } from '@/lib/useUser';
import { LANGUAGES, REGIONS } from '@/lib/languages';
import VoiceRecorder from '@/components/VoiceRecorder';
import VoicePlayback from '@/components/VoicePlayback';
import SaveCeremony from '@/components/SaveCeremony';

type Step = 'region' | 'who' | 'basics' | 'story' | 'gen' | 'chapter';

const WHO_OPTIONS = [
  { v: 'myself', icon: 'ti-user', t: 'Myself', s: 'Record my own story for my family' },
  { v: 'parent_self', icon: 'ti-hearth', t: "A parent — they'll fill it", s: 'Your parent answers themselves' },
  { v: 'parent_you', icon: 'ti-heart', t: "A parent — I'll fill it", s: 'You answer from what you know' },
  { v: 'both', icon: 'ti-users', t: 'Both parents', s: 'Separate profiles for Mum and Dad' },
  { v: 'grandparent', icon: 'ti-star', t: 'A grandparent', s: 'Before the stories are lost' },
  { v: 'someone', icon: 'ti-friends', t: 'Someone else', s: 'Any family member' },
];

const KNOWN_SUGGESTIONS = [
  'Always had a story for every moment',
  'Made every room warmer',
  'The one everyone called in a crisis',
  'Fed people the way others say I love you',
  'Never asked anything for themselves',
];

const Q1_FOLLOWUPS = {
  bake: ['How did they learn to bake?', 'Was there a recipe never written down?', 'Who taught them?'],
  teach: ['Which subject? Which school?', 'A student who stayed with them?', 'What did education mean to them?'],
  farm: ['What did they grow?', 'Was the land inherited or earned?', 'What did the seasons mean?'],
  def: ['What did a typical day look like?', 'A moment their work was truly seen?', 'What sacrifice did it quietly require?'],
};

// Simulated transcription demo text per field (degraded mode).
const DEMO = {
  known: 'She was known for her patience and making everyone feel at home',
  q1: 'She worked as a nurse for thirty-five years. She was proudest of the night shifts nobody else wanted, and the patients who remembered her name decades later.',
  q2: 'She believed kindness costs nothing and is worth everything. She said it almost every day.',
  q3: 'Sunday mornings. The smell of bread in her kitchen. She hummed the same three songs and the whole house felt safe.',
  q4: 'That she carried a great deal quietly and never let it show. She wanted everyone else to be okay first.',
};

function PROG({ active }: { active: number }) {
  // active: 1-based index of the current step among the 5 dots.
  return (
    <div className="prog">
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} className={`pd${n < active ? ' done' : n === active ? ' act' : ''}`} />
      ))}
    </div>
  );
}

export default function BeginPage() {
  const router = useRouter();
  const { state, ini, set } = useFlow();
  const { user, configured } = useUser();
  const [step, setStep] = useState<Step>('region');
  const [saving, setSaving] = useState(false);
  const [chapterTab, setChapterTab] = useState<'w' | 'r' | 't'>('w');
  const [genMsg, setGenMsg] = useState('Reading their story…');

  const hasVoice = Object.keys(state.recs).length > 0;

  // ── Contextual suggestions ────────────────────────────────────────────────
  const knownSugVisible = state.known.trim().length >= 3;
  const q1Lower = state.q1.toLowerCase();
  const q1SugVisible = q1Lower.length >= 8;
  const q1Set =
    q1Lower.includes('bak') || q1Lower.includes('cook') || q1Lower.includes('bread')
      ? Q1_FOLLOWUPS.bake
      : q1Lower.includes('teach') || q1Lower.includes('school')
        ? Q1_FOLLOWUPS.teach
        : q1Lower.includes('farm') || q1Lower.includes('land')
          ? Q1_FOLLOWUPS.farm
          : Q1_FOLLOWUPS.def;

  function appendKnown(text: string) {
    const c = state.known.trim();
    set('known', c ? `${c}${c.endsWith('.') ? ' ' : '. '}${text}` : text);
  }
  function appendQ1(text: string) {
    set('q1', state.q1 + (state.q1.trim() ? '\n' : '') + text);
  }

  // ── Photo upload (mock: data URL) ─────────────────────────────────────────
  const [faceMsg, setFaceMsg] = useState('');
  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      set('photo', url);
      setTimeout(() => {
        const n = state.name.trim();
        setFaceMsg(n ? `Face recognised — linked to ${n}` : 'Face detected — add a name to link');
      }, 1000);
    };
    reader.readAsDataURL(file);
  }

  // ── Generate the chapter ──────────────────────────────────────────────────
  async function generate() {
    setStep('gen');
    const cycle = ['Reading their story…', 'Gathering the fragments…', 'Writing their chapter…'];
    let i = 0;
    const ticker = setInterval(() => {
      i = (i + 1) % cycle.length;
      setGenMsg(cycle[i]);
    }, 1900);

    try {
      const res = await fetch('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.name, year: state.year, town: state.town, known: state.known,
          q1: state.q1, q2: state.q2, q3: state.q3, q4: state.q4, q5: state.q5,
          who: state.who, language: state.language || 'en', version: 'full',
        }),
      });
      const data = (await res.json()) as ChapterResult;
      set('chapter', data);
    } catch {
      set('chapter', {
        bodyParagraphs: ['Could not connect — check your internet and try again.'],
        tags: [], quote: '', timeline: [],
      });
    } finally {
      clearInterval(ticker);
      setStep('chapter');
    }
  }

  const ch = state.chapter;
  const firstName = (state.name || 'this person').split(' ')[0];

  const suggested = REGIONS.find((r) => r.id === state.region)?.suggests ?? ['en'];

  function requestSave() {
    // Account required to save and protect private family data (must-have #4).
    if (configured && !user) {
      router.push('/auth?next=/begin');
      return;
    }
    setSaving(true);
  }

  return (
    <div>
      {/* ── STEP 0: REGION + LANGUAGE ───────────────────────────────────── */}
      {step === 'region' && (
        <div className="fw">
          <div className="fey">YOUR FAMILY&apos;S LANGUAGE</div>
          <div className="ftit serif">Where is your family from?</div>
          <div className="fsub">
            We&apos;ll suggest the languages spoken there — but every language stays open to you. You
            can speak and write in whichever feels like home.
          </div>

          <div className="who-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {REGIONS.map((r) => (
              <div
                key={r.id}
                className={`wo${state.region === r.id ? ' sel' : ''}`}
                onClick={() => {
                  set('region', r.id);
                  set('language', r.suggests[0]);
                }}
              >
                <div className="wo-c">
                  <i className="ti ti-check" style={{ fontSize: 9 }} />
                </div>
                <div className="wo-ic" style={{ fontSize: 24 }}>{r.flag}</div>
                <div className="wo-t">{r.label}</div>
              </div>
            ))}
          </div>

          {state.region && (
            <div className="field">
              <label className="fl">Suggested for you</label>
              <div className="sug-c" style={{ marginBottom: 12 }}>
                {suggested.map((code) => {
                  const lang = LANGUAGES.find((l) => l.code === code);
                  if (!lang) return null;
                  return (
                    <button
                      key={code}
                      className="schip"
                      style={state.language === code ? { borderColor: 'var(--g)', color: 'var(--g3)', fontWeight: 500 } : undefined}
                      onClick={() => set('language', code)}
                    >
                      {lang.native}
                    </button>
                  );
                })}
              </div>
              <label className="fl">All languages</label>
              <select className="fi2" value={state.language} onChange={(e) => set('language', e.target.value)}>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native} — {l.english}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button className="bp" disabled={!state.region} onClick={() => setStep('who')}>
            Continue
          </button>
        </div>
      )}

      {/* ── STEP 1: WHO ─────────────────────────────────────────────────── */}
      {step === 'who' && (
        <>
          <PROG active={1} />
          <div className="fw">
            <div className="fey">STEP 1 OF 5</div>
            <div className="ftit serif">Who are you starting with?</div>
            <div className="fsub">
              Add every family member over time. Start with whoever matters most right now.
            </div>
            <div className="who-grid">
              {WHO_OPTIONS.map((o) => (
                <div
                  key={o.v}
                  className={`wo${state.who === o.v ? ' sel' : ''}`}
                  onClick={() => set('who', o.v)}
                >
                  <div className="wo-c">
                    <i className="ti ti-check" style={{ fontSize: 9 }} />
                  </div>
                  <div className="wo-ic">
                    <i className={`ti ${o.icon}`} />
                  </div>
                  <div className="wo-t">{o.t}</div>
                  <div className="wo-s">{o.s}</div>
                </div>
              ))}
            </div>
            {state.who === 'both' && (
              <div className="ibox">
                <i className="ti ti-info-circle" /> Two separate profiles — one per parent.
                First one now, second right after.
              </div>
            )}
            <div
              className="ibox"
              style={{ background: 'var(--paper2)', borderColor: 'var(--paper3)', color: 'var(--ink3)' }}
            >
              <i className="ti ti-accessible" /> Filling this for an elderly person? Try{' '}
              <b
                style={{ cursor: 'pointer', color: 'var(--g3)' }}
                onClick={() => router.push('/elderly')}
              >
                &nbsp;Voice-only mode&nbsp;
              </b>{' '}
              — large text, one question at a time, just speaking.
            </div>
            <button className="bp" disabled={!state.who} onClick={() => setStep('basics')}>
              Continue
            </button>
          </div>
        </>
      )}

      {/* ── STEP 2: BASICS ──────────────────────────────────────────────── */}
      {step === 'basics' && (
        <>
          <PROG active={2} />
          <div className="fw">
            <div className="fey">STEP 2 OF 5</div>
            <div className="ftit serif">Tell us about them</div>
            <div className="fsub">
              Everything can be edited any time. Nothing is final until you want it to be.
            </div>
            <div className="field">
              <label className="fl">Full name</label>
              <input
                className="fi2"
                placeholder="e.g. Margaret Ellis"
                value={state.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label className="fl">Birth year</label>
                <input
                  className="fi2"
                  placeholder="e.g. 1942"
                  value={state.year}
                  onChange={(e) => set('year', e.target.value)}
                />
              </div>
              <div className="field">
                <label className="fl">Where they grew up</label>
                <input
                  className="fi2"
                  placeholder="e.g. Bristol, Nairobi…"
                  value={state.town}
                  onChange={(e) => set('town', e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label className="fl">Known for in your family</label>
              <div className="vrow">
                <input
                  className="fi2"
                  placeholder="Best cook, always had a story…"
                  style={{ flex: 1 }}
                  value={state.known}
                  onChange={(e) => set('known', e.target.value)}
                />
              </div>
              <VoiceRecorder
                id="known"
                label="Speak"
                iconOnly
                demoText={DEMO.known}
                onTranscript={(txt) => set('known', txt)}
              />
              {knownSugVisible && (
                <div className="sug show">
                  <div className="sug-l">
                    <i className="ti ti-sparkles" style={{ fontSize: 12 }} /> Examples — tap to add
                  </div>
                  <div className="sug-c">
                    {KNOWN_SUGGESTIONS.map((s) => (
                      <button className="schip" key={s} onClick={() => appendKnown(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="field">
              <label className="fl">
                Photo{' '}
                <span style={{ fontSize: 10, color: 'var(--ink4)', textTransform: 'none', letterSpacing: 0 }}>
                  (optional)
                </span>
              </label>
              <label className="pdrop" htmlFor="pup" style={{ display: 'block' }}>
                {state.photo ? (
                  <img
                    src={state.photo}
                    alt=""
                    style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--g2)' }}
                  />
                ) : (
                  <>
                    <div style={{ fontSize: 26, color: 'var(--paper3)', marginBottom: 6 }}>
                      <i className="ti ti-camera" />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink3)', fontWeight: 300 }}>
                      Tap to add a photo — faces are recognised and linked
                    </div>
                  </>
                )}
              </label>
              <input type="file" id="pup" accept="image/*" onChange={onPhoto} />
              {faceMsg && (
                <div className="frec show">
                  <i className="ti ti-face-id" /> <span>{faceMsg}</span>
                </div>
              )}
            </div>
            <div className="enote">
              <i className="ti ti-pencil" style={{ color: 'var(--g)' }} /> Edit any field any time
              from the archive.
            </div>
            <div className="brow">
              <button className="bb" onClick={() => setStep('who')}>
                Back
              </button>
              <button className="bp" disabled={state.name.trim().length < 2} onClick={() => setStep('story')}>
                Continue
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── STEP 3: STORY ───────────────────────────────────────────────── */}
      {step === 'story' && (
        <>
          <PROG active={3} />
          <div className="fw">
            <div className="fey">STEP 3 OF 5</div>
            <div className="ftit serif">Their story</div>
            <div className="fsub">
              Even a few words is enough. Speak if typing feels hard. Add more any time.
            </div>

            <div className="field">
              <label className="fl">What did they do, and what were they proud of?</label>
              <VoiceRecorder
                id="q1"
                label="Speak your answer"
                demoText={DEMO.q1}
                onTranscript={(txt) => set('q1', txt)}
              />
              <textarea
                className="fta"
                rows={3}
                placeholder="e.g. She ran a bakery from her kitchen and was known across the village for her bread…"
                value={state.q1}
                onChange={(e) => set('q1', e.target.value)}
              />
              {q1SugVisible && (
                <div className="sug show">
                  <div className="sug-l">
                    <i className="ti ti-sparkles" style={{ fontSize: 12 }} /> Based on what you
                    shared — go deeper:
                  </div>
                  <div className="sug-c">
                    {q1Set.map((x) => (
                      <button className="schip" key={x} onClick={() => appendQ1(x)}>
                        {x}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {(
              [
                ['q2', 'What values did they live by?', DEMO.q2, 'A belief, a phrase they always said, how they treated people…'],
                ['q3', 'One memory you never want to forget', DEMO.q3, 'A moment, a smell, a sound, a feeling…'],
                ['q4', 'What should future generations know about them?', DEMO.q4, 'What they carried quietly. What made them who they were.'],
              ] as const
            ).map(([key, label, demo, ph]) => (
              <div className="field" key={key}>
                <label className="fl">{label}</label>
                <VoiceRecorder
                  id={key}
                  label="Speak"
                  demoText={demo}
                  onTranscript={(txt) => set(key, txt)}
                />
                <textarea
                  className="fta"
                  rows={3}
                  placeholder={ph}
                  value={state[key]}
                  onChange={(e) => set(key, e.target.value)}
                />
              </div>
            ))}

            <div className="field">
              <label className="fl">
                Key life events{' '}
                <span style={{ fontSize: 10, color: 'var(--ink4)', textTransform: 'none' }}>
                  (for their timeline — optional)
                </span>
              </label>
              <textarea
                className="fta"
                rows={2}
                placeholder="e.g. Moved to London 1965. Married 1968. Opened the shop 1974. First grandchild 1995."
                value={state.q5}
                onChange={(e) => set('q5', e.target.value)}
              />
            </div>

            <div className="ibox">
              <i className="ti ti-plus" /> Want to go deeper? After saving, the full interview offers
              20+ more questions across 7 life dimensions.
            </div>
            <div className="brow">
              <button className="bb" onClick={() => setStep('basics')}>
                Back
              </button>
              <button className="bp" onClick={generate}>
                Write their chapter ✦
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── GENERATING ──────────────────────────────────────────────────── */}
      {step === 'gen' && (
        <div className="fw" style={{ textAlign: 'center', paddingTop: 90 }}>
          <div
            style={{
              width: 50, height: 50, border: '2px solid var(--paper3)', borderTopColor: 'var(--g)',
              borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 26px',
            }}
          />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div className="serif" style={{ fontSize: 30, marginBottom: 8 }}>
            {genMsg}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink3)', fontWeight: 300 }}>
            The beginning of something permanent
          </div>
        </div>
      )}

      {/* ── STEP 4: CHAPTER ─────────────────────────────────────────────── */}
      {step === 'chapter' && ch && (
        <>
          <PROG active={4} />
          <div className="fw" style={{ maxWidth: 620 }}>
            <div className="fey">STEP 4 OF 5 — THEIR CHAPTER</div>
            <div className="ftit serif">{firstName}&apos;s chapter</div>
            <div className="fsub">Read both versions. Edit anything. Then save it forever.</div>

            <div className="swrap" style={{ marginBottom: 14 }}>
              <div className="shead">
                <div className="sav">
                  {state.photo ? <img src={state.photo} alt="" /> : ini}
                </div>
                <div>
                  <div className="sname">{state.name}</div>
                  <div className="smeta">
                    {state.year ? `b. ${state.year}` : ''}
                    {state.town ? `${state.year ? ' · ' : ''}${state.town}` : ''}
                  </div>
                </div>
              </div>

              {hasVoice && (
                <VoicePlayback variant="dark" label={`${state.name}'s voice`} bars={20} />
              )}

              <div className="stabs">
                <button className={`stab${chapterTab === 'w' ? ' on' : ''}`} onClick={() => setChapterTab('w')}>
                  Written chapter
                </button>
                <button className={`stab${chapterTab === 'r' ? ' on' : ''}`} onClick={() => setChapterTab('r')}>
                  Your words
                </button>
                <button className={`stab${chapterTab === 't' ? ' on' : ''}`} onClick={() => setChapterTab('t')}>
                  Timeline
                </button>
              </div>

              {chapterTab === 'w' && (
                <>
                  <div className="sbody">
                    {ch.bodyParagraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                    {ch.quote && <div className="squote">{ch.quote}</div>}
                  </div>
                  {ch.tags.length > 0 && (
                    <div className="stags">
                      {ch.tags.map((tg) => (
                        <span className="stag" key={tg}>
                          {tg}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}

              {chapterTab === 'r' && (
                <div className="sraw">
                  {[
                    state.q1 && `What they did:\n${state.q1}`,
                    state.q2 && `Values:\n${state.q2}`,
                    state.q3 && `A memory:\n${state.q3}`,
                    state.q4 && `For the future:\n${state.q4}`,
                  ]
                    .filter(Boolean)
                    .join('\n\n') || 'Your own words appear here.'}
                </div>
              )}

              {chapterTab === 't' && (
                <div style={{ padding: 20 }}>
                  <div className="tl">
                    {ch.timeline.length > 0 ? (
                      ch.timeline.map((e, i) => (
                        <div className="tli" key={i}>
                          <div className="tly">{e.year}</div>
                          <div className="tlt">{e.title}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--ink4)' }}>
                        Add life events in the story step to build the timeline.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="enote" style={{ marginBottom: 14 }}>
              <i className="ti ti-pencil" style={{ color: 'var(--g)' }} /> The chapter can be edited
              any time. Never changed without your permission.
            </div>
            <div
              className="ibox"
              style={{ cursor: 'pointer' }}
              onClick={() => router.push('/profile')}
            >
              <i className="ti ti-layout-grid" /> See six versions of {firstName}&apos;s story — a
              short bio, the full chapter, a premium emotional version, a timeline, a children&apos;s
              version, and a first-person legacy letter. →
            </div>
            <div className="brow">
              <button className="bb" onClick={() => setStep('story')}>
                Edit answers
              </button>
              <button className="bp" onClick={requestSave}>
                Save to archive forever ✦
              </button>
            </div>
          </div>
        </>
      )}

      <SaveCeremony open={saving} onClose={() => router.push('/archive')} />
    </div>
  );
}
