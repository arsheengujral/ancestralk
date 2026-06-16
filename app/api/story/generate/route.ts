import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { env, isAnthropicConfigured } from '@/lib/env';
import { modelFor, MAX_TOKENS, type GenerationTask } from '@/lib/models';
import { englishName } from '@/lib/languages';

/**
 * POST /api/story/generate
 * Body: { name, year, town, known, q1..q5, who, language, version? }
 *
 * Generates a person's chapter. `version` selects one of the six biography
 * treatments (Feature Set E); it also picks the model via lib/models.ts —
 * Opus for the premium + legacy-letter versions, Sonnet for the rest.
 *
 * Server-side only: the Anthropic key and model id never reach the client,
 * keeping the intelligence invisible per the brand rule. When no key is
 * configured, returns a gracefully composed fallback chapter so the product is
 * fully demoable offline.
 */

export const runtime = 'nodejs';

interface Body {
  name?: string;
  year?: string;
  town?: string;
  known?: string;
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  who?: string;
  language?: string;
  version?: GenerationTask;
}

interface ChapterPayload {
  bodyParagraphs: string[];
  tags: string[];
  quote: string;
  timeline: { year: string; title: string }[];
  source: 'generated' | 'composed';
}

// Map the six versions to their task ids; default to the base chapter.
function taskFor(version?: string): GenerationTask {
  switch (version) {
    case 'short':
      return 'bioShort';
    case 'premium':
      return 'bioPremium';
    case 'timeline':
      return 'bioTimeline';
    case 'children':
      return 'bioChildren';
    case 'legacy_letter':
      return 'bioLegacyLetter';
    case 'full':
    default:
      return 'bioFull';
  }
}

function systemPrompt(version: GenerationTask, language: string): string {
  const lang =
    language === 'hinglish'
      ? 'Hinglish (romanised Hindi-English mix, the way urban/NRI Indians speak)'
      : englishName(language);
  const base = `You are a warm literary biographer for Ancestralk, a private family legacy platform. Respond entirely in ${lang}.`;
  const tail = ` Then on their own lines output: TAGS: 4-5 single-word values separated by commas. QUOTE: one portrait-caption sentence. TIMELINE: any dated life events as "year|title" separated by semicolons.`;

  switch (version) {
    case 'bioShort':
      return `${base} Write a 3-4 sentence short biography for a family-tree preview — warm, specific, no generic phrases.${tail}`;
    case 'bioPremium':
      return `${base} Write a longer, deeply moving chapter for a printed legacy book — slower, more sensory, emotionally precise, every specific detail used. Written for a great-grandchild who never met them.${tail}`;
    case 'bioTimeline':
      return `${base} Tell this life as a sequence of dated events, briefly narrated. Lead with the TIMELINE.${tail}`;
    case 'bioChildren':
      return `${base} Write in simple, warm language a 6-year-old understands, as if introducing a beloved great-grandparent.${tail}`;
    case 'bioLegacyLetter':
      return `${base} Write in the FIRST PERSON, as if this person is speaking directly to future generations — a letter beginning in their own voice.${tail}`;
    case 'bioFull':
    default:
      return `${base} Write a beautiful 3-paragraph biographical chapter using every specific detail given, zero generic phrases, written for a great-grandchild who never met them.${tail}`;
  }
}

function userPrompt(b: Body): string {
  const name = b.name?.trim() || 'this person';
  return [
    `Subject: ${name}${b.year ? `, born ${b.year}` : ''}${b.town ? `, from ${b.town}` : ''}.`,
    b.known ? `Known for: ${b.known}.` : '',
    `Work/pride: "${b.q1 || '—'}"`,
    `Values: "${b.q2 || '—'}"`,
    `A memory: "${b.q3 || '—'}"`,
    `For future generations: "${b.q4 || '—'}"`,
    b.q5 ? `Life events: "${b.q5}"` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/** Parse the model's TAGS/QUOTE/TIMELINE trailer out of the prose. */
function parse(text: string): ChapterPayload {
  const tagM = text.match(/TAGS:\s*(.+)/i);
  const quoteM = text.match(/QUOTE:\s*(.+)/i);
  const tlM = text.match(/TIMELINE:\s*(.+)/i);

  const body = text
    .replace(/TAGS:.+/is, '')
    .replace(/QUOTE:.+/is, '')
    .replace(/TIMELINE:.+/is, '')
    .trim();

  const timeline =
    tlM?.[1]
      .split(';')
      .map((part) => {
        const [year, title] = part.split('|');
        return { year: (year || '').trim(), title: (title || '').trim() };
      })
      .filter((e) => e.year && e.title) ?? [];

  return {
    bodyParagraphs: body.split(/\n\n+/).map((p) => p.trim()).filter((p) => p.length > 10),
    tags: tagM?.[1].split(',').map((t) => t.trim()).filter(Boolean) ?? [],
    quote: quoteM?.[1].trim() ?? '',
    timeline,
    source: 'generated',
  };
}

/**
 * Deterministic, offline fallback. Composes a respectful chapter from the family's
 * own words so the experience never breaks when the model isn't configured.
 */
function compose(b: Body): ChapterPayload {
  const name = b.name?.trim() || 'This person';
  const first = name.split(' ')[0];
  const paras: string[] = [];

  const origin = [
    b.year ? `born in ${b.year}` : '',
    b.town ? `in ${b.town}` : '',
  ].filter(Boolean).join(' ');
  paras.push(
    `${name}${origin ? `, ${origin},` : ''} carried a life worth remembering.` +
      (b.known ? ` In the family, ${first} was known for ${b.known.replace(/\.$/, '')}.` : ''),
  );
  if (b.q1) paras.push(b.q1.trim());
  const tail = [b.q3, b.q2, b.q4].filter(Boolean).join(' ').trim();
  if (tail) paras.push(tail);
  if (paras.length < 2) {
    paras.push(`There is more of ${first}'s story still to be told — every answer added here becomes part of it.`);
  }

  const timeline: { year: string; title: string }[] = [];
  if (b.year) timeline.push({ year: b.year, title: `Born${b.town ? ` in ${b.town}` : ''}` });
  if (b.q5) {
    for (const ev of b.q5.split('.').map((s) => s.trim()).filter(Boolean)) {
      const ym = ev.match(/\d{4}/);
      timeline.push({ year: ym ? ym[0] : '—', title: ev });
    }
  }

  return {
    bodyParagraphs: paras,
    tags: ['devoted', 'warm', 'remembered', 'steadfast'],
    quote: b.known ? `${b.known.replace(/\.$/, '')}.` : `${first}, kept and carried forward.`,
    timeline,
    source: 'composed',
  };
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const task = taskFor(body.version);
  const language = body.language || 'en';

  // Degraded mode — no key configured. Compose from the family's own words.
  if (!isAnthropicConfigured()) {
    return NextResponse.json(compose(body));
  }

  try {
    const client = new Anthropic({ apiKey: env.anthropicKey });
    const msg = await client.messages.create({
      model: modelFor(task),
      max_tokens: MAX_TOKENS,
      system: systemPrompt(task, language),
      messages: [{ role: 'user', content: userPrompt(body) }],
    });
    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    return NextResponse.json(parse(text));
  } catch (err) {
    // Never break the family's flow on an upstream hiccup — fall back gracefully.
    console.error('story/generate failed, composing fallback:', err);
    return NextResponse.json(compose(body));
  }
}
