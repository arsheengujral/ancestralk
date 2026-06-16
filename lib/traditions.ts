/** Shared types for the Family Values & Traditions module (Feature Set F). */

export type TraditionType = 'principle' | 'tradition' | 'recipe' | 'advice';

export interface TraditionItem {
  id: string;
  type: TraditionType;
  title: string;
  body: string;
  author: string;
  tags: string[];
  // Recipe-only extras.
  ingredients?: string;
  method?: string;
  occasion?: string;
}

export const TRADITION_SECTIONS: {
  type: TraditionType;
  label: string;
  icon: string;
  blurb: string;
  placeholder: string;
}[] = [
  {
    type: 'principle',
    label: 'Family principles',
    icon: 'ti-anchor',
    blurb: 'The beliefs the family lives by.',
    placeholder: 'We always show up for each other.',
  },
  {
    type: 'tradition',
    label: 'Traditions & rituals',
    icon: 'ti-confetti',
    blurb: 'Festivals, gatherings, customs — how the family celebrates and mourns.',
    placeholder: 'Every Eid, the whole family gathers at the eldest aunt’s home…',
  },
  {
    type: 'recipe',
    label: 'Recipes',
    icon: 'ti-tools-kitchen-2',
    blurb: 'Family recipes with the story behind each.',
    placeholder: "Grandmother's Sunday bread — the loaf that made the house feel safe.",
  },
  {
    type: 'advice',
    label: 'Advice from elders',
    icon: 'ti-quote',
    blurb: 'Short pieces of wisdom, attributed.',
    placeholder: 'Never go to bed angry, and never let a guest leave hungry.',
  },
];
