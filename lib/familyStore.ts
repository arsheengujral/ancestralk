'use client';

import { createClient } from '@/lib/supabase/client';
import type { FlowState, ChapterResult } from '@/components/FlowProvider';

/**
 * Client-side data layer connecting the screens to Supabase. When the user is
 * signed in and Supabase is configured, these persist to / read from the real
 * database (subject to RLS). When not, callers fall back to the in-browser
 * sessionStorage behaviour, so the app keeps working without an account.
 */

export interface FamilyContext {
  familyId: string;
  profileId: string;
}

export interface SavedMember {
  id: string;
  full_name: string | null;
  birth_year: string | null;
  hometown: string | null;
  known_for?: string | null;
  relationship: string | null;
  photo_url: string | null;
  role: string;
  is_admin: boolean;
}

export interface SavedStory {
  written_version: string | null;
  raw_answers: Record<string, string> | null;
  tags: string[] | null;
  portrait_quote: string | null;
  language: string | null;
  versions: Record<string, ChapterResult> | null;
}

/** True when there's an active session AND Supabase is configured. */
export async function isDbActive(): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;
  const { data } = await supabase.auth.getUser();
  return Boolean(data.user);
}

/** Ensure the user has a family + owner profile; returns their ids. */
export async function getFamilyContext(): Promise<FamilyContext | null> {
  const res = await fetch('/api/family/ensure', { method: 'POST' });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.familyId) return null;
  return { familyId: data.familyId, profileId: data.profileId };
}

/**
 * Persist a recorded family member: their profile, the generated chapter (as the
 * "full" version), their raw answers, and any timeline events. Returns the new
 * profile id, or null on failure.
 */
export async function saveMember(state: FlowState, familyId: string): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .insert({
      family_id: familyId,
      full_name: state.name || 'A family member',
      birth_year: state.year || null,
      hometown: state.town || null,
      known_for: state.known || null,
      relationship: state.who || null,
      role: 'contributor',
    })
    .select('id')
    .single();
  if (profErr || !profile) {
    console.error('saveMember: profile insert failed', profErr);
    return null;
  }

  const chapter = state.chapter;
  const { error: storyErr } = await supabase.from('stories').insert({
    family_id: familyId,
    profile_id: profile.id,
    written_version: chapter?.bodyParagraphs.join('\n\n') ?? null,
    raw_answers: { q1: state.q1, q2: state.q2, q3: state.q3, q4: state.q4, q5: state.q5, known: state.known },
    tags: chapter?.tags ?? [],
    portrait_quote: chapter?.quote ?? null,
    language: state.language || 'en',
    versions: chapter ? { full: chapter } : {},
  });
  if (storyErr) console.error('saveMember: story insert failed', storyErr);

  if (chapter?.timeline?.length) {
    const events = chapter.timeline.map((e, i) => ({
      family_id: familyId,
      profile_id: profile.id,
      year: e.year,
      title: e.title,
      sort_order: i,
    }));
    const { error: tlErr } = await supabase.from('timeline_events').insert(events);
    if (tlErr) console.error('saveMember: timeline insert failed', tlErr);
  }

  return profile.id;
}

/** All members of the user's family, newest first. */
export async function loadMembers(): Promise<SavedMember[]> {
  const supabase = createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, birth_year, hometown, relationship, photo_url, role, is_admin')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('loadMembers failed', error);
    return [];
  }
  return (data ?? []) as SavedMember[];
}

/** A member plus their most recent story (with the six versions). */
export async function loadMemberWithStory(
  profileId: string,
): Promise<{ member: SavedMember; story: SavedStory | null } | null> {
  const supabase = createClient();
  if (!supabase) return null;
  const { data: member } = await supabase
    .from('profiles')
    .select('id, full_name, birth_year, hometown, known_for, relationship, photo_url, role, is_admin')
    .eq('id', profileId)
    .maybeSingle();
  if (!member) return null;
  const { data: story } = await supabase
    .from('stories')
    .select('written_version, raw_answers, tags, portrait_quote, language, versions')
    .eq('profile_id', profileId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return { member: member as SavedMember, story: (story as SavedStory) ?? null };
}

/** Save / update one biography version on a member's story (Set E persistence). */
export async function saveVersion(
  profileId: string,
  familyId: string,
  versionId: string,
  content: ChapterResult,
): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;
  const { data: story } = await supabase
    .from('stories')
    .select('id, versions')
    .eq('profile_id', profileId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const merged = { ...(story?.versions ?? {}), [versionId]: content };
  if (story?.id) {
    await supabase.from('stories').update({ versions: merged }).eq('id', story.id);
  } else {
    await supabase.from('stories').insert({ family_id: familyId, profile_id: profileId, versions: merged });
  }
}
