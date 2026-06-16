import type { TreeLayout } from './albumDesigns';

/**
 * Geometry for the eight tree layouts. Given nodes tagged with a generation
 * `level` (0 = oldest ancestors, increasing downward) and which one is
 * `featured`, returns normalised positions in a 0–100 box. The same function
 * drives both the miniature gallery previews and the full interactive tree, so
 * every design's layout is genuinely different — not a recolour.
 */

export interface LayoutNode {
  level: number;
  featured?: boolean;
}

export interface Pos {
  x: number;
  y: number;
}

// Deterministic pseudo-random in [0,1) from an integer seed (constellation).
function rand(seed: number): number {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function spread(idx: number, count: number, lo = 12, hi = 88): number {
  if (count <= 1) return (lo + hi) / 2;
  return lo + (idx / (count - 1)) * (hi - lo);
}

export function computePositions(layout: TreeLayout, nodes: LayoutNode[]): Pos[] {
  // Index nodes within their level.
  const levels = Array.from(new Set(nodes.map((n) => n.level))).sort((a, b) => a - b);
  const levelIndex = new Map<number, number>(levels.map((l, i) => [l, i]));
  const inLevel = new Map<number, number[]>();
  nodes.forEach((n, i) => {
    const arr = inLevel.get(n.level) ?? [];
    arr.push(i);
    inLevel.set(n.level, arr);
  });
  const featuredLevel = nodes.find((n) => n.featured)?.level ?? levels[Math.floor(levels.length / 2)];

  const posOf = (i: number): Pos => {
    const n = nodes[i];
    const peers = inLevel.get(n.level)!;
    const idx = peers.indexOf(i);
    const count = peers.length;
    const li = levelIndex.get(n.level)!;
    const delta = n.level - featuredLevel;

    switch (layout) {
      case 'radial': {
        if (n.featured) return { x: 50, y: 50 };
        const r = 16 + Math.abs(delta) * 17;
        const a = (idx / count) * Math.PI * 2 + (li % 2 ? 0.4 : 0);
        return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
      }
      case 'mirror-roots': {
        // Ancestors sink downward as roots; descendants rise as branches.
        const step = 20;
        return { x: spread(idx, count), y: 50 - delta * step };
      }
      case 'river': {
        // Generations flow left → right along a gentle wave.
        const x = spread(li, levels.length, 12, 88);
        const wave = Math.sin(li * 1.1) * 8;
        const y = spread(idx, count, 28, 72) + wave;
        return { x, y };
      }
      case 'constellation': {
        if (n.featured) return { x: 50, y: 50 };
        return { x: 12 + rand(i * 3 + 1) * 76, y: 12 + rand(i * 3 + 2) * 76 };
      }
      case 'grid': {
        const cols = Math.ceil(Math.sqrt(nodes.length));
        const col = i % cols;
        const row = Math.floor(i / cols);
        const rows = Math.ceil(nodes.length / cols);
        return { x: spread(col, cols, 16, 84), y: spread(row, rows, 16, 84) };
      }
      case 'organic': {
        // A trunk that sways; people alternate to either side as it climbs.
        const y = spread(li, levels.length, 14, 88);
        const side = idx % 2 === 0 ? -1 : 1;
        const amp = count === 1 ? 0 : 10 + (idx % 3) * 6;
        const sway = Math.sin(li * 0.9) * 8;
        return { x: 50 + sway + (count === 1 ? 0 : side * amp), y };
      }
      case 'crest':
      case 'vertical':
      default: {
        const y = spread(li, levels.length, 12, 88);
        return { x: spread(idx, count), y };
      }
    }
  };

  return nodes.map((_, i) => posOf(i));
}

/** Whether a layout reads better with curved connectors. */
export function curvedEdges(layout: TreeLayout): boolean {
  return layout === 'organic' || layout === 'river';
}
