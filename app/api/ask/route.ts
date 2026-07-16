import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { env, isAnthropicConfigured } from '@/lib/env';
import { modelFor, MAX_TOKENS } from '@/lib/models';
import { allowedToSpend } from '@/lib/apiAuth';

/**
 * POST /api/ask  — "Ask your family archive" (Feature Set G).
 * Body: { question, corpus: CorpusItem[] }
 *
 * HARD RULE (sacred): answers come ONLY from the family's own retrieved content.
 * If nothing relevant is found, it says so warmly — it NEVER fabricates a family
 * fact. A made-up memory is a catastrophic failure.
 *
 * Retrieval here scores the provided corpus by term overlap (degraded mode). In
 * production this is replaced by pgvector similarity search scoped to the
 * asking user's family_id (RLS + family filter) — the grounding contract and
 * response shape are unchanged. Uses Opus for the grounded synthesis.
 *
 * The model is invoked server-side only; the UI never names it or surfaces "AI".
 */

export const runtime = 'nodejs';

interface CorpusItem {
  id: string;
  type: string;
  title: string;
  text: string;
  href: string;
}
interface Body {
  question?: string;
  corpus?: CorpusItem[];
}
interface Citation {
  title: string;
  href: string;
  type: string;
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'of', 'in', 'on', 'and', 'or', 'to', 'for', 'is', 'are', 'was',
  'were', 'who', 'what', 'when', 'where', 'why', 'how', 'did', 'do', 'does', 'our',
  'my', 'me', 'we', 'us', 'show', 'tell', 'about', 'all', 'from', 'their', 'they',
]);

// Light synonym expansion so reasonable questions match the family's own
// wording in degraded mode (e.g. "started a business" ↔ "founded the shop").
// This only widens what counts as a MATCH against real saved content — it never
// adds facts. Production retrieval (pgvector) handles this semantically.
const SYNONYMS: Record<string, string[]> = {
  business: ['business', 'enterprise', 'company', 'shop', 'store', 'firm', 'founded', 'founder'],
  started: ['started', 'start', 'founded', 'began', 'begin', 'opened', 'founder'],
  start: ['start', 'started', 'founded', 'began', 'opened'],
  founded: ['founded', 'founder', 'started', 'began', 'opened'],
  values: ['values', 'value', 'principle', 'principles', 'believe', 'belief', 'stand', 'stands'],
  migration: ['migration', 'migrate', 'moved', 'move', 'journey', 'route', 'travelled', 'traveled'],
  history: ['history', 'past', 'story', 'journey'],
  home: ['home', 'lived', 'house', 'live', 'homes'],
  born: ['born', 'birth', 'birthplace'],
  advice: ['advice', 'wisdom', 'advise', 'said', 'taught'],
  elders: ['elders', 'elder', 'grandmother', 'grandfather', 'grandma', 'grandpa'],
};

function termGroups(q: string): string[][] {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    .map((w) => SYNONYMS[w] ?? [w]);
}

/** Rank corpus items by how many query terms (or their synonyms) appear. */
function retrieve(question: string, corpus: CorpusItem[]): CorpusItem[] {
  const groups = termGroups(question);
  if (groups.length === 0) return [];
  const scored = corpus
    .map((item) => {
      const hay = `${item.title} ${item.type} ${item.text}`.toLowerCase();
      const score = groups.reduce((s, variants) => (variants.some((v) => hay.includes(v)) ? s + 1 : s), 0);
      return { item, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).map((s) => s.item);
}

const NOT_FOUND =
  "I looked through your family's archive and couldn't find anything about that yet. As more stories, photos, and memories are added, I'll be able to answer. I only ever answer from what your family has saved — I'll never make something up.";

export async function POST(req: NextRequest) {
  if (!(await allowedToSpend())) {
    return NextResponse.json({ error: 'Sign in to ask your family.' }, { status: 401 });
  }
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const question = (body.question ?? '').trim().slice(0, 1_000);
  // Bound the corpus so a client can't force a huge (costly) Opus prompt.
  const corpus = (body.corpus ?? []).slice(0, 400);
  if (!question) return NextResponse.json({ error: 'Missing question' }, { status: 400 });

  const hits = retrieve(question, corpus);
  const citations: Citation[] = hits.map((h) => ({ title: h.title, href: h.href, type: h.type }));

  // Nothing relevant — say so warmly. Never fabricate.
  if (hits.length === 0) {
    return NextResponse.json({ answer: NOT_FOUND, citations: [], grounded: false });
  }

  // No model configured — return a grounded extractive answer from the hits.
  if (!isAnthropicConfigured()) {
    const answer =
      `From your family's archive:\n\n` +
      hits.map((h) => `• ${h.title} — ${h.text.slice(0, 220)}${h.text.length > 220 ? '…' : ''}`).join('\n\n');
    return NextResponse.json({ answer, citations, grounded: true });
  }

  // Grounded synthesis with Opus, strictly over the retrieved excerpts.
  const context = hits
    .map((h, i) => `[${i + 1}] (${h.type}) ${h.title}\n${h.text}`)
    .join('\n\n');

  const system = `You help a family explore their OWN archive. Answer the question using ONLY the numbered excerpts below — they are the family's saved memories. Rules, in order of importance:
1. Use ONLY facts present in the excerpts. NEVER invent or assume a family fact.
2. If the excerpts don't contain the answer, say warmly that it isn't in the archive yet. Do not guess.
3. Be warm, brief, and specific. Quote the family's own words where you can.
4. Cite the excerpts you used with their bracket numbers, e.g. [1].
Never mention being a model or "AI".

EXCERPTS:
${context}`;

  try {
    const client = new Anthropic({ apiKey: env.anthropicKey });
    const msg = await client.messages.create({
      model: modelFor('askArchive'),
      max_tokens: MAX_TOKENS,
      system,
      messages: [{ role: 'user', content: question }],
    });
    const answer = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    return NextResponse.json({ answer, citations, grounded: true });
  } catch (err) {
    console.error('ask synthesis failed, returning extractive answer:', err);
    const answer =
      `From your family's archive:\n\n` +
      hits.map((h) => `• ${h.title} — ${h.text.slice(0, 220)}`).join('\n\n');
    return NextResponse.json({ answer, citations, grounded: true });
  }
}
