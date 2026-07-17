'use client';

import { useEffect } from 'react';

/**
 * Last-resort boundary for errors in the root layout itself (rarer, but this is
 * exactly the case that otherwise shows a permanently blank white screen with no
 * recovery). Renders its own <html>/<body> since it replaces the whole layout,
 * so it deliberately avoids depending on globals.css or any app component.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error('Global error boundary caught:', error);
  }, [error]);

  return (
    <html>
      <body style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 28, color: '#8a6d3b', marginBottom: 12 }}>✦</div>
        <h1 style={{ fontWeight: 400, fontSize: 24, marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>Nothing you saved was lost.</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 28px', borderRadius: 8, border: 'none', background: '#8a6d3b',
            color: '#fff', fontSize: 15, cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
