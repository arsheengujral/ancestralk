import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { env, isWhisperConfigured } from '@/lib/env';
import { allowedToSpend } from '@/lib/apiAuth';

const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // Whisper's 25 MB limit (AUDIT H4)

/**
 * POST /api/voice/transcribe — turn a recorded audio clip into text.
 * Body: multipart form { audio: Blob, language?: string }
 *
 * Uses OpenAI Whisper, which supports all of Ancestralk's languages. The user
 * always reviews and approves the transcript before it's saved (handled in the
 * client). When no key is configured, returns { configured: false } so the UI
 * can fall back gracefully instead of appearing broken.
 *
 * Server-side only; the key never reaches the browser.
 */
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!isWhisperConfigured()) {
    return NextResponse.json({ configured: false, transcript: '' });
  }
  if (!(await allowedToSpend())) {
    return NextResponse.json({ error: 'Sign in to transcribe audio.' }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const audio = form?.get('audio');
  const language = (form?.get('language') as string) || undefined;

  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: 'Audio too large (max 25 MB).' }, { status: 413 });
  }

  try {
    const client = new OpenAI({ apiKey: env.openaiKey });
    // Whisper language codes are ISO-639-1; pass through when we have one.
    const whisperLang = language && language.length === 2 ? language : undefined;
    const result = await client.audio.transcriptions.create({
      file: audio,
      model: 'whisper-1',
      language: whisperLang,
    });
    return NextResponse.json({ configured: true, transcript: result.text ?? '' });
  } catch (err) {
    console.error('transcribe failed:', err);
    return NextResponse.json({ error: 'Could not transcribe the recording.' }, { status: 502 });
  }
}
