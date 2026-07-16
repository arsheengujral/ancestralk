'use client';

/**
 * Holds real recorded audio blobs captured during the onboarding flow, keyed by
 * question id, until they can be uploaded to private storage when the member is
 * saved (saveMember reads from here). In-memory and session-scoped — audio is
 * never written to sessionStorage.
 */
const buffer = new Map<string, Blob>();

export function putAudio(id: string, blob: Blob): void {
  buffer.set(id, blob);
}

export function takeAllAudio(): [string, Blob][] {
  const entries = Array.from(buffer.entries());
  buffer.clear();
  return entries;
}
