'use client';

import { useRouter } from 'next/navigation';

/**
 * SVG family tree, ported from the prototype. The featured person renders larger
 * and gold-filled (photo via clipPath when present); known links are solid,
 * empty slots are dashed "+" invitations that deep-link into the add-member flow.
 *
 * Phase 1 uses the prototype's fixed 3-generation layout with the featured node
 * personalised. The level-based algorithm for unlimited generations (cursor
 * Prompt 6) lands when profiles are loaded from Supabase.
 */

interface Node {
  x: number;
  y: number;
  label: string;
  empty?: boolean;
  featured?: boolean;
  photo?: string;
  ini?: string;
}

export default function FamilyTree({
  name,
  ini,
  photo,
}: {
  name: string;
  ini: string;
  photo?: string;
}) {
  const router = useRouter();

  const N: Node[] = [
    { x: 120, y: 55, label: 'Grandfather', empty: true },
    { x: 240, y: 55, label: 'Grandmother', empty: true },
    { x: 350, y: 55, label: 'Grandfather', empty: true },
    { x: 460, y: 55, label: 'Grandmother', empty: true },
    { x: 180, y: 150, label: 'Father', empty: true },
    { x: 380, y: 150, label: 'Mother', empty: true },
    { x: 290, y: 245, label: name, featured: true, photo, ini },
    { x: 170, y: 305, label: 'Add child', empty: true },
    { x: 290, y: 305, label: 'Add child', empty: true },
    { x: 410, y: 305, label: 'Add child', empty: true },
  ];
  const E: [number, number][] = [
    [0, 4], [1, 4], [2, 5], [3, 5], [4, 6], [5, 6], [6, 7], [6, 8], [6, 9],
  ];

  const clip = (label: string) => (label.length > 13 ? label.slice(0, 12) + '…' : label);

  return (
    <svg viewBox="0 0 580 320" width={580} height={320} role="img" aria-label="Family tree">
      {E.map(([a, b], i) => (
        <line
          key={i}
          x1={N[a].x}
          y1={N[a].y + 20}
          x2={N[b].x}
          y2={N[b].y - 20}
          stroke="var(--paper3)"
          strokeWidth={1.5}
          strokeDasharray={N[a].empty || N[b].empty ? '4 3' : undefined}
        />
      ))}
      {N.map((n, i) => {
        const r = n.featured ? 24 : 16;
        if (n.featured && n.photo) {
          return (
            <g key={i} onClick={() => router.push('/archive')} style={{ cursor: 'pointer' }}>
              <defs>
                <clipPath id={`c${i}`}>
                  <circle cx={n.x} cy={n.y} r={r} />
                </clipPath>
              </defs>
              <circle cx={n.x} cy={n.y} r={r + 2} fill="var(--g2)" />
              <image
                href={n.photo}
                x={n.x - r}
                y={n.y - r}
                width={r * 2}
                height={r * 2}
                clipPath={`url(#c${i})`}
                preserveAspectRatio="xMidYMid slice"
              />
              <circle cx={n.x} cy={n.y} r={r} fill="none" stroke="var(--g)" strokeWidth={2} />
              <text x={n.x} y={n.y + r + 13} textAnchor="middle" fontSize={11} fill="var(--ink2)" fontWeight={500}>
                {clip(n.label)}
              </text>
            </g>
          );
        }
        if (n.featured) {
          return (
            <g key={i} onClick={() => router.push('/archive')} style={{ cursor: 'pointer' }}>
              <circle cx={n.x} cy={n.y} r={r} fill="var(--g)" stroke="var(--g3)" strokeWidth={2} />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={11} fill="var(--w)" fontWeight={500}>
                {n.ini}
              </text>
              <text x={n.x} y={n.y + r + 13} textAnchor="middle" fontSize={11} fill="var(--ink2)" fontWeight={500}>
                {clip(n.label)}
              </text>
            </g>
          );
        }
        return (
          <g key={i} onClick={() => router.push('/begin')} style={{ cursor: 'pointer', opacity: 0.55 }}>
            <circle cx={n.x} cy={n.y} r={r} fill="var(--paper2)" stroke="var(--paper3)" strokeDasharray="3 2" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={12} fill="var(--ink4)">
              +
            </text>
            <text x={n.x} y={n.y + r + 12} textAnchor="middle" fontSize={9} fill="var(--ink4)">
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
