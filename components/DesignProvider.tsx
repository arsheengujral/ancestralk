'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_DESIGN_ID, getDesign, type AlbumDesign } from '@/lib/albumDesigns';

/**
 * Holds the family's chosen album design (Feature Set A). In degraded/mock mode
 * the selection persists to localStorage; once Supabase is wired this reads and
 * writes `families.album_design`. The whole archive — tree, book, PDF — re-skins
 * instantly when this changes.
 */

interface DesignContextValue {
  design: AlbumDesign;
  designId: string;
  setDesignId: (id: string) => void;
}

const DesignContext = createContext<DesignContextValue | null>(null);
const KEY = 'ank-album-design';

export function DesignProvider({ children }: { children: ReactNode }) {
  const [designId, setDesignIdState] = useState<string>(DEFAULT_DESIGN_ID);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setDesignIdState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<DesignContextValue>(
    () => ({
      design: getDesign(designId),
      designId,
      setDesignId: (id: string) => {
        setDesignIdState(id);
        try {
          localStorage.setItem(KEY, id);
        } catch {
          /* ignore */
        }
        // TODO(Phase 3): persist to families.album_design via Supabase.
      },
    }),
    [designId],
  );

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

export function useDesign() {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error('useDesign must be used within DesignProvider');
  return ctx;
}
