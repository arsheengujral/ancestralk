'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Client-side onboarding flow state. Mirrors the prototype's global `S` object so
 * the begin → chapter → dashboard journey keeps its data across route changes,
 * even before a backend session exists (degraded/mock mode). Persisted to
 * sessionStorage so a refresh mid-flow doesn't lose the family's words.
 */

export interface ChapterResult {
  bodyParagraphs: string[];
  tags: string[];
  quote: string;
  timeline: { year: string; title: string }[];
}

export interface FlowState {
  who: string;
  name: string;
  year: string;
  town: string;
  known: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  photo: string; // data URL (mock) or signed URL (real)
  recs: Record<string, boolean>;
  chapter: ChapterResult | null;
}

const EMPTY: FlowState = {
  who: '', name: '', year: '', town: '', known: '',
  q1: '', q2: '', q3: '', q4: '', q5: '',
  photo: '', recs: {}, chapter: null,
};

interface FlowContextValue {
  state: FlowState;
  ini: string;
  set: <K extends keyof FlowState>(key: K, value: FlowState[K]) => void;
  setRec: (id: string) => void;
  reset: () => void;
}

const FlowContext = createContext<FlowContextValue | null>(null);
const KEY = 'ank-flow';

export function FlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FlowState>(EMPTY);

  // Hydrate from sessionStorage once on mount.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  // Persist on change.
  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const value = useMemo<FlowContextValue>(() => {
    const ini =
      state.name
        .trim()
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'ME';

    return {
      state,
      ini,
      set: (key, val) => setState((s) => ({ ...s, [key]: val })),
      setRec: (id) => setState((s) => ({ ...s, recs: { ...s.recs, [id]: true } })),
      reset: () => setState(EMPTY),
    };
  }, [state]);

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlow() {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error('useFlow must be used within FlowProvider');
  return ctx;
}
