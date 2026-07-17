'use client';

import { useEffect } from 'react';

/**
 * Route-level error boundary. Without this, any uncaught client exception on a
 * page shows Next.js's bare "Application error" screen with no way back except
 * a manual browser refresh — which reads as "the whole site is broken." This
 * gives people a real recovery path and logs the error for diagnosis.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Route error boundary caught:', error);
  }, [error]);

  return (
    <div className="fw" style={{ maxWidth: 480, paddingTop: 80, textAlign: 'center' }}>
      <div style={{ fontSize: 28, color: 'var(--g)', marginBottom: 12 }}>✦</div>
      <div className="ftit serif">Something went wrong</div>
      <div className="fsub">
        Nothing you saved was lost. Try again, or head back to your archive.
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
        <button className="bp" onClick={() => reset()}>
          Try again
        </button>
        <button className="bb" onClick={() => { window.location.href = '/archive'; }}>
          Go to my archive
        </button>
      </div>
    </div>
  );
}
