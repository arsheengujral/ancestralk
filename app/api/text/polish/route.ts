import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { env, isAnthropicConfigured } from '@/lib/env';
import { modelFor, MAX_TOKENS } from '@/lib/models';

/**
 * POST /api/text/polish — the writing helper behind the "review & approve" flow.
 * Body: { text, mode, tone?, targetLanguage? }
 *
 * Modes:
 *   fix       — correct spelling + grammar, keep the meaning and voice
 *   translate — understand any language and render it in English (or target),
 *               preserving the exact meaning
 *   rewrite   — the same meaning, more emotional / better written, in a chosen
 *               tone (formal | emotional | storytelling | humorous | concise)
 *   help      — from a few keywords, compose a short emotional narrative that
 *               stays faithful to those keywords and invents no new facts
 *
 * The result is ALWAYS returned to the user to review and approve before it is
 * saved — never written directly. Server-side only; degrades to the original
 * text when no key is configured.
 */
export const runtime = 'nodejs';

type Mode = 'fix' | 'translate' | 'rewrite' | 'help';
type Tone = 'formal' | 'emotional' | 'storytelling' | 'humorous' | 'concise';

interface Body {
  text?: string;
  mode?: Mode;
  tone?: Tone;
  targetLanguage?: string;
}

const TONE_GUIDE: Record<Tone, string> = {
  formal: 'dignified and formal, but still warm',
  emotional: 'deeply emotional and moving, tender and heartfelt',
  storytelling: 'like a story told aloud — vivid, flowing, sensory',
  humorous: 'gently warm and light, with affectionate humour',
  concise: 'clear and concise — every word earns its place',
};

function systemFor(mode: Mode, tone: Tone, target: string): string {
  const rule = ' Preserve the exact meaning of the original. Never invent facts, names, dates, or events that are not present. Return ONLY the resulting text, with no preamble.';
  switch (mode) {
    case 'fix':
      return `You correct spelling and grammar while keeping the person's own voice and meaning intact.${rule}`;
    case 'translate':
      return `You understand text in any language (including mixed languages and romanised forms) and render it faithfully in ${target}.${rule}`;
    case 'help':
      return `You are a warm family biographer. From the keywords or fragments given, compose a short, emotional narrative in ${target} that stays completely faithful to them.${rule}`;
    case 'rewrite':
    default:
      return `You rewrite text to be ${TONE_GUIDE[tone]}, grammatically perfect and better written, in ${target}.${rule}`;
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const text = (body.text ?? '').trim();
  const mode: Mode = body.mode ?? 'fix';
  const tone: Tone = body.tone ?? 'emotional';
  const target = body.targetLanguage || 'English';

  if (!text) return NextResponse.json({ error: 'Nothing to work with' }, { status: 400 });

  // No model configured — hand back the original so the flow still works.
  if (!isAnthropicConfigured()) {
    return NextResponse.json({ configured: false, text });
  }

  try {
    const client = new Anthropic({ apiKey: env.anthropicKey });
    // Emotional rewrites and help-writing use the richer model; fixes use Sonnet.
    const model = mode === 'rewrite' || mode === 'help' ? modelFor('bioPremium') : modelFor('bioFull');
    const msg = await client.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      system: systemFor(mode, tone, target),
      messages: [{ role: 'user', content: text }],
    });
    const out = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    return NextResponse.json({ configured: true, text: out || text });
  } catch (err) {
    console.error('polish failed:', err);
    return NextResponse.json({ configured: true, text });
  }
}
