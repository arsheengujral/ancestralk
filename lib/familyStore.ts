'use client';

import { createClient } from '@/lib/supabase/client';
import type { FlowState, ChapterResult } from '@/components/FlowProvider';
import type { TraditionItem } from '@/lib/traditions';
import type { MapPlace, PlaceType } from '@/lib/mapPlaces';

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

  // Upload the avatar (a data URL captured in the flow) to private storage.
  let photoPath: string | null = null;
  if (state.photo && state.photo.startsWith('data:')) {
    try {
      const blob = await dataUrlToBlob(state.photo);
      photoPath = await uploadMedia('photos', familyId, blob, extFromType(blob.type));
    } catch (err) {
      console.error('saveMember: avatar upload failed', err);
    }
  }

  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .insert({
      family_id: familyId,
      full_name: state.name || 'A family member',
      birth_year: state.year || null,
      hometown: state.town || null,
      known_for: state.known || null,
      relationship: state.who || null,
      photo_url: photoPath,
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

/** Turn a stored photo path into a signed URL (leaves http(s) URLs untouched). */
async function resolvePhoto(photoUrl: string | null): Promise<string | null> {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('http')) return photoUrl;
  return (await signedUrl('photos', photoUrl)) ?? null;
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
  const members = (data ?? []) as SavedMember[];
  for (const m of members) m.photo_url = await resolvePhoto(m.photo_url);
  return members;
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
  (member as SavedMember).photo_url = await resolvePhoto((member as SavedMember).photo_url);
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

// ════════════════════════════════════════════════════════════════════════════
// Full persistence for the remaining screens. Each loader/saver uses the browser
// client under RLS; callers fall back to sessionStorage when not signed in.
// ════════════════════════════════════════════════════════════════════════════

function sb() {
  return createClient();
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}

function extFromType(type: string): string {
  if (type.includes('png')) return 'png';
  if (type.includes('webp')) return 'webp';
  if (type.includes('gif')) return 'gif';
  if (type.includes('mp4')) return 'mp4';
  if (type.includes('webm')) return 'webm';
  if (type.includes('quicktime') || type.includes('mov')) return 'mov';
  if (type.includes('wav')) return 'wav';
  if (type.includes('mpeg') || type.includes('mp3')) return 'mp3';
  return 'jpg';
}

/** Upload a Blob/File to a private, family-scoped path; returns the storage path. */
export async function uploadMedia(
  bucket: 'photos' | 'videos' | 'voice-recordings',
  familyId: string,
  body: Blob,
  ext: string,
): Promise<string | null> {
  const supabase = sb();
  if (!supabase) return null;
  const id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.round(Math.random() * 1e9)}`);
  const path = `${familyId}/${id}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, body, { contentType: body.type || undefined, upsert: false });
  if (error) {
    console.error('uploadMedia failed', error);
    return null;
  }
  return path;
}

/** Short-lived signed URL for a private object. */
export async function signedUrl(bucket: 'photos' | 'videos' | 'voice-recordings', path: string, ttl = 3600): Promise<string | null> {
  const supabase = sb();
  if (!supabase) return null;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, ttl);
  return data?.signedUrl ?? null;
}

// ── Photos ───────────────────────────────────────────────────────────────────
export interface LoadedPhoto { id: string; url: string; caption: string | null; decade: string | null; source: string }

export async function addPhoto(familyId: string, file: File, caption?: string): Promise<LoadedPhoto | null> {
  const supabase = sb();
  if (!supabase) return null;
  const path = await uploadMedia('photos', familyId, file, extFromType(file.type));
  if (!path) return null;
  const { data, error } = await supabase
    .from('photos')
    .insert({ family_id: familyId, storage_path: path, caption: caption ?? null, source: 'manual' })
    .select('id, storage_path, caption, decade, source')
    .single();
  if (error || !data) return null;
  const url = (await signedUrl('photos', data.storage_path)) ?? '';
  return { id: data.id, url, caption: data.caption, decade: data.decade, source: data.source };
}

export async function loadPhotos(): Promise<LoadedPhoto[]> {
  const supabase = sb();
  if (!supabase) return [];
  const { data } = await supabase.from('photos').select('id, storage_path, caption, decade, source').order('created_at', { ascending: false });
  const rows = data ?? [];
  const out: LoadedPhoto[] = [];
  for (const r of rows) {
    const url = r.storage_path ? (await signedUrl('photos', r.storage_path)) ?? '' : '';
    out.push({ id: r.id, url, caption: r.caption, decade: r.decade, source: r.source });
  }
  return out;
}

// ── Videos ───────────────────────────────────────────────────────────────────
export interface LoadedVideo { id: string; url: string; caption: string | null }

export async function addVideo(familyId: string, file: File, caption?: string): Promise<LoadedVideo | null> {
  const supabase = sb();
  if (!supabase) return null;
  const path = await uploadMedia('videos', familyId, file, extFromType(file.type));
  if (!path) return null;
  const { data, error } = await supabase
    .from('videos')
    .insert({ family_id: familyId, storage_path: path, caption: caption ?? null })
    .select('id, storage_path, caption')
    .single();
  if (error || !data) return null;
  const url = (await signedUrl('videos', data.storage_path)) ?? '';
  return { id: data.id, url, caption: data.caption };
}

export async function loadVideos(): Promise<LoadedVideo[]> {
  const supabase = sb();
  if (!supabase) return [];
  const { data } = await supabase.from('videos').select('id, storage_path, caption').order('created_at', { ascending: false });
  const out: LoadedVideo[] = [];
  for (const r of data ?? []) {
    const url = r.storage_path ? (await signedUrl('videos', r.storage_path)) ?? '' : '';
    out.push({ id: r.id, url, caption: r.caption });
  }
  return out;
}

// ── Album design (Set A) ─────────────────────────────────────────────────────
export async function loadDesign(): Promise<string | null> {
  const supabase = sb();
  if (!supabase) return null;
  const { data } = await supabase.from('families').select('album_design').limit(1).maybeSingle();
  return data?.album_design ?? null;
}

export async function saveDesign(designId: string): Promise<void> {
  const supabase = sb();
  if (!supabase) return;
  const { data: fam } = await supabase.from('families').select('id').limit(1).maybeSingle();
  if (fam?.id) await supabase.from('families').update({ album_design: designId }).eq('id', fam.id);
}

// ── Traditions / values (Set F) ──────────────────────────────────────────────
export async function loadTraditions(): Promise<TraditionItem[]> {
  const supabase = sb();
  if (!supabase) return [];
  const { data } = await supabase
    .from('traditions')
    .select('id, type, title, body, author_name, tags, details')
    .order('created_at', { ascending: true });
  return (data ?? []).map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title ?? '',
    body: r.body ?? '',
    author: r.author_name ?? 'Unattributed',
    tags: r.tags ?? [],
    ingredients: r.details?.ingredients,
    method: r.details?.method,
    occasion: r.details?.occasion,
  })) as TraditionItem[];
}

export async function addTradition(familyId: string, item: TraditionItem): Promise<string | null> {
  const supabase = sb();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('traditions')
    .insert({
      family_id: familyId,
      type: item.type,
      title: item.title,
      body: item.body,
      author_name: item.author,
      tags: item.tags,
      details: { ingredients: item.ingredients ?? null, method: item.method ?? null, occasion: item.occasion ?? null },
    })
    .select('id')
    .single();
  if (error) console.error('addTradition failed', error);
  return data?.id ?? null;
}

export async function removeTradition(id: string): Promise<void> {
  const supabase = sb();
  if (!supabase) return;
  await supabase.from('traditions').delete().eq('id', id);
}

// ── Map places (Set H) ───────────────────────────────────────────────────────
export async function loadPlaces(): Promise<MapPlace[]> {
  const supabase = sb();
  if (!supabase) return [];
  const { data } = await supabase
    .from('map_places')
    .select('id, lat, lng, place_name, type, year, story, photo_path')
    .order('year', { ascending: true });
  return (data ?? []).map((r) => ({
    id: r.id, lat: r.lat, lng: r.lng, placeName: r.place_name ?? '',
    type: r.type as PlaceType, year: r.year ?? '', story: r.story ?? '', photoPath: r.photo_path ?? undefined,
  }));
}

export async function addPlace(familyId: string, place: Omit<MapPlace, 'id'>): Promise<string | null> {
  const supabase = sb();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('map_places')
    .insert({ family_id: familyId, lat: place.lat, lng: place.lng, place_name: place.placeName, type: place.type, year: place.year, story: place.story })
    .select('id')
    .single();
  if (error) console.error('addPlace failed', error);
  return data?.id ?? null;
}

// ── Business (Set I) — one row per family ─────────────────────────────────────
export interface BusinessRecord {
  name: string; founder: string; foundedYear: string; founderStory: string;
  timeline: { year: string; title: string; note?: string }[];
  values: string[];
  decisions: { title: string; thinking: string; by: string }[];
  lessons: string[];
}

export async function loadBusiness(): Promise<BusinessRecord | null> {
  const supabase = sb();
  if (!supabase) return null;
  const { data } = await supabase
    .from('businesses')
    .select('name, founder_name, founded_year, story, timeline, values, decisions, lessons')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    name: data.name ?? '', founder: data.founder_name ?? '', foundedYear: data.founded_year ?? '',
    founderStory: data.story ?? '', timeline: data.timeline ?? [], values: data.values ?? [],
    decisions: data.decisions ?? [], lessons: data.lessons ?? [],
  };
}

export async function saveBusiness(familyId: string, b: BusinessRecord): Promise<void> {
  const supabase = sb();
  if (!supabase) return;
  const row = {
    family_id: familyId, name: b.name, founder_name: b.founder, founded_year: b.foundedYear,
    story: b.founderStory, timeline: b.timeline, values: b.values, decisions: b.decisions, lessons: b.lessons,
  };
  const { data: existing } = await supabase.from('businesses').select('id').limit(1).maybeSingle();
  if (existing?.id) await supabase.from('businesses').update(row).eq('id', existing.id);
  else await supabase.from('businesses').insert(row);
}

// ── Future messages (metadata list — never the sealed content) ───────────────
export interface FutureMessageRow { id: string; recipient_description: string | null; unlock_condition: string | null; unlock_date: string | null }

export async function loadFutureMessages(): Promise<FutureMessageRow[]> {
  const supabase = sb();
  if (!supabase) return [];
  const { data } = await supabase
    .from('future_messages')
    .select('id, recipient_description, unlock_condition, unlock_date')
    .order('created_at', { ascending: false });
  return (data ?? []) as FutureMessageRow[];
}

// ── Invites (Set: collaborate) ───────────────────────────────────────────────
export interface InviteRow { id: string; contact: string | null; status: string }

export async function loadInvites(): Promise<InviteRow[]> {
  const supabase = sb();
  if (!supabase) return [];
  const { data } = await supabase.from('invites').select('id, contact, status').order('created_at', { ascending: false });
  return (data ?? []) as InviteRow[];
}

export async function addInvite(familyId: string, contact: string): Promise<string | null> {
  const supabase = sb();
  if (!supabase) return null;
  const { data, error } = await supabase.from('invites').insert({ family_id: familyId, contact, status: 'pending' }).select('id').single();
  if (error) console.error('addInvite failed', error);
  return data?.id ?? null;
}

// ── Legacy plan (Set B) ──────────────────────────────────────────────────────
export interface LegacyRow { mode: string; successorNames: string[]; transferDate: string; inactivityMonths: number }

export async function loadLegacy(): Promise<LegacyRow | null> {
  const supabase = sb();
  if (!supabase) return null;
  const { data } = await supabase
    .from('families')
    .select('inheritance_mode, successor_names, transfer_date, inactivity_months')
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    mode: data.inheritance_mode ?? 'multi_generation',
    successorNames: data.successor_names ?? [],
    transferDate: data.transfer_date ?? '',
    inactivityMonths: data.inactivity_months ?? 12,
  };
}

export async function saveLegacy(cfg: LegacyRow): Promise<void> {
  const supabase = sb();
  if (!supabase) return;
  const { data: fam } = await supabase.from('families').select('id').limit(1).maybeSingle();
  if (!fam?.id) return;
  await supabase.from('families').update({
    inheritance_mode: cfg.mode,
    successor_names: cfg.successorNames,
    transfer_date: cfg.transferDate || null,
    inactivity_months: cfg.inactivityMonths,
  }).eq('id', fam.id);
}
