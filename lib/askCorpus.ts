'use client';

import { SEED_PLACES, type MapPlace } from '@/lib/mapPlaces';

/**
 * Builds the searchable corpus for "Ask your family archive" (Feature Set G)
 * from the family's OWN content. In degraded/mock mode the content lives in
 * sessionStorage (+ module seeds); the client sends this corpus to /api/ask,
 * which answers ONLY from it. Once Supabase + pgvector are wired, retrieval
 * moves server-side (scoped by family_id) and the client no longer ships a
 * corpus — but the grounding contract is identical.
 */

export interface CorpusItem {
  id: string;
  type: 'person' | 'tradition' | 'business' | 'place';
  title: string;
  text: string;
  href: string;
}

function read<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function buildCorpus(): CorpusItem[] {
  const items: CorpusItem[] = [];

  // ── Person / chapter (from the onboarding flow) ───────────────────────────
  const flow = read<any>('ank-flow');
  if (flow?.name) {
    const parts = [
      flow.known && `Known for: ${flow.known}`,
      flow.q1, flow.q2, flow.q3, flow.q4, flow.q5,
      ...(flow.chapter?.bodyParagraphs ?? []),
    ].filter(Boolean);
    items.push({
      id: 'person-main',
      type: 'person',
      title: flow.name,
      text: `${flow.name}${flow.year ? `, born ${flow.year}` : ''}${flow.town ? `, from ${flow.town}` : ''}. ${parts.join(' ')}`,
      href: '/profile',
    });
  }

  // ── Traditions / values ───────────────────────────────────────────────────
  const traditions = read<any[]>('ank-traditions') ?? [];
  for (const t of traditions) {
    items.push({
      id: `tradition-${t.id}`,
      type: 'tradition',
      title: t.title,
      text: `${t.type}: ${t.title}. ${t.body ?? ''} ${t.ingredients ?? ''} ${t.method ?? ''} — ${t.author ?? ''} ${(t.tags ?? []).join(' ')}`,
      href: '/values',
    });
  }

  // ── Business ──────────────────────────────────────────────────────────────
  const biz = read<any>('ank-business');
  if (biz?.name) {
    items.push({
      id: 'business-founder',
      type: 'business',
      title: biz.name,
      text: `${biz.name}, founded ${biz.foundedYear} by ${biz.founder}. ${biz.founderStory ?? ''} Values: ${(biz.values ?? []).join(', ')}. Lessons: ${(biz.lessons ?? []).join(' ')}. Decisions: ${(biz.decisions ?? []).map((d: any) => `${d.title} — ${d.thinking}`).join(' ')}`,
      href: '/business',
    });
  }

  // ── Places (seed journey) ─────────────────────────────────────────────────
  const places: MapPlace[] = SEED_PLACES;
  for (const p of places) {
    items.push({
      id: `place-${p.id}`,
      type: 'place',
      title: `${p.placeName} (${p.year})`,
      text: `${p.placeName}, ${p.type}, ${p.year}. ${p.story ?? ''}`,
      href: '/map',
    });
  }

  return items;
}
