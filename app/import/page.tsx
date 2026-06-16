'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ImportPreview, ImportSource } from '@/lib/importParsers';

/**
 * Feature Set C — Social & Professional Import. A friendly importer: pick a
 * source, follow the export steps, preview what will be imported, then confirm.
 * Consent + privacy are explicit: the user's OWN data, imported into their
 * private archive only, nothing shared.
 */

const SOURCES: {
  id: ImportSource;
  label: string;
  icon: string;
  blurb: string;
  steps: string[];
  builds: 'personal' | 'professional';
}[] = [
  {
    id: 'instagram', label: 'Instagram', icon: 'ti-brand-instagram', builds: 'personal',
    blurb: 'Photos, captions, and dates become memories.',
    steps: ['Instagram → Settings → Your activity → Download your information', 'Request a download (JSON format)', 'When the email arrives, download the .zip', 'Upload the .zip below'],
  },
  {
    id: 'facebook', label: 'Facebook', icon: 'ti-brand-facebook', builds: 'personal',
    blurb: 'Photos, posts, and life events — life events map to the timeline.',
    steps: ['Facebook → Settings → Your Facebook information → Download your information', 'Choose JSON, request a download', 'Download the .zip when ready', 'Upload the .zip below'],
  },
  {
    id: 'linkedin', label: 'LinkedIn', icon: 'ti-brand-linkedin', builds: 'professional',
    blurb: 'Roles and education build the professional life chapter.',
    steps: ['LinkedIn → Settings → Data privacy → Get a copy of your data', 'Select Positions + Education (or everything)', 'Download the archive', 'Upload the .zip below'],
  },
  {
    id: 'google', label: 'Google Photos', icon: 'ti-brand-google', builds: 'personal',
    blurb: 'Bulk photo import with the dates they were taken.',
    steps: ['Open Google Takeout (takeout.google.com)', 'Select Google Photos', 'Create and download the export', 'Upload the .zip below'],
  },
  {
    id: 'generic', label: 'Other export', icon: 'ti-file-zip', builds: 'personal',
    blurb: 'Any export ZIP — the format is detected automatically.',
    steps: ['Download your data export from the platform', 'Keep it as the original .zip', 'Upload it below', 'We detect the format and map what we can'],
  },
];

export default function ImportPage() {
  const router = useRouter();
  const [picked, setPicked] = useState<ImportSource | null>(null);
  const [consent, setConsent] = useState(false);
  const [preview, setPreview] = useState<(ImportPreview & { total?: number }) | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const source = SOURCES.find((s) => s.id === picked);

  async function upload(file: File) {
    if (!picked) return;
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/import/${picked}`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Import failed.');
      else setPreview(data);
    } catch {
      setError('Could not read that file.');
    } finally {
      setBusy(false);
    }
  }

  async function trySample() {
    if (!picked) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/import/${picked}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sample: true }),
      });
      setPreview(await res.json());
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setPicked(null); setConsent(false); setPreview(null); setError(''); setConfirmed(false);
  }

  return (
    <div className="dash" style={{ maxWidth: 640 }}>
      <button className="bb" style={{ marginBottom: 16 }} onClick={() => router.push('/archive')}>
        ← Archive
      </button>
      <div className="dname serif" style={{ fontSize: 30, marginBottom: 2 }}>
        Bring in your digital life
      </div>
      <div className="dsub" style={{ marginBottom: 16 }}>
        Import photos, captions, and milestones you already have — personal and professional — to
        enrich a person&apos;s chapter.
      </div>

      {/* Consent / privacy — always visible */}
      <div className="ibox">
        <i className="ti ti-shield-lock" /> Your data is imported into your private archive only.
        Nothing is shared, and nothing is posted anywhere. Import only your OWN data, that you
        downloaded yourself.
      </div>

      {/* Step 1: pick a source */}
      {!picked && (
        <>
          <div className="slbl">Choose a source</div>
          <div className="acg" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {SOURCES.map((s) => (
              <div className="ac" key={s.id} onClick={() => setPicked(s.id)}>
                <div className="ac-i">
                  <i className={`ti ${s.icon}`} />
                </div>
                <div className="ac-t">{s.label}</div>
                <div className="ac-d">{s.blurb}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Step 2: steps + consent + upload */}
      {source && !preview && (
        <>
          <button className="bb" style={{ marginBottom: 14 }} onClick={reset}>
            ← Choose a different source
          </button>
          <div className="swrap" style={{ padding: 18 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <div className="fi-icon" style={{ margin: 0 }}>
                <i className={`ti ${source.icon}`} />
              </div>
              <div>
                <div className="serif" style={{ fontSize: 20 }}>{source.label}</div>
                <div style={{ fontSize: 11, color: 'var(--g3)' }}>
                  Builds the {source.builds} chapter
                </div>
              </div>
            </div>

            <div className="slbl" style={{ marginTop: 0 }}>How to get your export</div>
            <div className="tl" style={{ marginBottom: 14 }}>
              {source.steps.map((s, i) => (
                <div className="tli" key={i}>
                  <div className="tlt" style={{ fontWeight: 400, fontSize: 12 }}>{s}</div>
                </div>
              ))}
            </div>

            <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: 'var(--ink2)', marginBottom: 14, cursor: 'pointer', fontWeight: 300 }}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2 }} />
              <span>
                I confirm this is my own data, which I downloaded myself, and I want to import it into
                my private family archive.
              </span>
            </label>

            <input ref={fileRef} type="file" accept=".zip" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="bp" disabled={!consent || busy} style={{ flex: 1 }} onClick={() => fileRef.current?.click()}>
                {busy ? 'Reading your export…' : 'Upload export (.zip)'}
              </button>
              <button className="bb" disabled={!consent || busy} onClick={trySample}>
                Preview with sample data
              </button>
            </div>
            {error && (
              <div className="enote" style={{ color: 'var(--g3)', marginTop: 10 }}>
                <i className="ti ti-alert-triangle" /> {error}
              </div>
            )}
          </div>
        </>
      )}

      {/* Step 3: preview + confirm */}
      {preview && (
        <>
          <button className="bb" style={{ marginBottom: 14 }} onClick={() => setPreview(null)}>
            ← Back
          </button>
          {confirmed ? (
            <div className="swrap" style={{ padding: 26, textAlign: 'center' }}>
              <div style={{ fontSize: 30, color: 'var(--g)' }}>✦</div>
              <div className="serif" style={{ fontSize: 24, margin: '6px 0' }}>Imported to your archive</div>
              <div className="fsub">
                {(preview.photos.length + preview.events.length + preview.memories.length)} items added
                from {preview.source}. Find them on the person&apos;s profile and timeline.
              </div>
              <button className="bp" onClick={() => router.push('/profile')}>See the profile ✦</button>
            </div>
          ) : (
            <>
              <div className="slbl" style={{ marginTop: 0 }}>Preview — here&apos;s what will be imported</div>
              <PreviewBlock label="Photos & captions → memories" icon="ti-photo" count={preview.photos.length}>
                {preview.photos.slice(0, 5).map((p, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--ink3)', fontWeight: 300 }}>
                    {p.timestamp ? `${new Date(p.timestamp).getFullYear()} · ` : ''}{p.caption || '(no caption)'}
                  </div>
                ))}
              </PreviewBlock>
              <PreviewBlock label="Milestones → timeline" icon="ti-timeline" count={preview.events.length}>
                {preview.events.slice(0, 6).map((e, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--ink3)', fontWeight: 300 }}>
                    <b style={{ color: 'var(--g3)' }}>{e.year}</b> — {e.title}
                  </div>
                ))}
              </PreviewBlock>
              <PreviewBlock label="Notes → memories" icon="ti-note" count={preview.memories.length}>
                {preview.memories.slice(0, 4).map((m, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--ink3)', fontWeight: 300 }}>{m.text.slice(0, 120)}</div>
                ))}
              </PreviewBlock>

              <button className="bp" onClick={() => setConfirmed(true)} style={{ marginTop: 6 }}>
                Import {preview.photos.length + preview.events.length + preview.memories.length} items ✦
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

function PreviewBlock({
  label, icon, count, children,
}: {
  label: string; icon: string; count: number; children: React.ReactNode;
}) {
  return (
    <div className="tout" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: count ? 8 : 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, display: 'flex', gap: 6, alignItems: 'center' }}>
          <i className={`ti ${icon}`} style={{ color: 'var(--g)' }} /> {label}
        </div>
        <span className="stag">{count}</span>
      </div>
      {count > 0 && <div style={{ display: 'grid', gap: 4 }}>{children}</div>}
    </div>
  );
}
