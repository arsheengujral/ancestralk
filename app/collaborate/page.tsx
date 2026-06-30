'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFlow } from '@/components/FlowProvider';
import { getFamilyContext, loadMembers, loadInvites, addInvite } from '@/lib/familyStore';

interface Member {
  ini: string;
  name: string;
  meta: string;
  status: 'Complete' | 'Writing' | 'Pending';
  bg?: string;
  fg?: string;
}

function initialsOf(name: string | null | undefined): string {
  return (name ?? '').trim().split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

const HOW_IT_WORKS = [
  ['You send an invite', 'WhatsApp, email, or private link. 10 seconds.'],
  ['They answer in their own voice', 'Their language, their words, their chapter alone.'],
  ['The archive grows together', 'If they go quiet, a gentle reminder arrives on their birthday.'],
];

export default function CollaboratePage() {
  const router = useRouter();
  const { state, ini } = useFlow();

  const [members, setMembers] = useState<Member[]>([
    { ini, name: state.name || 'First member', meta: 'Admin · chapter complete', status: 'Complete' },
    { ini: 'AT', name: 'Aunt Teresa', meta: 'Joined yesterday · writing in Spanish', status: 'Writing', bg: '#D4EDDA', fg: '#1A6B38' },
  ]);
  const [invite, setInvite] = useState('');
  const [familyId, setFamilyId] = useState<string | null>(null);

  // Load real members + pending invites from the database when signed in.
  useEffect(() => {
    let active = true;
    (async () => {
      const ctx = await getFamilyContext();
      if (!ctx || !active) return;
      setFamilyId(ctx.familyId);
      const [mem, inv] = await Promise.all([loadMembers(), loadInvites()]);
      if (!active) return;
      const rows: Member[] = [
        ...mem.map((p) => ({
          ini: initialsOf(p.full_name),
          name: p.full_name || 'A family member',
          meta: p.is_admin ? 'Admin · owner' : 'Contributor',
          status: 'Complete' as const,
        })),
        ...inv.map((iv) => ({
          ini: initialsOf(iv.contact),
          name: iv.contact || 'Invited',
          meta: 'Invite sent · reminder on their birthday',
          status: 'Pending' as const,
          bg: 'var(--paper2)',
          fg: 'var(--ink3)',
        })),
      ];
      if (rows.length) setMembers(rows);
    })();
    return () => {
      active = false;
    };
  }, []);

  function addMember() {
    const v = invite.trim();
    if (!v) return;
    setMembers((m) => [
      ...m,
      { ini: initialsOf(v), name: v, meta: 'Invite sent just now · reminder on their birthday', status: 'Pending', bg: 'var(--paper2)', fg: 'var(--ink3)' },
    ]);
    setInvite('');
    if (familyId) void addInvite(familyId, v);
  }

  return (
    <div className="fw">
      <button className="bb" style={{ marginBottom: 16 }} onClick={() => router.push('/archive')}>
        ← Archive
      </button>
      <div className="fey">EVERY VOICE MATTERS</div>
      <div className="ftit serif">Invite your family</div>
      <div className="fsub">
        Each member gets their own private chapter — in their own language, their own voice.
        Everything merges into one living archive.
      </div>

      <div className="tout" style={{ marginBottom: 14 }}>
        <div className="thead">
          <div className="ttitle">Current members</div>
        </div>
        {members.map((m, i) => (
          <div className="mrow" key={i}>
            <div className="mav" style={m.bg ? { background: m.bg, color: m.fg } : undefined}>
              {m.ini}
            </div>
            <div>
              <div className="mn">{m.name}</div>
              <div className="mr">{m.meta}</div>
            </div>
            <div className={`ms ${m.status === 'Complete' ? 'ms-d' : m.status === 'Writing' ? 'ms-w' : 'ms-p'}`}>
              {m.status}
            </div>
          </div>
        ))}
        <div className="irow">
          <input
            className="iin"
            placeholder="WhatsApp number, email, or name…"
            value={invite}
            onChange={(e) => setInvite(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMember()}
          />
          <button className="ibtn" onClick={addMember}>
            Send invite
          </button>
        </div>
      </div>

      <div className="ibox">
        <i className="ti ti-shield" /> Every member controls their own chapter. They can mark parts
        private. Nobody else can edit their story — not even the admin.
      </div>

      <div className="slbl">How it works</div>
      <div className="tout">
        {HOW_IT_WORKS.map(([t, d], i) => (
          <div className="mrow" key={t}>
            <div
              className="mav"
              style={{ background: 'var(--g)', color: 'var(--w)', fontFamily: 'var(--font-jost)', fontSize: 12 }}
            >
              {i + 1}
            </div>
            <div>
              <div className="mn">{t}</div>
              <div className="mr">{d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
