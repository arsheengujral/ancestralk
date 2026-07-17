/**
 * Region-specific example text for the questionnaire's free-text prompts, so
 * placeholders feel natural and culturally familiar instead of generic. Falls
 * back to the question's default placeholder for any region/id not listed here.
 */

export const REGION_EXAMPLES: Record<string, Record<string, string>> = {
  india: {
    birthplace: 'e.g. a village near Amritsar, or Old Delhi…',
    grewup: 'e.g. a joint family home in Lucknow…',
    education: 'e.g. the village school, then a diploma in Pune…',
    proud: 'e.g. that she ran the house through every hardship…',
    achievement: 'e.g. built the family home brick by brick…',
    memory: 'e.g. sitting on the veranda during the monsoon…',
  },
  gulf: {
    birthplace: 'e.g. a town outside Karachi, or Kerala…',
    grewup: 'e.g. moved to Dubai for work in the 1980s…',
    education: 'e.g. finished school back home, then trained as an electrician…',
    proud: 'e.g. that he sent money home every single month for 20 years…',
    achievement: 'e.g. brought the whole family over, one by one…',
    memory: 'e.g. the yearly trip home for Eid…',
  },
  uk: {
    birthplace: 'e.g. Birmingham, or a small town in Punjab before moving…',
    grewup: 'e.g. above the family shop in Leicester…',
    education: 'e.g. left school at 16 to help the family business…',
    proud: 'e.g. that she was the first in the family to own a house…',
    achievement: 'e.g. opened the corner shop that fed the whole street…',
    memory: 'e.g. Sunday lunches with three generations at one table…',
  },
  'north-america': {
    birthplace: 'e.g. a small town in Gujarat, or Queens, New York…',
    grewup: 'e.g. moved to Chicago in the 90s, learned English at night school…',
    education: 'e.g. worked days, studied nights for a degree…',
    proud: 'e.g. that she put all three kids through college…',
    achievement: 'e.g. started the restaurant from a single food cart…',
    memory: 'e.g. Thanksgiving with both old and new traditions on the table…',
  },
  latam: {
    birthplace: 'e.g. a small pueblo in Oaxaca, or Buenos Aires…',
    grewup: 'e.g. helping in the family panadería after school…',
    education: 'e.g. the local escuela, then an apprenticeship…',
    proud: 'e.g. que crió a toda la familia sola — that she raised the family alone…',
    achievement: 'e.g. built the family business from a market stall…',
    memory: 'e.g. Sunday asados with the whole family together…',
  },
  'east-asia': {
    birthplace: 'e.g. a fishing village in Fujian, or Hong Kong…',
    grewup: 'e.g. above the family restaurant in a small town…',
    education: 'e.g. left school young to work, studied on their own after…',
    proud: 'e.g. that he never once missed sending money home…',
    achievement: 'e.g. built the family trading business from nothing…',
    memory: 'e.g. Lunar New Year with three generations under one roof…',
  },
  sea: {
    birthplace: 'e.g. a small barangay in Cebu, or Manila…',
    grewup: 'e.g. helped run the sari-sari store as a child…',
    education: 'e.g. the local school, then nursing college…',
    proud: 'e.g. that she worked abroad for 15 years to support everyone at home…',
    achievement: 'e.g. sent every sibling through school…',
    memory: 'e.g. the whole barangay gathering for fiesta…',
  },
};

/** The region-specific placeholder for a question id, or its default. */
export function regionPlaceholder(region: string, id: string, fallback?: string): string | undefined {
  return REGION_EXAMPLES[region]?.[id] ?? fallback;
}

/** A spoken-demo version of the region example (used for the simulated-mic fallback). */
export function regionDemoText(region: string, id: string, fallback: string): string {
  const raw = REGION_EXAMPLES[region]?.[id];
  if (!raw) return fallback;
  return raw.replace(/^e\.g\.\s*/i, '').replace(/…$/, '.');
}
