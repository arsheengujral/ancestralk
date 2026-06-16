'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface SessionUser {
  id: string;
  email?: string;
}

/**
 * Lightweight client auth state. Returns the signed-in user (or null) and
 * whether auth is even configured. In degraded mode (no Supabase) `configured`
 * is false and the app stays fully usable without an account.
 */
export function useUser() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const configured = Boolean(supabase);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? undefined } : null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signOut() {
    await supabase?.auth.signOut();
    setUser(null);
  }

  return { user, loading, configured, signOut };
}
