import 'server-only';
import crypto from 'crypto';

/**
 * Sealing for future messages (Phase 4 security).
 *
 * A sealed letter is encrypted with AES-256-GCM the moment it's saved. The only
 * place that ever decrypts is the delivery cron — and only once the unlock
 * condition (date) has arrived. There is deliberately NO read endpoint for
 * sealed content before then: not for the owner, not for anyone. "Even you
 * cannot read it after sealing."
 *
 * The key comes from FUTURE_MESSAGE_KEY (32 bytes, base64). When it isn't set,
 * sealing is reported as unavailable rather than silently storing plaintext.
 */

function key(): Buffer {
  const raw = process.env.FUTURE_MESSAGE_KEY;
  if (!raw) throw new Error('FUTURE_MESSAGE_KEY is not configured');
  // Accept a 32-byte base64 key, or derive 32 bytes from an arbitrary secret.
  const decoded = Buffer.from(raw, 'base64');
  return decoded.length === 32 ? decoded : crypto.createHash('sha256').update(raw).digest();
}

/** Encrypt plaintext → base64(iv | authTag | ciphertext). */
export function seal(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString('base64');
}

/** Decrypt a payload produced by seal(). Used ONLY by the delivery cron. */
export function unseal(payload: string): string {
  const buf = Buffer.from(payload, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

export function hasKey(): boolean {
  return Boolean(process.env.FUTURE_MESSAGE_KEY);
}
