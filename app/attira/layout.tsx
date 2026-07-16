import type { Metadata, Viewport } from 'next';
import './attira.css';

export const metadata: Metadata = {
  title: 'ATTIRA — Your skin, getting stronger',
  description:
    'The ATTIRA Skin ritual — a calm, personal companion for your morning and night routines, your check-ins, your ingredients, and your progress.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ece7df',
};

export default function AttiraLayout({ children }: { children: React.ReactNode }) {
  return children;
}
