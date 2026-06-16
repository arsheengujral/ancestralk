import { NextRequest, NextResponse } from 'next/server';
import { unzipSync } from 'fflate';
import { parseExport, type ImportSource, type ImportPreview } from '@/lib/importParsers';

/**
 * POST /api/import/[source] — Social & Professional Import (Feature Set C).
 *
 * Accepts a data export ZIP that the user downloaded for their OWN account
 * (Instagram "Download Your Information", Facebook export, LinkedIn export,
 * Google Takeout) and returns a PREVIEW of what would be imported, mapped to
 * photos / timeline_events / memories. Nothing is persisted by this preview
 * call; the client confirms separately.
 *
 * ToS: user-initiated, own-data-only, explicit consent in the UI, parsed into
 * the user's private archive only. No scraping or platform-API access. See the
 * header in lib/importParsers.ts.
 *
 * Works fully offline — parsing a user-supplied file needs no external service,
 * so this is identical in degraded and configured modes. (Persistence on
 * confirm is wired to Supabase in Phase 3.)
 */

export const runtime = 'nodejs';
export const maxDuration = 60;

const VALID: ImportSource[] = ['instagram', 'facebook', 'linkedin', 'google', 'generic'];

// A small sample preview so the flow is demoable without a real export.
function samplePreview(source: ImportSource): ImportPreview {
  if (source === 'linkedin') {
    return {
      source,
      photos: [],
      events: [
        { year: '2003', title: 'Software Engineer at Acme', source },
        { year: '2011', title: 'Engineering Manager at Globex', source },
        { year: '1999', title: 'BSc Computer Science — State University', source },
      ],
      memories: [{ text: 'Led the team that shipped the company’s first mobile product.', source }],
    };
  }
  return {
    source,
    photos: [
      { caption: 'Summer in the garden', timestamp: '2014-07-02T00:00:00.000Z', source },
      { caption: 'Grandpa’s 70th', timestamp: '2009-03-11T00:00:00.000Z', source },
    ],
    events: [],
    memories: [{ text: 'A favourite caption from years ago.', source }],
  };
}

export async function POST(req: NextRequest, { params }: { params: { source: string } }) {
  const source = params.source as ImportSource;
  if (!VALID.includes(source)) {
    return NextResponse.json({ error: `Unknown source "${source}"` }, { status: 400 });
  }

  const contentType = req.headers.get('content-type') ?? '';

  // Sample/demo path: JSON body { sample: true }.
  if (contentType.includes('application/json')) {
    const body = await req.json().catch(() => ({}));
    if (body?.sample) return NextResponse.json(samplePreview(source));
    return NextResponse.json({ error: 'Upload a file, or pass { sample: true }.' }, { status: 400 });
  }

  // Real export: multipart file upload.
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No export file provided.' }, { status: 400 });
  }

  try {
    const buf = new Uint8Array(await file.arrayBuffer());
    const unzipped = unzipSync(buf);
    // Drop directory entries (zero-length, trailing slash).
    const files: Record<string, Uint8Array> = {};
    for (const [name, bytes] of Object.entries(unzipped)) {
      if (!name.endsWith('/') && bytes.length) files[name] = bytes;
    }
    const preview = parseExport(source, files);
    const total = preview.photos.length + preview.events.length + preview.memories.length;
    return NextResponse.json({ ...preview, total });
  } catch (err) {
    console.error('import parse failed:', err);
    return NextResponse.json(
      { error: 'Could not read that file. Please upload the original .zip export from the platform.' },
      { status: 422 },
    );
  }
}
