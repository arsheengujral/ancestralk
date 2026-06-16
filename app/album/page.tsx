'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFlow } from '@/components/FlowProvider';

type Tab = 'all' | 'person' | 'decade' | 'video' | 'book';

interface Cell {
  src?: string;
  emoji?: string;
  label?: string;
  bg?: string;
  tagging?: boolean;
  tagged?: boolean;
}

// NOTE: the prototype labels auto-tag badges "AI tagged", but the brand rule
// forbids the word "AI" anywhere in the UI — the intelligence is invisible. We
// keep the gold auto-tag badge and simply word it without "AI".
const SEED_CELLS: Cell[] = [
  { emoji: '🌿', label: 'Garden · 1970s', bg: '#E8D5B0', tagged: true },
  { emoji: '🏡', label: 'Home · 1980s', bg: '#D4C4A0', tagged: true },
  { emoji: '👨‍👩‍👧‍👦', label: 'Family · 1990s', bg: '#E0CEAD' },
  { emoji: '🎂', label: 'Birthday · 2000s', bg: '#CEBF9A' },
  { emoji: '📸', label: 'Recent · 2020s', bg: '#D8C9A6' },
];

export default function AlbumPage() {
  const router = useRouter();
  const { state } = useFlow();
  const [tab, setTab] = useState<Tab>('all');
  const [cells, setCells] = useState<Cell[]>(SEED_CELLS);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((f) => {
      if (!f.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        setCells((cs) => [...cs, { src, tagging: true }]);
        // Simulate the auto-tag completing.
        setTimeout(() => {
          setCells((cs) =>
            cs.map((c) => (c.src === src ? { ...c, tagging: false, tagged: true } : c)),
          );
        }, 1800);
      };
      reader.readAsDataURL(f);
    });
  }

  return (
    <div className="dash">
      <button className="bb" style={{ marginBottom: 16 }} onClick={() => router.push('/archive')}>
        ← Archive
      </button>
      <div className="dname serif" style={{ fontSize: 26, marginBottom: 2 }}>
        Family Album · 2026
      </div>
      <div className="dsub" style={{ marginBottom: 18 }}>
        Photos, videos, voices — organised automatically
      </div>

      <div className="atabs">
        {(['all', 'person', 'decade', 'video', 'book'] as Tab[]).map((t) => (
          <button key={t} className={`atab${tab === t ? ' on' : ''}`} onClick={() => setTab(t)}>
            {t === 'all' ? 'All' : t === 'person' ? 'By person' : t === 'decade' ? 'By decade' : t === 'video' ? 'Videos' : 'Photo book'}
          </button>
        ))}
      </div>

      <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={(e) => onFiles(e.target.files)} />

      {tab === 'all' && (
        <div>
          <div className="pdrop" style={{ marginBottom: 14 }} onClick={() => fileRef.current?.click()}>
            <div style={{ fontSize: 26, color: 'var(--paper3)', marginBottom: 5 }}>
              <i className="ti ti-cloud-upload" />
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink3)', fontWeight: 300 }}>
              Drop photos here, upload, or scan old printed photos with your camera
            </div>
            <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginTop: 10 }}>
              <button
                className="ibtn"
                onClick={(e) => {
                  e.stopPropagation();
                  fileRef.current?.click();
                }}
              >
                <i className="ti ti-upload" /> Upload
              </button>
              <button
                className="bb"
                style={{ padding: '8px 14px', fontSize: 12 }}
                onClick={(e) => {
                  e.stopPropagation();
                  alert(
                    'Scan flow: point your camera at any printed photo. It is enhanced, the decade estimated, faces recognised, and filed automatically. (Full camera flow in the mobile app.)',
                  );
                }}
              >
                <i className="ti ti-scan" /> Scan old photo
              </button>
            </div>
          </div>

          <div className="ag">
            {cells.map((c, i) => (
              <div className="acell" key={i} style={{ background: c.bg }}>
                {c.src && <img src={c.src} alt="" />}
                {!c.src && c.emoji}
                {c.label && <div className="acell-l">{c.label}</div>}
                {c.tagging && <div className="aibadge">Reading…</div>}
                {c.tagged && <div className="aibadge">Tagged</div>}
              </div>
            ))}
            <div
              className="acell"
              style={{ border: '2px dashed var(--paper3)', background: 'transparent' }}
              onClick={() => fileRef.current?.click()}
            >
              <i className="ti ti-plus" style={{ fontSize: 20, color: 'var(--paper3)' }} />
              <div className="acell-l">Add</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'person' && (
        <div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, marginBottom: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div className="mav" style={{ width: 50, height: 50, background: 'var(--g)', color: 'var(--w)' }}>
                All
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink3)', marginTop: 4 }}>Everyone</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="mav" style={{ width: 50, height: 50 }}>
                {state.photo ? <img src={state.photo} alt="" /> : 'ME'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink3)', marginTop: 4 }}>
                {(state.name || 'Member').split(' ')[0]}
              </div>
            </div>
            <div style={{ textAlign: 'center' }} onClick={() => router.push('/begin')}>
              <div
                className="mav"
                style={{ width: 50, height: 50, border: '2px dashed var(--paper3)', background: 'transparent', color: 'var(--paper3)' }}
              >
                +
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink3)', marginTop: 4 }}>Add</div>
            </div>
          </div>
          <div className="ag">
            <div className="acell" style={{ background: '#E8D5B0' }}>🌿</div>
            <div className="acell" style={{ background: '#E0CEAD' }}>👨‍👩‍👧‍👦</div>
            <div className="acell" style={{ background: '#CEBF9A' }}>🎂</div>
          </div>
        </div>
      )}

      {tab === 'decade' && (
        <div>
          <div className="slbl">1970s</div>
          <div className="ag">
            <div className="acell" style={{ background: '#E8D5B0' }}>🌿</div>
          </div>
          <div className="slbl">1980s</div>
          <div className="ag">
            <div className="acell" style={{ background: '#D4C4A0' }}>🏡</div>
          </div>
          <div className="slbl">1990s — now</div>
          <div className="ag">
            <div className="acell" style={{ background: '#E0CEAD' }}>👨‍👩‍👧‍👦</div>
            <div className="acell" style={{ background: '#CEBF9A' }}>🎂</div>
            <div className="acell" style={{ background: '#D8C9A6' }}>📸</div>
          </div>
        </div>
      )}

      {tab === 'video' && (
        <div>
          <div style={{ background: 'var(--dk)', borderRadius: 'var(--rl)', padding: 26, textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 34, color: 'var(--g)', marginBottom: 8 }}>
              <i className="ti ti-player-play" />
            </div>
            <div className="serif" style={{ fontSize: 18, color: 'var(--w)', marginBottom: 4 }}>
              The Family · 2026
            </div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 14 }}>
              Auto-compiled from photos, voices &amp; stories at renewal
            </div>
            <button className="ibtn">Preview video album</button>
          </div>
          <div className="pdrop" onClick={() => fileRef.current?.click()}>
            <div style={{ fontSize: 22, color: 'var(--paper3)' }}>
              <i className="ti ti-video" />
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink3)', fontWeight: 300, marginTop: 4 }}>
              Upload short family videos — linked to people &amp; events
            </div>
          </div>
        </div>
      )}

      {tab === 'book' && (
        <div>
          <div className="bkp">
            <div className="bkc">
              <div className="bkt">FAMILY</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', margin: '6px 0' }}>✦</div>
              <div className="bkt" style={{ fontSize: 8 }}>2026</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>
                The Family Legacy · 2026
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink3)', lineHeight: 1.6, marginBottom: 10, fontWeight: 300 }}>
                48 pages · hardcover · QR codes on each page play that person&apos;s voice when scanned ·
                ships worldwide
              </div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                <button className="ibtn">Order hardcover ₹2,800</button>
                <button className="bb" style={{ padding: '8px 13px', fontSize: 11 }}>
                  Softcover ₹1,500
                </button>
                <button className="bb" style={{ padding: '8px 13px', fontSize: 11 }}>
                  Download PDF free
                </button>
              </div>
            </div>
          </div>
          <div className="ibox">
            <i className="ti ti-qrcode" /> Every chapter page carries a QR code. Scan it with any
            phone — and hear that person&apos;s actual voice. The physical book meets the digital
            archive.
          </div>
          <button className="bp" onClick={() => router.push('/book')}>
            Open the Digital Book Studio
          </button>
        </div>
      )}
    </div>
  );
}
