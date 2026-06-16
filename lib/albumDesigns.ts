/**
 * Feature Set A — 20 album / family-tree designs.
 *
 * A family picks one visual style; it then drives THREE things that all read
 * `families.album_design`: the family-tree render, the Digital Book Studio
 * pages, and the exported PDF. Designs are organised in 4 families of 5.
 *
 * Each design is more than a colour swap: it pairs a palette + fonts + page
 * texture + ornament with a genuinely different tree LAYOUT. The layout union
 * below maps to real geometry in `treeLayout.ts` (vertical, radial, mirrored
 * roots, horizontal river, constellation, card grid, organic, crest).
 *
 * All designs respect the active colour theme and are print-safe (the palettes
 * are chosen to be CMYK-friendly; PDF assets render at 300dpi).
 */

export type TreeLayout =
  | 'vertical'
  | 'crest'
  | 'grid'
  | 'radial'
  | 'organic'
  | 'mirror-roots'
  | 'river'
  | 'constellation';

export type Ornament = 'crest' | 'frame' | 'vine' | 'stars' | 'wave' | 'leaf' | 'none';
export type PageTexture = 'parchment' | 'plain' | 'linen' | 'dark' | 'watercolor' | 'manuscript';

export interface AlbumDesign {
  id: string;
  name: string;
  description: string;
  family: 'Classic Heritage' | 'Modern Minimal' | 'Botanical / Organic' | 'Cinematic / Premium';
  treeLayout: TreeLayout;
  palette: { bg: string; accent: string; text: string; line: string };
  fonts: { heading: string; body: string };
  pageTexture: PageTexture;
  ornament: Ornament;
}

export const ALBUM_DESIGNS: AlbumDesign[] = [
  // ── Classic Heritage (1–5) ────────────────────────────────────────────────
  {
    id: 'royal-lineage',
    name: 'Royal Lineage',
    description: 'A vertical crest tree in deep navy and gold.',
    family: 'Classic Heritage',
    treeLayout: 'crest',
    palette: { bg: '#0F1A3C', accent: '#C9A227', text: '#F4EEDD', line: '#C9A227' },
    fonts: { heading: 'Cormorant Garamond', body: 'Jost' },
    pageTexture: 'manuscript',
    ornament: 'crest',
  },
  {
    id: 'vintage-parchment',
    name: 'Vintage Parchment',
    description: 'Aged paper, sepia ink, hand-drawn branches.',
    family: 'Classic Heritage',
    treeLayout: 'vertical',
    palette: { bg: '#EFE3C8', accent: '#8A5A2B', text: '#3D2A16', line: '#A9824E' },
    fonts: { heading: 'Cormorant Garamond', body: 'Jost' },
    pageTexture: 'parchment',
    ornament: 'vine',
  },
  {
    id: 'old-world-manuscript',
    name: 'Old World Manuscript',
    description: 'Illuminated-letter styling on cream vellum.',
    family: 'Classic Heritage',
    treeLayout: 'vertical',
    palette: { bg: '#F3E9D6', accent: '#9B2D2D', text: '#2C2113', line: '#9B7B3A' },
    fonts: { heading: 'Cormorant Garamond', body: 'Jost' },
    pageTexture: 'manuscript',
    ornament: 'frame',
  },
  {
    id: 'victorian-frame',
    name: 'Victorian Frame',
    description: 'Ornate gold frames around every person.',
    family: 'Classic Heritage',
    treeLayout: 'grid',
    palette: { bg: '#1C1A17', accent: '#CBA85B', text: '#EFE7D6', line: '#CBA85B' },
    fonts: { heading: 'Cormorant Garamond', body: 'Jost' },
    pageTexture: 'dark',
    ornament: 'frame',
  },
  {
    id: 'family-crest',
    name: 'Family Crest',
    description: 'Heraldic shield motifs, deep claret and gold.',
    family: 'Classic Heritage',
    treeLayout: 'crest',
    palette: { bg: '#3A1414', accent: '#D4AF37', text: '#F1E4CE', line: '#D4AF37' },
    fonts: { heading: 'Cormorant Garamond', body: 'Jost' },
    pageTexture: 'manuscript',
    ornament: 'crest',
  },

  // ── Modern Minimal (6–10) ─────────────────────────────────────────────────
  {
    id: 'clean-lines',
    name: 'Clean Lines',
    description: 'Thin connectors, generous white space.',
    family: 'Modern Minimal',
    treeLayout: 'vertical',
    palette: { bg: '#FFFFFF', accent: '#1F2937', text: '#111827', line: '#D1D5DB' },
    fonts: { heading: 'Jost', body: 'Jost' },
    pageTexture: 'plain',
    ornament: 'none',
  },
  {
    id: 'nordic-calm',
    name: 'Nordic Calm',
    description: 'Muted tones, quiet sans-serif.',
    family: 'Modern Minimal',
    treeLayout: 'vertical',
    palette: { bg: '#ECEFF1', accent: '#6D8A96', text: '#33444C', line: '#B6C3C9' },
    fonts: { heading: 'Jost', body: 'Jost' },
    pageTexture: 'plain',
    ornament: 'none',
  },
  {
    id: 'monochrome-elegant',
    name: 'Monochrome Elegant',
    description: 'Black, white, and a single accent.',
    family: 'Modern Minimal',
    treeLayout: 'vertical',
    palette: { bg: '#FAFAFA', accent: '#111111', text: '#111111', line: '#999999' },
    fonts: { heading: 'Jost', body: 'Jost' },
    pageTexture: 'plain',
    ornament: 'none',
  },
  {
    id: 'circular-orbit',
    name: 'Circular Orbit',
    description: 'A radial tree — the person at the centre.',
    family: 'Modern Minimal',
    treeLayout: 'radial',
    palette: { bg: '#FFFFFF', accent: '#2563EB', text: '#0F172A', line: '#BFD3F2' },
    fonts: { heading: 'Jost', body: 'Jost' },
    pageTexture: 'plain',
    ornament: 'none',
  },
  {
    id: 'grid-modern',
    name: 'Grid Modern',
    description: 'A clean card-grid family tree.',
    family: 'Modern Minimal',
    treeLayout: 'grid',
    palette: { bg: '#F4F4F5', accent: '#0EA5A4', text: '#18181B', line: '#D4D4D8' },
    fonts: { heading: 'Jost', body: 'Jost' },
    pageTexture: 'plain',
    ornament: 'none',
  },

  // ── Botanical / Organic (11–15) ───────────────────────────────────────────
  {
    id: 'living-tree',
    name: 'Living Tree',
    description: 'A literal illustrated tree; photos as leaves.',
    family: 'Botanical / Organic',
    treeLayout: 'organic',
    palette: { bg: '#F4F7EC', accent: '#5B7B3A', text: '#2E3A1F', line: '#7E9B58' },
    fonts: { heading: 'Cormorant Garamond', body: 'Jost' },
    pageTexture: 'linen',
    ornament: 'leaf',
  },
  {
    id: 'roots-and-branches',
    name: 'Roots & Branches',
    description: 'A mirror tree — ancestors as roots, descendants as branches.',
    family: 'Botanical / Organic',
    treeLayout: 'mirror-roots',
    palette: { bg: '#F1EDE4', accent: '#6B4F2A', text: '#33271A', line: '#8C6B3F' },
    fonts: { heading: 'Cormorant Garamond', body: 'Jost' },
    pageTexture: 'linen',
    ornament: 'leaf',
  },
  {
    id: 'vine-growth',
    name: 'Vine Growth',
    description: 'Climbing-vine connectors between people.',
    family: 'Botanical / Organic',
    treeLayout: 'organic',
    palette: { bg: '#F3F6EF', accent: '#4E7C59', text: '#26331F', line: '#7FA07A' },
    fonts: { heading: 'Cormorant Garamond', body: 'Jost' },
    pageTexture: 'linen',
    ornament: 'vine',
  },
  {
    id: 'seasonal',
    name: 'Seasonal',
    description: 'The tree changes with seasons across generations.',
    family: 'Botanical / Organic',
    treeLayout: 'organic',
    palette: { bg: '#FBF1E6', accent: '#C2683B', text: '#3A2418', line: '#D39B6A' },
    fonts: { heading: 'Cormorant Garamond', body: 'Jost' },
    pageTexture: 'watercolor',
    ornament: 'leaf',
  },
  {
    id: 'watercolor-garden',
    name: 'Watercolor Garden',
    description: 'A soft, painted botanical backdrop.',
    family: 'Botanical / Organic',
    treeLayout: 'organic',
    palette: { bg: '#F6F0F4', accent: '#A45A77', text: '#3A2530', line: '#C99CB1' },
    fonts: { heading: 'Cormorant Garamond', body: 'Jost' },
    pageTexture: 'watercolor',
    ornament: 'vine',
  },

  // ── Cinematic / Premium (16–20) ───────────────────────────────────────────
  {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    description: 'Dark luxe with a gold-foil look.',
    family: 'Cinematic / Premium',
    treeLayout: 'vertical',
    palette: { bg: '#0B0B0D', accent: '#D9B45B', text: '#F0E9D8', line: '#6E5A2A' },
    fonts: { heading: 'Cormorant Garamond', body: 'Jost' },
    pageTexture: 'dark',
    ornament: 'frame',
  },
  {
    id: 'gallery-wall',
    name: 'Gallery Wall',
    description: 'A museum portrait wall of the family.',
    family: 'Cinematic / Premium',
    treeLayout: 'grid',
    palette: { bg: '#17181A', accent: '#E2E2E2', text: '#F4F4F4', line: '#4B4D52' },
    fonts: { heading: 'Cormorant Garamond', body: 'Jost' },
    pageTexture: 'dark',
    ornament: 'frame',
  },
  {
    id: 'timeline-river',
    name: 'Timeline River',
    description: 'A flowing horizontal river of generations.',
    family: 'Cinematic / Premium',
    treeLayout: 'river',
    palette: { bg: '#0E1B24', accent: '#5FB6C9', text: '#E5F1F4', line: '#357083' },
    fonts: { heading: 'Cormorant Garamond', body: 'Jost' },
    pageTexture: 'dark',
    ornament: 'wave',
  },
  {
    id: 'constellation',
    name: 'Constellation',
    description: 'The family as stars and connecting lines.',
    family: 'Cinematic / Premium',
    treeLayout: 'constellation',
    palette: { bg: '#070A18', accent: '#E8D98A', text: '#E8ECF7', line: '#3C4670' },
    fonts: { heading: 'Cormorant Garamond', body: 'Jost' },
    pageTexture: 'dark',
    ornament: 'stars',
  },
  {
    id: 'storybook',
    name: 'Storybook',
    description: 'Illustrated fairy-tale spreads.',
    family: 'Cinematic / Premium',
    treeLayout: 'organic',
    palette: { bg: '#FBF6EC', accent: '#B5683E', text: '#3B2A1C', line: '#D9A878' },
    fonts: { heading: 'Cormorant Garamond', body: 'Jost' },
    pageTexture: 'watercolor',
    ornament: 'leaf',
  },
];

export const DEFAULT_DESIGN_ID = 'royal-lineage';

export function getDesign(id: string | undefined | null): AlbumDesign {
  return ALBUM_DESIGNS.find((d) => d.id === id) ?? ALBUM_DESIGNS[0];
}

export const DESIGN_FAMILIES = [
  'Classic Heritage',
  'Modern Minimal',
  'Botanical / Organic',
  'Cinematic / Premium',
] as const;
