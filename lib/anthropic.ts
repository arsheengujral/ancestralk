import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/lib/env';
import { MAX_TOKENS } from '@/lib/models';

/**
 * Shared Anthropic text generation for the three writing routes (story, ask,
 * polish) — one place for client construction and text-block extraction.
 * Callers stay responsible for auth, prompts, and fallbacks.
 */
export async function generateText(opts: {
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const client = new Anthropic({ apiKey: env.anthropicKey });
  const msg = await client.messages.create({
    model: opts.model,
    max_tokens: opts.maxTokens ?? MAX_TOKENS,
    system: opts.system,
    messages: [{ role: 'user', content: opts.user }],
  });
  return msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
}
