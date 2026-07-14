/**
 * The onboarding questionnaire (redesigned per feedback):
 *  - very specific, simple, quick questions (answerable in ~5 seconds)
 *  - multiple-choice wherever possible, max 5 options, always with a
 *    "type your own" fallback
 *  - deeper questions so family learn about each other, feeding the life story
 *
 * Answers are stored in flow state under `answers`, keyed by `id`, and passed to
 * the story generator.
 */

export interface Question {
  id: string;
  label: string;
  hint?: string;
  type: 'choice' | 'text';
  options?: string[]; // choice: up to 5 quick options
  multi?: boolean; // choice: allow selecting more than one
  voice?: boolean; // text: offer voice input
  placeholder?: string;
}

export const QUESTIONS: Question[] = [
  {
    id: 'oneword',
    label: 'In one word, how would you describe them?',
    type: 'choice',
    options: ['Kind', 'Strong', 'Funny', 'Wise', 'Generous'],
  },
  {
    id: 'knownfor',
    label: 'What were they best known for in the family?',
    type: 'choice',
    options: ['Their cooking', 'Their stories', 'Always helping', 'Their advice', 'Their humour'],
  },
  {
    id: 'work',
    label: 'What did they mainly do?',
    type: 'choice',
    options: ['Homemaker', 'Teacher', 'Farmer', 'Ran a business', 'Healthcare'],
  },
  {
    id: 'values',
    label: 'What values did they live by?',
    hint: 'Choose any that fit',
    type: 'choice',
    multi: true,
    options: ['Honesty', 'Family first', 'Hard work', 'Generosity', 'Faith'],
  },
  {
    id: 'unique',
    label: 'What makes them unique?',
    type: 'choice',
    options: ['Their humour', 'Their kindness', 'Their resilience', 'Their creativity', 'Their wisdom'],
  },
  {
    id: 'proud',
    label: 'What are people most proud of about them?',
    type: 'text',
    voice: true,
    placeholder: 'The thing the family is proudest of…',
  },
  {
    id: 'achievement',
    label: 'What is their biggest achievement?',
    type: 'text',
    voice: true,
    placeholder: 'Big or small — what they achieved…',
  },
  {
    id: 'memory',
    label: 'A favourite memory with them',
    type: 'text',
    voice: true,
    placeholder: 'A moment you never want to forget…',
  },
];

/** Milestone types for the timeline step (specific life events, not just dates). */
export const MILESTONE_TYPES = [
  'Birth',
  'School',
  'Graduation',
  'First job',
  'Marriage',
  'Children',
  'Career',
  'Started a business',
  'Retirement',
  'Award',
  'Major achievement',
  'Moved / migrated',
  'Other',
] as const;

export type MilestoneType = (typeof MILESTONE_TYPES)[number];

export interface Milestone {
  type: MilestoneType;
  year: string;
  detail: string;
}
