/**
 * Per-source parsers for Social & Professional Import (Feature Set C).
 *
 * ───────────────────────────────────────────────────────────────────────────
 * PLATFORM ToS — READ BEFORE EDITING:
 *   • These parsers operate ONLY on a data export that the USER has downloaded
 *     for THEIR OWN account ("Download Your Information" / Takeout / data
 *     export), then uploaded here themselves. No scraping, no third-party data,
 *     no automated access to any platform API.
 *   • Import is user-initiated and gated behind an explicit consent screen.
 *   • Data is parsed into the user's OWN private archive only; nothing is
 *     shared or posted outward.
 *   • We read the minimum needed (photos + captions + dates; career/education
 *     milestones for LinkedIn) and ignore everything else.
 * ───────────────────────────────────────────────────────────────────────────
 *
 * Parsers are deliberately tolerant: export formats vary across regions and
 * versions, so every field is optional and failures are skipped, never thrown.
 */

export type ImportSource = 'instagram' | 'facebook' | 'linkedin' | 'google' | 'generic';

export interface ImportedPhoto {
  caption: string;
  timestamp?: string; // ISO
  source: ImportSource;
}
export interface ImportedEvent {
  year: string;
  title: string;
  source: ImportSource;
}
export interface ImportedMemory {
  text: string;
  source: ImportSource;
}
export interface ImportPreview {
  source: ImportSource;
  photos: ImportedPhoto[];
  events: ImportedEvent[];
  memories: ImportedMemory[];
}

type Files = Record<string, Uint8Array>;

const dec = new TextDecoder();
const text = (b?: Uint8Array) => (b ? dec.decode(b) : '');
const yearOf = (v: unknown): string => {
  if (v == null) return '—';
  // Unix seconds, ISO string, or "Mon YYYY".
  if (typeof v === 'number') return String(new Date(v * 1000).getFullYear());
  const s = String(v);
  const m = s.match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : '—';
};
const isoOf = (v: unknown): string | undefined => {
  if (typeof v === 'number') return new Date(v * 1000).toISOString();
  const s = String(v ?? '');
  const t = Date.parse(s);
  return Number.isNaN(t) ? undefined : new Date(t).toISOString();
};

function findJson(files: Files, ...needles: string[]): any[] {
  const out: any[] = [];
  for (const [name, bytes] of Object.entries(files)) {
    const lower = name.toLowerCase();
    if (lower.endsWith('.json') && needles.some((n) => lower.includes(n))) {
      try {
        out.push(JSON.parse(text(bytes)));
      } catch {
        /* skip malformed */
      }
    }
  }
  return out;
}

// Minimal CSV parser (handles quoted fields + escaped quotes).
function parseCsv(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', inQ = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (inQ) {
      if (c === '"' && raw[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (field || row.length) { row.push(field); rows.push(row); row = []; field = ''; }
      if (c === '\r' && raw[i + 1] === '\n') i++;
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}

function csvByName(files: Files, needle: string): string[][] | null {
  for (const [name, bytes] of Object.entries(files)) {
    if (name.toLowerCase().endsWith('.csv') && name.toLowerCase().includes(needle)) {
      return parseCsv(text(bytes));
    }
  }
  return null;
}

// ── Instagram ────────────────────────────────────────────────────────────────
function parseInstagram(files: Files): ImportPreview {
  const photos: ImportedPhoto[] = [];
  for (const doc of findJson(files, 'media', 'posts', 'content')) {
    const arrays = Array.isArray(doc) ? doc : Object.values(doc).filter(Array.isArray).flat();
    for (const item of arrays as any[]) {
      const media = item?.media ?? item;
      const entries = Array.isArray(media) ? media : [media];
      for (const m of entries) {
        if (!m) continue;
        const caption = m.title ?? m.caption ?? item?.title ?? '';
        const ts = m.creation_timestamp ?? item?.creation_timestamp;
        if (caption || ts) photos.push({ caption: String(caption), timestamp: isoOf(ts), source: 'instagram' });
      }
    }
  }
  return { source: 'instagram', photos, events: [], memories: [] };
}

// ── Facebook ─────────────────────────────────────────────────────────────────
function parseFacebook(files: Files): ImportPreview {
  const photos: ImportedPhoto[] = [];
  const events: ImportedEvent[] = [];
  const memories: ImportedMemory[] = [];
  for (const doc of findJson(files, 'posts', 'your_posts', 'photos_and_videos')) {
    const arr = Array.isArray(doc) ? doc : (doc?.status_updates ?? doc?.photos ?? []);
    for (const item of arr as any[]) {
      const ts = item?.timestamp;
      const post = item?.data?.find?.((d: any) => d?.post)?.post ?? item?.title;
      if (post) memories.push({ text: String(post), source: 'facebook' });
      const attach = item?.attachments?.[0]?.data?.[0]?.media;
      if (attach) photos.push({ caption: String(attach.title ?? post ?? ''), timestamp: isoOf(ts), source: 'facebook' });
    }
  }
  // Life events → timeline.
  for (const doc of findJson(files, 'profile_information', 'profile_update')) {
    const lifeEvents = doc?.profile_v2?.name ? [] : (doc?.life_events ?? doc?.profile_information?.life_events ?? []);
    for (const e of lifeEvents as any[]) {
      events.push({ year: yearOf(e?.timestamp ?? e?.start_timestamp), title: String(e?.title ?? e?.name ?? 'Life event'), source: 'facebook' });
    }
  }
  return { source: 'facebook', photos, events, memories };
}

// ── LinkedIn (professional legacy) ───────────────────────────────────────────
function parseLinkedIn(files: Files): ImportPreview {
  const events: ImportedEvent[] = [];
  const memories: ImportedMemory[] = [];

  const positions = csvByName(files, 'positions');
  if (positions && positions.length > 1) {
    const [header, ...rows] = positions;
    const col = (name: string) => header.findIndex((h) => h.toLowerCase().includes(name));
    const ci = { company: col('company'), title: col('title'), started: col('started'), desc: col('description') };
    for (const r of rows) {
      const company = r[ci.company] ?? '';
      const title = r[ci.title] ?? '';
      if (!company && !title) continue;
      events.push({ year: yearOf(r[ci.started]), title: `${title}${company ? ` at ${company}` : ''}`.trim(), source: 'linkedin' });
      if (r[ci.desc]) memories.push({ text: `${title} at ${company}: ${r[ci.desc]}`, source: 'linkedin' });
    }
  }

  const education = csvByName(files, 'education');
  if (education && education.length > 1) {
    const [header, ...rows] = education;
    const col = (name: string) => header.findIndex((h) => h.toLowerCase().includes(name));
    const ci = { school: col('school'), start: col('start'), degree: col('degree') };
    for (const r of rows) {
      const school = r[ci.school] ?? '';
      if (!school) continue;
      const degree = r[ci.degree] ?? 'Studied';
      events.push({ year: yearOf(r[ci.start]), title: `${degree} — ${school}`, source: 'linkedin' });
    }
  }

  events.sort((a, b) => Number(a.year) - Number(b.year));
  return { source: 'linkedin', photos: [], events, memories };
}

// ── Google Photos (Takeout) ──────────────────────────────────────────────────
function parseGoogle(files: Files): ImportPreview {
  const photos: ImportedPhoto[] = [];
  for (const [name, bytes] of Object.entries(files)) {
    if (!name.toLowerCase().endsWith('.json')) continue;
    try {
      const doc = JSON.parse(text(bytes));
      const ts = doc?.photoTakenTime?.timestamp ?? doc?.creationTime?.timestamp;
      const title = doc?.description || doc?.title || '';
      if (ts) photos.push({ caption: String(title), timestamp: isoOf(Number(ts)), source: 'google' });
    } catch {
      /* skip non-sidecar json */
    }
  }
  return { source: 'google', photos, events: [], memories: [] };
}

/** Detect the export format from its filenames (for the Generic dropzone). */
export function detectSource(files: Files): ImportSource {
  const names = Object.keys(files).map((n) => n.toLowerCase()).join(' ');
  if (names.includes('positions.csv') || names.includes('linkedin')) return 'linkedin';
  if (names.includes('photoTakenTime'.toLowerCase()) || names.includes('takeout')) return 'google';
  if (names.includes('your_posts') || names.includes('profile_information')) return 'facebook';
  if (names.includes('media.json') || names.includes('content/posts')) return 'instagram';
  return 'generic';
}

export function parseExport(source: ImportSource, files: Files): ImportPreview {
  switch (source) {
    case 'instagram': return parseInstagram(files);
    case 'facebook': return parseFacebook(files);
    case 'linkedin': return parseLinkedIn(files);
    case 'google': return parseGoogle(files);
    case 'generic': {
      const detected = detectSource(files);
      return detected === 'generic'
        ? { source: 'generic', photos: [], events: [], memories: [] }
        : parseExport(detected, files);
    }
  }
}
