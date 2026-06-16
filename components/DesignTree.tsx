'use client';

import { computePositions, curvedEdges, type LayoutNode } from '@/lib/treeLayout';
import type { AlbumDesign } from '@/lib/albumDesigns';

/**
 * Renders a family tree in a given design's layout + palette. Used both for the
 * miniature gallery previews (sample data, non-interactive) and the live
 * dashboard tree (real nodes, clickable). Genuinely different geometry per
 * design comes from lib/treeLayout.ts.
 */

export interface TreeNode {
  level: number;
  label: string;
  featured?: boolean;
  empty?: boolean;
  photo?: string;
  ini?: string;
  onClick?: () => void;
}

export default function DesignTree({
  design,
  nodes,
  edges,
  width = 580,
  height = 320,
  preview = false,
}: {
  design: AlbumDesign;
  nodes: TreeNode[];
  edges: [number, number][];
  width?: number;
  height?: number;
  preview?: boolean;
}) {
  const { palette, treeLayout, ornament } = design;
  const layoutNodes: LayoutNode[] = nodes.map((n) => ({ level: n.level, featured: n.featured }));
  const pts = computePositions(treeLayout, layoutNodes);

  // Map normalised 0–100 coords into the viewBox with padding.
  const PAD = 8;
  const sx = (x: number) => PAD + (x / 100) * (100 - 2 * PAD);
  const sy = (y: number) => PAD + (y / 100) * (100 - 2 * PAD);
  const baseR = preview ? 5.5 : 5;
  const featR = preview ? 8 : 8;

  const curved = curvedEdges(treeLayout);
  const isStars = ornament === 'stars' || treeLayout === 'constellation';

  return (
    <svg
      viewBox="0 0 100 100"
      width={width}
      height={height}
      role="img"
      aria-label={`Family tree — ${design.name}`}
      style={{ background: palette.bg, borderRadius: preview ? 10 : 'var(--rl)', maxWidth: '100%' }}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* edges */}
      {edges.map(([a, b], i) => {
        const p1 = pts[a];
        const p2 = pts[b];
        if (!p1 || !p2) return null;
        if (curved) {
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2 - 6;
          return (
            <path
              key={i}
              d={`M ${sx(p1.x)} ${sy(p1.y)} Q ${sx(mx)} ${sy(my)} ${sx(p2.x)} ${sy(p2.y)}`}
              fill="none"
              stroke={palette.line}
              strokeWidth={0.6}
              opacity={0.7}
            />
          );
        }
        return (
          <line
            key={i}
            x1={sx(p1.x)}
            y1={sy(p1.y)}
            x2={sx(p2.x)}
            y2={sy(p2.y)}
            stroke={palette.line}
            strokeWidth={isStars ? 0.3 : 0.6}
            opacity={isStars ? 0.5 : 0.75}
            strokeDasharray={nodes[a]?.empty || nodes[b]?.empty ? '2 1.5' : undefined}
          />
        );
      })}

      {/* nodes */}
      {nodes.map((n, i) => {
        const p = pts[i];
        if (!p) return null;
        const cx = sx(p.x);
        const cy = sy(p.y);
        const r = n.featured ? featR : baseR;
        const clickable = Boolean(n.onClick);
        const common = {
          onClick: n.onClick,
          style: { cursor: clickable ? 'pointer' : 'default', opacity: n.empty ? 0.5 : 1 } as const,
        };

        // Ornament backing for the featured node.
        const crest =
          n.featured && (ornament === 'crest' || ornament === 'frame') ? (
            <rect
              x={cx - r - 1.5}
              y={cy - r - 1.5}
              width={(r + 1.5) * 2}
              height={(r + 1.5) * 2}
              rx={ornament === 'crest' ? 1.5 : 0.5}
              fill="none"
              stroke={palette.accent}
              strokeWidth={0.7}
            />
          ) : null;

        if (n.featured && n.photo) {
          return (
            <g key={i} {...common}>
              {crest}
              <defs>
                <clipPath id={`dc${i}`}>
                  <circle cx={cx} cy={cy} r={r} />
                </clipPath>
              </defs>
              <circle cx={cx} cy={cy} r={r + 0.8} fill={palette.accent} />
              <image
                href={n.photo}
                x={cx - r}
                y={cy - r}
                width={r * 2}
                height={r * 2}
                clipPath={`url(#dc${i})`}
                preserveAspectRatio="xMidYMid slice"
              />
              {!preview && (
                <text x={cx} y={cy + r + 4} textAnchor="middle" fontSize={3} fill={palette.text} fontWeight={600}>
                  {n.label.length > 14 ? n.label.slice(0, 13) + '…' : n.label}
                </text>
              )}
            </g>
          );
        }

        return (
          <g key={i} {...common}>
            {crest}
            {isStars && !n.empty ? (
              <circle cx={cx} cy={cy} r={r * 0.5} fill={palette.accent}>
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
              </circle>
            ) : (
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={n.empty ? 'transparent' : n.featured ? palette.accent : palette.bg}
                stroke={n.featured ? palette.accent : palette.line}
                strokeWidth={n.featured ? 1 : 0.6}
                strokeDasharray={n.empty ? '1.5 1.2' : undefined}
              />
            )}
            {!n.empty && !isStars && (
              <text
                x={cx}
                y={cy + 1.2}
                textAnchor="middle"
                fontSize={n.featured ? 3.4 : 2.8}
                fill={n.featured ? palette.bg : palette.text}
                fontWeight={600}
              >
                {n.ini ?? n.label.slice(0, 2).toUpperCase()}
              </text>
            )}
            {n.empty && (
              <text x={cx} y={cy + 1.4} textAnchor="middle" fontSize={4} fill={palette.line}>
                +
              </text>
            )}
            {!preview && !n.featured && (
              <text x={cx} y={cy + r + 3.5} textAnchor="middle" fontSize={2.6} fill={palette.text} opacity={0.8}>
                {n.label.length > 12 ? n.label.slice(0, 11) + '…' : n.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Sample 6-node family used for the gallery thumbnails. */
export const SAMPLE_NODES: TreeNode[] = [
  { level: 0, label: 'Grandfather', ini: 'GF' },
  { level: 0, label: 'Grandmother', ini: 'GM' },
  { level: 1, label: 'Father', ini: 'FA' },
  { level: 1, label: 'Mother', ini: 'MO' },
  { level: 2, label: 'You', ini: 'ME', featured: true },
  { level: 3, label: 'Child', ini: 'CH' },
];
export const SAMPLE_EDGES: [number, number][] = [
  [0, 2], [1, 2], [2, 4], [3, 4], [4, 5],
];
