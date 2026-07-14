'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFlow } from '@/components/FlowProvider';
import { isDbActive, loadMembers, loadFutureMessages, type SavedMember, type FutureMessageRow } from '@/lib/familyStore';
import FamilyTree from '@/components/FamilyTree';
import Walkthrough from '@/components/Walkthrough';

function initialsOf(name: string | null | undefined): string {
  return (name ?? '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';
}

const REL_LABEL: Record<string, string> = {
  myself: 'Themselves', parent_self: 'Parent', parent_you: 'Parent', both: 'Parent',
  sibling: 'Sibling', grandparent: 'Grandparent', spouse: 'Spouse / partner',
  child: 'Child', aunt_uncle: 'Aunt / uncle', cousin: 'Cousin', someone: 'Family member',
};

interface Member {
  ini: string;
  name: string;
  meta: string;
  status: 'Complete' | 'Pending' | 'Writing';
  photo?: string;
  bg?: string;
  fg?: string;
}

const QUICK_ACTIONS = [
  { href: '/ask', icon: 'ti-message-circle-search', t: 'Ask your family', d: 'Answers from your archive' },
  { href: '/begin', icon: 'ti-user-plus', t: 'Add family member', d: 'Everyone gets a chapter' },
  { href: '/tree/build', icon: 'ti-git-fork', t: 'Build family tree', d: 'Add relatives step by step' },
  { href: '/album', icon: 'ti-photos', t: 'Photos & videos', d: 'Scan, upload, organise' },
  { href: '/future', icon: 'ti-clock', t: 'Future messages', d: 'Letters across time' },
  { href: '/collaborate', icon: 'ti-users', t: 'Invite family', d: 'Every voice matters' },
  { href: '/book', icon: 'ti-book-2', t: 'Digital Book Studio', d: 'Flip through your family book' },
  { href: '/designs', icon: 'ti-palette', t: 'Album design', d: 'Choose from 20 styles' },
  { href: '/values', icon: 'ti-heart-handshake', t: 'Values & traditions', d: 'What the family stands for' },
  { href: '/map', icon: 'ti-map-2', t: 'Family map', d: 'Your geography across the world' },
  { href: '/business', icon: 'ti-building-store', t: 'Business legacy', d: 'The family enterprise' },
  { href: '/import', icon: 'ti-download', t: 'Import your life', d: 'Photos, posts, career history' },
  { href: '/learn', icon: 'ti-help-circle', t: 'How it works', d: 'Short guides for everything' },
  { href: '/elderly', icon: 'ti-accessible', t: 'Voice-only mode', d: 'For elderly relatives' },
];

export default function ArchivePage() {
  const router = useRouter();
  const { state, ini } = useFlow();

  // Featured person + heading: real saved data when signed in, else the demo.
  const [featured, setFeatured] = useState<{ name: string; ini: string; photo?: string } | null>(null);
  const [loadedFromDb, setLoadedFromDb] = useState(false);

  const name = featured?.name || state.name || 'Margaret Ellis';
  const displayIni = featured?.ini || ini;
  const displayPhoto = featured?.photo || state.photo || undefined;
  const surname = name.split(' ').slice(-1)[0];
  const hasChapter = loadedFromDb || Boolean(state.chapter);

  const [members, setMembers] = useState<Member[]>([
    {
      ini,
      name,
      meta: 'First chapter · admin',
      status: 'Complete',
      photo: state.photo || undefined,
    },
    {
      ini: 'RT',
      name: 'Robert (invited)',
      meta: 'Reminder scheduled for his birthday',
      status: 'Pending',
      bg: '#D4EDDA',
      fg: '#1A6B38',
    },
  ]);
  const [invite, setInvite] = useState('');
  const [futureMsgs, setFutureMsgs] = useState<FutureMessageRow[] | null>(null);
  const [rawMembers, setRawMembers] = useState<SavedMember[] | null>(null);

  // Load real saved members + sealed letters from the database when signed in.
  useEffect(() => {
    let active = true;
    (async () => {
      if (!(await isDbActive())) return;
      loadFutureMessages().then((fm) => active && setFutureMsgs(fm));
      const m: SavedMember[] = await loadMembers();
      if (!active || m.length === 0) return;
      setRawMembers(m);
      setMembers(
        m.map((p) => ({
          ini: initialsOf(p.full_name),
          name: p.full_name || 'A family member',
          meta: p.is_admin ? 'Owner · admin' : REL_LABEL[p.relationship ?? ''] ?? 'Family member',
          status: 'Complete' as const,
          photo: p.photo_url || undefined,
        })),
      );
      const f = m[m.length - 1]; // most recently added
      setFeatured({ name: f.full_name || 'Your family', ini: initialsOf(f.full_name), photo: f.photo_url || undefined });
      setLoadedFromDb(true);
      try {
        sessionStorage.setItem('ank-active-member', f.id);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function addMember() {
    const v = invite.trim();
    if (!v) return;
    const i = v.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
    setMembers((m) => [
      ...m,
      { ini: i, name: v, meta: 'Invite sent just now · reminder on their birthday', status: 'Pending', bg: 'var(--paper2)', fg: 'var(--ink3)' },
    ]);
    setInvite('');
  }

  return (
    <div className="dash">
      <Walkthrough />
      <div className="rem">
        <div className="rem-i">
          <i className="ti ti-bell" />
        </div>
        <div>
          <div className="rem-t">
            {hasChapter ? `${name}'s chapter has been saved` : 'A story is waiting to be told'}
          </div>
          <div className="rem-d">
            {hasChapter
              ? 'Now invite family to add their own voices. Reminders go out automatically if someone goes quiet.'
              : 'Invite family members to add their own chapters before their stories fade.'}
          </div>
          <button className="rem-b" onClick={() => router.push('/collaborate')}>
            Invite family now
          </button>
        </div>
      </div>

      <div className="dh">
        <div>
          <div className="dname serif">The {surname} Family Archive</div>
          <div className="dsub">Living legacy · Est. 2026 · English, हिन्दी, العربية</div>
        </div>
        <div className="dbadge">ACTIVE</div>
      </div>

      <div className="slbl">Family tree</div>
      <div className="tout">
        <div className="thead">
          <div className="ttitle">Your family — tap any branch</div>
          <button className="tadd" onClick={() => router.push('/begin')}>
            + Add member
          </button>
        </div>
        <div className="tsvg-w">
          <FamilyTree name={name} ini={displayIni} photo={displayPhoto} members={rawMembers ?? undefined} />
        </div>
      </div>

      <div className="slbl">This year&apos;s legacy package</div>
      <div className="yr">
        <div className="yr-t serif">Your 2026 family album</div>
        <div className="yr-s">
          Auto-generated at renewal from stories, photos, videos, and voices. Yours forever.
        </div>
        <div className="yr-g">
          {[
            ['ti-device-tv', 'Video album', 'Auto-compiled · shareable'],
            ['ti-photo-album', 'Digital book PDF', 'Included free'],
            ['ti-book', 'Printed album', 'QR codes play voices'],
          ].map(([icon, l, s]) => (
            <div className="yri" key={l}>
              <div className="yri-i">
                <i className={`ti ${icon}`} />
              </div>
              <div className="yri-l">{l}</div>
              <div className="yri-s">{s}</div>
            </div>
          ))}
        </div>
        <button className="bp" style={{ fontSize: 12, padding: 10 }} onClick={() => router.push('/album')}>
          Open album &amp; book
        </button>
      </div>

      <div className="slbl">Quick actions</div>
      <div className="acg">
        {QUICK_ACTIONS.map((a) => (
          <div className="ac" key={a.t} onClick={() => router.push(a.href)}>
            <div className="ac-i">
              <i className={`ti ${a.icon}`} />
            </div>
            <div className="ac-t">{a.t}</div>
            <div className="ac-d">{a.d}</div>
          </div>
        ))}
      </div>

      <div className="slbl">Future messages</div>
      <div className="fmo">
        <div className="fmh">
          <div className="fmt serif">Letters across time</div>
          <div className="fms">Sealed until the moment you choose</div>
        </div>
        {(futureMsgs
          ? futureMsgs.map((f) => [
              `To: ${f.recipient_description ?? 'someone'}`,
              f.unlock_condition || (f.unlock_date ? `Opens ${f.unlock_date}` : 'Sealed'),
            ])
          : [
              ['To: My grandchild', 'Opens on their 18th birthday'],
              ['To: My daughter', 'Opens on her wedding day'],
            ]
        ).map(([to, when], i) => (
          <div className="fmi" key={`${to}-${i}`}>
            <div className="fseal">
              <i className="ti ti-lock" />
            </div>
            <div>
              <div className="fto">{to}</div>
              <div className="fwhen">{when}</div>
            </div>
            <div className="fst">Sealed ✦</div>
          </div>
        ))}
        <div className="fma" onClick={() => router.push('/future')}>
          <i className="ti ti-plus" /> Write a new future message
        </div>
      </div>

      <div className="slbl">Family contributors</div>
      <div className="tout">
        {members.map((m, i) => (
          <div className="mrow" key={i}>
            <div className="mav" style={m.bg ? { background: m.bg, color: m.fg } : undefined}>
              {m.photo ? <img src={m.photo} alt="" /> : m.ini}
            </div>
            <div>
              <div className="mn">{m.name}</div>
              <div className="mr">{m.meta}</div>
            </div>
            <div
              className={`ms ${m.status === 'Complete' ? 'ms-d' : m.status === 'Writing' ? 'ms-w' : 'ms-p'}`}
            >
              {m.status}
            </div>
          </div>
        ))}
        <div className="irow">
          <input
            className="iin"
            placeholder="WhatsApp, email, or name…"
            value={invite}
            onChange={(e) => setInvite(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMember()}
          />
          <button className="ibtn" onClick={addMember}>
            Invite
          </button>
        </div>
      </div>
    </div>
  );
}
