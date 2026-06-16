'use client';

import { useRouter } from 'next/navigation';
import { useDesign } from '@/components/DesignProvider';
import DesignTree, { SAMPLE_NODES, SAMPLE_EDGES } from '@/components/DesignTree';
import { ALBUM_DESIGNS, DESIGN_FAMILIES, type AlbumDesign } from '@/lib/albumDesigns';

/**
 * Feature Set A — the Design Gallery. Twenty distinct styles shown as live
 * miniature tree previews. Tapping one saves it as the family's album design,
 * which re-skins the tree, the Digital Book Studio, and the exported PDF.
 */
export default function DesignsPage() {
  const router = useRouter();
  const { designId, setDesignId } = useDesign();

  return (
    <div className="dash" style={{ maxWidth: 880 }}>
      <button className="bb" style={{ marginBottom: 16 }} onClick={() => router.push('/archive')}>
        ← Archive
      </button>
      <div className="dname serif" style={{ fontSize: 30, marginBottom: 2 }}>
        Choose your family&apos;s design
      </div>
      <div className="dsub" style={{ marginBottom: 8 }}>
        Twenty styles for your tree, your book, and your printed album. Pick one — the whole archive
        re-skins instantly. You can change it any time.
      </div>

      {DESIGN_FAMILIES.map((family) => (
        <div key={family}>
          <div className="slbl">{family}</div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 14,
              marginBottom: 8,
            }}
          >
            {ALBUM_DESIGNS.filter((d) => d.family === family).map((d) => (
              <DesignCard
                key={d.id}
                design={d}
                selected={d.id === designId}
                onSelect={() => setDesignId(d.id)}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="enote" style={{ marginTop: 18 }}>
        <i className="ti ti-sparkles" style={{ color: 'var(--g)' }} /> Your selection drives the live
        family tree, the Digital Book Studio, and the printed-book PDF — all from one choice.
      </div>
    </div>
  );
}

function DesignCard({
  design,
  selected,
  onSelect,
}: {
  design: AlbumDesign;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        textAlign: 'left',
        background: 'var(--w)',
        border: `1.5px solid ${selected ? 'var(--g)' : 'var(--paper3)'}`,
        borderRadius: 'var(--rl)',
        padding: 10,
        cursor: 'pointer',
        boxShadow: selected ? 'var(--sh2)' : 'var(--sh)',
        fontFamily: 'var(--font-jost)',
        position: 'relative',
        transition: 'all .2s',
      }}
      aria-pressed={selected}
    >
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            background: 'var(--g)',
            color: 'var(--w)',
            fontSize: 9,
            fontWeight: 600,
            padding: '3px 9px',
            borderRadius: 20,
            letterSpacing: 1,
          }}
        >
          SELECTED ✦
        </div>
      )}
      <DesignTree design={design} nodes={SAMPLE_NODES} edges={SAMPLE_EDGES} width={300} height={150} preview />
      <div style={{ padding: '10px 4px 2px' }}>
        <div className="serif" style={{ fontSize: 17, color: 'var(--ink)' }}>
          {design.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink3)', fontWeight: 300, lineHeight: 1.5, marginTop: 2 }}>
          {design.description}
        </div>
      </div>
    </button>
  );
}
