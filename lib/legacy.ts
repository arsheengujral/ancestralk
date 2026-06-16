/** Generational inheritance — types + metadata (Feature Set B). */

export type InheritanceMode = 'scheduled' | 'named_heir' | 'multi_generation';
export type Role = 'owner' | 'keeper' | 'contributor' | 'viewer';

export interface LegacyConfig {
  mode: InheritanceMode;
  successorNames: string[];
  transferDate: string; // ISO date or ''
  inactivityMonths: number;
}

export const DEFAULT_LEGACY: LegacyConfig = {
  mode: 'multi_generation',
  successorNames: [],
  transferDate: '',
  inactivityMonths: 12,
};

export const INHERITANCE_MODES: {
  mode: InheritanceMode;
  title: string;
  torch: string;
  blurb: string;
  icon: string;
}[] = [
  {
    mode: 'multi_generation',
    title: 'Many hands, across generations',
    torch: 'The torch is shared and passed, hand to hand, forever.',
    blurb:
      'Each child gets their own login. Roles move up over a lifetime — a child who joins at 12 as a Viewer can become a Contributor, then a Keeper, then inherit as Owner. The archive never has a single point of failure.',
    icon: 'ti-users-group',
  },
  {
    mode: 'named_heir',
    title: 'A named keeper',
    torch: 'You choose who carries the torch when you set it down.',
    blurb:
      'Name one or more Heirs from your family. On your chosen trigger, an Heir is promoted to keep the archive. They carry a quiet badge: "You are a designated keeper of this archive."',
    icon: 'ti-shield-star',
  },
  {
    mode: 'scheduled',
    title: 'A gentle handover in time',
    torch: 'If the day comes that you cannot, the torch passes on its own.',
    blurb:
      'Set a date, or a span of quiet. Before anything changes, a warm check-in asks if you are still keeping the archive. Only if it goes unanswered does the keeper role pass to your named successor.',
    icon: 'ti-calendar-heart',
  },
];

export const ROLE_LADDER: { role: Role; label: string; can: string }[] = [
  { role: 'owner', label: 'Owner', can: 'Holds the archive; can pass it on.' },
  { role: 'keeper', label: 'Keeper', can: 'Cares for the whole archive alongside the owner.' },
  { role: 'contributor', label: 'Contributor', can: 'Adds and edits their own chapters and media.' },
  { role: 'viewer', label: 'Viewer', can: 'Reads and listens; grows into more over time.' },
];
