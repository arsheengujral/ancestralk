import 'server-only';

/**
 * Minimal in-memory sliding-window rate limiter (AUDIT H2).
 *
 * Best-effort by design: state is per server instance, so a cold serverless
 * start resets it. That still raises the cost of scripted abuse on warm
 * instances substantially, without adding an external store. Swap for a
 * Redis/Upstash-backed limiter if abuse becomes real.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  // Opportunistic cleanup so the map can't grow unbounded.
  if (hits.size > 10_000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }
  return true;
}

/** Client IP for rate-limit keys (Vercel/proxies set x-forwarded-for). */
export function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
