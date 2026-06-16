/**
 * Single source of truth for which Claude model handles each generation task.
 * Change a value here and every server route updates — there are no hardcoded
 * model IDs anywhere else in the codebase.
 *
 * Policy (set by the product owner):
 *   - Opus   → the moments that must land emotionally: premium biographies,
 *              first-person legacy letters, and grounded ask-your-archive answers.
 *   - Sonnet → everyday, high-volume generation: regular chapters and the
 *              short / timeline / children-friendly biography versions.
 *
 * NOTE: model selection is server-side only. The chosen model is never sent to,
 * or referenced in, the client — consistent with the brand rule that the
 * intelligence stays invisible (no "AI" surfaced in the UI).
 */

export const OPUS = 'claude-opus-4-8';
export const SONNET = 'claude-sonnet-4-6';

/** The six biography versions from Feature Set E, plus the core tasks. */
export type GenerationTask =
  | 'storyGenerate' // base 3-paragraph chapter (onboarding) — same as bioFull
  | 'bioShort'
  | 'bioFull'
  | 'bioPremium'
  | 'bioTimeline'
  | 'bioChildren'
  | 'bioLegacyLetter'
  | 'askArchive';

export const MODELS: Record<GenerationTask, string> = {
  storyGenerate: SONNET,
  bioShort: SONNET,
  bioFull: SONNET,
  bioPremium: OPUS,
  bioTimeline: SONNET,
  bioChildren: SONNET,
  bioLegacyLetter: OPUS,
  askArchive: OPUS,
};

/** Resolve the model for a task, defaulting safely to the everyday workhorse. */
export function modelFor(task: GenerationTask): string {
  return MODELS[task] ?? SONNET;
}

/** Shared generation ceiling; individual routes may pass a smaller value. */
export const MAX_TOKENS = 1600;
