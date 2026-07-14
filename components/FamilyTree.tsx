'use client';

import { useRouter } from 'next/navigation';
import { useDesign } from '@/components/DesignProvider';
import DesignTree, { type TreeNode } from '@/components/DesignTree';
import type { SavedMember } from '@/lib/familyStore';

/**
 * The live family tree, rendered in the family's chosen album design.
 *
 * - With saved members (signed in), it lays everyone out by generation derived
 *   from their relationship, plus a "+" slot to add more.
 * - Without (demo / not signed in), it shows the prototype's three-generation
 *   layout with the featured person personalised.
 *
 * Genuinely different geometry per design comes from lib/treeLayout.ts.
 */

// Map a recorded relationship to a generation level (0 = oldest).
function levelFor(relationship: string | null): number {
  switch (relationship) {
    case 'grandparent':
      return 0;
    case 'parent_self':
    case 'parent_you':
    case 'both':
    case 'aunt_uncle':
      return 1;
    case 'myself':
    case 'sibling':
    case 'spouse':
    case 'cousin':
      return 2;
    case 'child':
      return 3;
    default:
      return 2; // "someone else" / unknown sits with the present generation
  }
}

function initialsOf(name: string | null | undefined): string {
  return (name ?? '').trim().split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

export default function FamilyTree({
  name,
  ini,
  photo,
  members,
}: {
  name: string;
  ini: string;
  photo?: string;
  members?: SavedMember[];
}) {
  const router = useRouter();
  const { design } = useDesign();

  const toBegin = () => router.push('/begin');
  const toProfile = (id?: string) => {
    if (id) {
      try {
        sessionStorage.setItem('ank-active-member', id);
      } catch {
        /* ignore */
      }
      // Carry the id in the URL so each node opens exactly that person (Bug 2).
      router.push(`/profile?id=${id}`);
      return;
    }
    router.push('/profile');
  };

  // ── Real members across generations ───────────────────────────────────────
  if (members && members.length > 0) {
    const sorted = [...members].sort((a, b) => levelFor(a.relationship) - levelFor(b.relationship));
    const nodes: TreeNode[] = sorted.map((m, i) => ({
      level: levelFor(m.relationship),
      label: m.full_name || 'Family member',
      featured: i === sorted.length - 1, // most recently added is highlighted
      photo: m.photo_url || undefined,
      ini: initialsOf(m.full_name),
      onClick: () => toProfile(m.id),
    }));

    // A "+" invitation at the youngest generation.
    const maxLevel = Math.max(...nodes.map((n) => n.level));
    nodes.push({ level: maxLevel + 1, label: 'Add', empty: true, onClick: toBegin });

    // Connect each node to the first node of the next generation present.
    const levels = Array.from(new Set(nodes.map((n) => n.level))).sort((a, b) => a - b);
    const firstAt = new Map<number, number>();
    nodes.forEach((n, idx) => {
      if (!firstAt.has(n.level)) firstAt.set(n.level, idx);
    });
    const edges: [number, number][] = [];
    nodes.forEach((n, idx) => {
      const nextLevel = levels[levels.indexOf(n.level) + 1];
      if (nextLevel !== undefined && firstAt.has(nextLevel)) edges.push([idx, firstAt.get(nextLevel)!]);
    });

    return <DesignTree design={design} nodes={nodes} edges={edges} width={580} height={360} />;
  }

  // ── Demo layout (not signed in) ───────────────────────────────────────────
  const nodes: TreeNode[] = [
    { level: 0, label: 'Grandfather', empty: true, onClick: toBegin },
    { level: 0, label: 'Grandmother', empty: true, onClick: toBegin },
    { level: 0, label: 'Grandfather', empty: true, onClick: toBegin },
    { level: 0, label: 'Grandmother', empty: true, onClick: toBegin },
    { level: 1, label: 'Father', empty: true, onClick: toBegin },
    { level: 1, label: 'Mother', empty: true, onClick: toBegin },
    { level: 2, label: name, featured: true, photo, ini, onClick: () => toProfile() },
    { level: 3, label: 'Add child', empty: true, onClick: toBegin },
    { level: 3, label: 'Add child', empty: true, onClick: toBegin },
    { level: 3, label: 'Add child', empty: true, onClick: toBegin },
  ];
  const edges: [number, number][] = [
    [0, 4], [1, 4], [2, 5], [3, 5], [4, 6], [5, 6], [6, 7], [6, 8], [6, 9],
  ];

  return <DesignTree design={design} nodes={nodes} edges={edges} width={580} height={340} />;
}
