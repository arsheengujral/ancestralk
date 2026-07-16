import { Cormorant_Garamond, Jost, Figtree } from 'next/font/google';

// Headings — warm literary serif. Matches the prototype's Cormorant Garamond.
export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

// Body — quiet, premium sans. Matches the prototype's Jost.
export const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
  display: 'swap',
});

// ATTIRA Skin module UI sans — the humanist sans from the approved Skincare v2
// design handoff. Scoped to the /attira surface only.
export const figtree = Figtree({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-figtree',
  display: 'swap',
});
