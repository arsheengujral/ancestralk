'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useFlow } from '@/components/FlowProvider';
import { useDesign } from '@/components/DesignProvider';
import DesignTree, { SAMPLE_NODES, SAMPLE_EDGES } from '@/components/DesignTree';

interface Media {
  type: 'img' | 'vid';
  src: string;
}

/**
 * Digital Book Studio — a living book composed from the family's chapters and
 * media, flipped through page by page, then orderable in print. Ported from the
 * prototype's bkPages(). The chapter text is pulled from the in-flow chapter
 * when present. Phase 1 renders the prototype's eight-page layout; in later
 * phases pages compose from all profiles and read the chosen album design.
 */
export default function BookPage() {
  const router = useRouter();
  const { state, ini } = useFlow();
  const { design } = useDesign();
  const [page, setPage] = useState(0);
  const [media, setMedia] = useState<Media[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const name = state.name || 'Margaret Ellis';
  const fam = name.split(' ').slice(-1)[0];
  const chap =
    state.chapter?.bodyParagraphs[0] ??
    'Their chapter appears here once written — complete the story step to fill this page.';

  function addMedia(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setMedia((m) => [...m, { type: f.type.startsWith('video') ? 'vid' : 'img', src: ev.target?.result as string }]);
      };
      reader.readAsDataURL(f);
    });
  }

  const photos = media.filter((m) => m.type === 'img');
  const videos = media.filter((m) => m.type === 'vid');

  const pages: React.ReactNode[] = [
    // Cover
    <div key="cover" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--g)', marginBottom: 14 }}>ANCESTRALK PRESENTS</div>
      <div className="serif" style={{ fontSize: 34, lineHeight: 1.2, marginBottom: 10 }}>The {fam} Family</div>
      <div style={{ fontSize: 12, color: 'var(--ink3)', letterSpacing: 1 }}>A LIVING LEGACY · 2026</div>
      <div style={{ fontSize: 22, color: 'var(--g)', marginTop: 18 }}>✦</div>
      <div style={{ fontSize: 10, color: 'var(--ink4)', letterSpacing: 1, marginTop: 12 }}>
        {design.name.toUpperCase()} EDITION
      </div>
    </div>,
    // Tree — rendered in the family's chosen design (Set A drives the book).
    <div key="tree" style={{ flex: 1 }}>
      <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--g)', marginBottom: 12 }}>THE FAMILY TREE</div>
      <div style={{ textAlign: 'center' }}>
        <DesignTree
          design={design}
          nodes={SAMPLE_NODES.map((n) => (n.featured ? { ...n, label: name, photo: state.photo || undefined, ini } : n))}
          edges={SAMPLE_EDGES}
          width={380}
          height={210}
          preview
        />
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink4)', textAlign: 'center', fontWeight: 300, marginTop: 8 }}>
        {design.name} · the tree grows with every member added
      </div>
    </div>,
    // Chapter
    <div key="chap" style={{ flex: 1 }}>
      <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--g)', marginBottom: 12 }}>CHAPTER ONE</div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'center' }}>
        <div className="mav" style={{ width: 48, height: 48 }}>{state.photo ? <img src={state.photo} alt="" /> : ini}</div>
        <div>
          <div className="serif" style={{ fontSize: 19 }}>{name}</div>
          <div style={{ fontSize: 11, color: 'var(--ink3)' }}>
            {state.year ? `b. ${state.year}` : ''}{state.town ? `${state.year ? ' · ' : ''}${state.town}` : ''}
          </div>
        </div>
      </div>
      <div className="serif" style={{ fontSize: 13, lineHeight: 1.85, color: 'var(--ink2)' }}>
        {chap.slice(0, 420)}{chap.length > 420 ? '…' : ''}
      </div>
      <div style={{ fontSize: 10, color: 'var(--g3)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <i className="ti ti-qrcode" /> In print: scan to hear {name.split(' ')[0]}&apos;s voice
      </div>
    </div>,
    // Photographs
    <div key="photos" style={{ flex: 1 }}>
      <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--g)', marginBottom: 12 }}>PHOTOGRAPHS</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {photos.length ? (
          photos.slice(0, 4).map((m, i) => (
            <div key={i} style={{ aspectRatio: '1', borderRadius: 6, overflow: 'hidden' }}>
              <img src={m.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))
        ) : (
          <>
            <div style={{ aspectRatio: '1', borderRadius: 6, background: 'var(--paper2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🌿</div>
            <div style={{ aspectRatio: '1', borderRadius: 6, background: '#E8D5B0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🏡</div>
            <div style={{ aspectRatio: '1', borderRadius: 6, background: '#E0CEAD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👨‍👩‍👧‍👦</div>
            <div
              style={{ aspectRatio: '1', borderRadius: 6, border: '2px dashed var(--paper3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink4)', fontSize: 11, cursor: 'pointer' }}
              onClick={() => fileRef.current?.click()}
            >
              + Add
            </div>
          </>
        )}
      </div>
      <div style={{ fontSize: 10, color: 'var(--ink4)', marginTop: 10, fontWeight: 300, textAlign: 'center' }}>
        Photos auto-arrange by decade · captions from your tags
      </div>
    </div>,
    // Moving memories
    <div key="video" style={{ flex: 1 }}>
      <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--g)', marginBottom: 12 }}>MOVING MEMORIES</div>
      <div style={{ background: 'var(--dk)', borderRadius: 8, aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        {videos.length ? (
          <video src={videos[0].src} controls style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }} />
        ) : (
          <>
            <div style={{ fontSize: 30, color: 'var(--g)' }}><i className="ti ti-player-play" /></div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 6 }}>Family video · tap Add video above</div>
          </>
        )}
      </div>
      <div style={{ fontSize: 10, color: 'var(--g3)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <i className="ti ti-qrcode" /> In the printed book, this page carries a QR code — scan to watch
      </div>
    </div>,
    // Letters to the future
    <div key="letters" style={{ flex: 1 }}>
      <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--g)', marginBottom: 12 }}>LETTERS TO THE FUTURE</div>
      <div style={{ border: '1px solid var(--g2)', borderRadius: 8, padding: 16, background: 'var(--g5)', marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 3 }}>To: My grandchild</div>
        <div style={{ fontSize: 11, color: 'var(--ink3)', fontWeight: 300 }}>Sealed · opens on their 18th birthday</div>
        <div style={{ fontSize: 18, color: 'var(--g)', marginTop: 8 }}><i className="ti ti-lock" /></div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink4)', fontWeight: 300, textAlign: 'center' }}>
        Sealed letters appear here as locked pages — until their day comes
      </div>
    </div>,
    // Closing
    <div key="close" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div className="serif" style={{ fontSize: 22, lineHeight: 1.4, marginBottom: 12, fontStyle: 'italic', color: 'var(--ink2)' }}>
        &ldquo;No one in this family
        <br />
        will ever be forgotten.&rdquo;
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink4)', fontWeight: 300 }}>
        The next chapter belongs to whoever comes next.
        <br />
        This page is reserved for them.
      </div>
      <div style={{ fontSize: 18, color: 'var(--g)', marginTop: 16 }}>✦</div>
    </div>,
  ];

  const go = (d: number) => setPage((p) => Math.max(0, Math.min(pages.length - 1, p + d)));

  return (
    <div className="dash" style={{ maxWidth: 620 }}>
      <button className="bb" style={{ marginBottom: 16 }} onClick={() => router.push('/archive')}>
        ← Archive
      </button>
      <div className="dname serif" style={{ fontSize: 26, marginBottom: 2 }}>
        Digital Book Studio
      </div>
      <div className="dsub" style={{ marginBottom: 16 }}>
        Your photos, videos, and chapters — composed into a living book. Flip through, add media, then
        order in print.
      </div>

      <div className="ibox">
        <i className="ti ti-upload" />{' '}
        <span>
          <b>Add media to the book:</b> photos (JPG/PNG, min 1200px for print) and short videos (MP4,
          up to 2 min — they appear in the digital book as playable, and as QR codes in print).
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <button className="ibtn" onClick={() => fileRef.current?.click()}>
          <i className="ti ti-photo-plus" /> Add photos
        </button>
        <button className="bb" style={{ padding: '9px 14px', fontSize: 12 }} onClick={() => fileRef.current?.click()}>
          <i className="ti ti-video-plus" /> Add video
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={(e) => addMedia(e.target.files)} />

      <div style={{ background: 'var(--dk)', borderRadius: 'var(--rl)', padding: '26px 18px', marginBottom: 14 }}>
        <div
          style={{ background: 'var(--paper)', borderRadius: 8, minHeight: 380, padding: '28px 24px', boxShadow: '0 8px 40px rgba(0,0,0,.4)', position: 'relative', display: 'flex', flexDirection: 'column' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              {pages[page]}
            </motion.div>
          </AnimatePresence>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <button
            className="bb"
            style={{ background: 'rgba(255,255,255,.08)', borderColor: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.7)' }}
            onClick={() => go(-1)}
          >
            ← Previous
          </button>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
            Page {page + 1} of {pages.length}
          </div>
          <button
            className="bb"
            style={{ background: 'rgba(255,255,255,.08)', borderColor: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.7)' }}
            onClick={() => go(1)}
          >
            Next →
          </button>
        </div>
      </div>

      <div className="bkp">
        <div className="bkc">
          <div className="bkt">FAMILY</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', margin: '5px 0' }}>✦</div>
          <div className="bkt" style={{ fontSize: 8 }}>2026</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>Order this book in print</div>
          <div style={{ fontSize: 11, color: 'var(--ink3)', lineHeight: 1.55, marginBottom: 9, fontWeight: 300 }}>
            Exactly what you see here — hardcover, premium paper, QR codes that play voices and videos.
            Ships worldwide.
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button className="ibtn">Hardcover ₹2,800</button>
            <button className="bb" style={{ padding: '8px 12px', fontSize: 11 }}>Softcover ₹1,500</button>
            <button className="bb" style={{ padding: '8px 12px', fontSize: 11 }}>PDF free</button>
          </div>
        </div>
      </div>
    </div>
  );
}
