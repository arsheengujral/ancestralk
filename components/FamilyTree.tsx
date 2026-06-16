'use client';

import { useRouter } from 'next/navigation';
import { useDesign } from '@/components/DesignProvider';
import DesignTree, { type TreeNode } from '@/components/DesignTree';

/**
 * The live family tree. Builds the real node set (featured person personalised,
 * empty slots as "+" invitations) and renders it through DesignTree using the
 * family's chosen album design — so the tree's layout and palette change with
 * the design (Feature Set A). Known links are solid; empty slots are dashed and
 * deep-link into the add-member flow.
 *
 * Phase 1's fixed three-generation set is retained; the level-based algorithm
 * for unlimited generations (cursor Prompt 6) extends this once profiles load
 * from Supabase.
 */
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
  const { design } = useDesign();

  const toBegin = () => router.push('/begin');
  const toProfile = () => router.push('/profile');

  const nodes: TreeNode[] = [
    { level: 0, label: 'Grandfather', empty: true, onClick: toBegin },
    { level: 0, label: 'Grandmother', empty: true, onClick: toBegin },
    { level: 0, label: 'Grandfather', empty: true, onClick: toBegin },
    { level: 0, label: 'Grandmother', empty: true, onClick: toBegin },
    { level: 1, label: 'Father', empty: true, onClick: toBegin },
    { level: 1, label: 'Mother', empty: true, onClick: toBegin },
    { level: 2, label: name, featured: true, photo, ini, onClick: toProfile },
    { level: 3, label: 'Add child', empty: true, onClick: toBegin },
    { level: 3, label: 'Add child', empty: true, onClick: toBegin },
    { level: 3, label: 'Add child', empty: true, onClick: toBegin },
  ];
  const edges: [number, number][] = [
    [0, 4], [1, 4], [2, 5], [3, 5], [4, 6], [5, 6], [6, 7], [6, 8], [6, 9],
  ];

  return <DesignTree design={design} nodes={nodes} edges={edges} width={580} height={340} />;
}
