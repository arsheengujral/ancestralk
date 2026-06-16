import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Signed-URL helpers (Phase 4). All media buckets (photos, videos,
 * voice-recordings, books) are PRIVATE — nothing is ever publicly accessible.
 * The app serves media exclusively through short-lived signed URLs, and object
 * paths are always prefixed with the owning family_id (see 0002_storage.sql),
 * so storage RLS enforces ownership too.
 */

const DEFAULT_TTL = 60 * 60; // 1 hour

export type Bucket = 'photos' | 'videos' | 'voice-recordings' | 'books';

/** Build the canonical, family-scoped object path. */
export function familyPath(familyId: string, ...segments: string[]): string {
  return [familyId, ...segments].join('/');
}

/** A short-lived signed URL for a private object, or null if unavailable. */
export async function signedUrl(
  supabase: SupabaseClient,
  bucket: Bucket,
  path: string,
  expiresIn = DEFAULT_TTL,
): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error || !data) return null;
  return data.signedUrl;
}

/** Upload to a private, family-scoped path and return its storage path. */
export async function uploadPrivate(
  supabase: SupabaseClient,
  bucket: Bucket,
  familyId: string,
  filename: string,
  body: ArrayBuffer | Blob | Buffer,
  contentType?: string,
): Promise<string | null> {
  const path = familyPath(familyId, filename);
  const { error } = await supabase.storage.from(bucket).upload(path, body, {
    contentType,
    upsert: false,
  });
  return error ? null : path;
}
