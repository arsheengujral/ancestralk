import type { Config } from 'tailwindcss';

/**
 * Colors are wired to CSS custom properties (defined in app/globals.css) so the
 * five themes — Heritage / Emerald / Royal / Rose / Midnight — switch live via the
 * `data-theme` attribute on <body>, exactly like the prototype. Use the semantic
 * names (gold, paper, ink…) everywhere; never hardcode hex in components.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: 'var(--g)',
        goldDark: 'var(--g3)',
        goldLight: 'var(--g2)',
        gold5: 'var(--g5)',
        paper: 'var(--paper)',
        paper2: 'var(--paper2)',
        paper3: 'var(--paper3)',
        ink: 'var(--ink)',
        ink2: 'var(--ink2)',
        ink3: 'var(--ink3)',
        ink4: 'var(--ink4)',
        surface: 'var(--w)',
        deep: 'var(--dk)',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Cormorant Garamond', 'serif'],
        sans: ['var(--font-jost)', 'Jost', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: 'var(--r)',
        lg: 'var(--rl)',
      },
      boxShadow: {
        soft: 'var(--sh)',
        lift: 'var(--sh2)',
      },
    },
  },
  plugins: [],
};

export default config;
