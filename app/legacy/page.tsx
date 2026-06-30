'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DEFAULT_LEGACY,
  INHERITANCE_MODES,
  ROLE_LADDER,
  type InheritanceMode,
  type LegacyConfig,
} from '@/lib/legacy';
import { getFamilyContext, loadLegacy, saveLegacy } from '@/lib/familyStore';

/**
 * Feature Set B — the Legacy Plan. The owner chooses how the archive passes
 * down. Every word here is "passing the torch", not "account management". The
 * reassurance is explicit: this archive will outlive all of us.
 *
 * Config persists to sessionStorage in degraded mode; once Supabase is wired it
 * writes families.inheritance_mode / successor_ids / transfer_date /
 * inactivity_months, and the cron + transfer routes act on it.
 */

const KEY = 'ank-legacy';

export default function LegacyPage() {
  const router = useRouter();
  const [cfg, setCfg] = useState<LegacyConfig>(DEFAULT_LEGACY);
  const [heir, setHeir] = useState('');
  const [dbActive, setDbActive] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const ctx = await getFamilyContext();
      if (ctx && active) {
        setDbActive(true);
        const row = await loadLegacy();
        if (row && active) {
          setCfg({
            mode: row.mode as InheritanceMode,
            successorNames: row.successorNames,
            transferDate: row.transferDate,
            inactivityMonths: row.inactivityMonths,
          });
        }
        return;
      }
      try {
        const raw = sessionStorage.getItem(KEY);
        if (raw && active) setCfg({ ...DEFAULT_LEGACY, ...JSON.parse(raw) });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function save(next: LegacyConfig) {
    setCfg(next);
    if (dbActive) {
      void saveLegacy({
        mode: next.mode,
        successorNames: next.successorNames,
        transferDate: next.transferDate,
        inactivityMonths: next.inactivityMonths,
      });
    } else {
      try {
        sessionStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
  }

  const setMode = (mode: InheritanceMode) => save({ ...cfg, mode });

  return (
    <div className="dash" style={{ maxWidth: 640 }}>
      <button className="bb" style={{ marginBottom: 16 }} onClick={() => router.push('/settings')}>
        ← Settings
      </button>
      <div className="fey">PASSING THE TORCH</div>
      <div className="dname serif" style={{ fontSize: 30, marginBottom: 2 }}>
        How your family&apos;s archive lives on
      </div>
      <div className="dsub" style={{ marginBottom: 16 }}>
        This is not account management. It is choosing the hands that will carry everything you&apos;ve
        kept — long after you set it down.
      </div>

      {/* Reassurance */}
      <div className="yr" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 22, color: 'var(--g)' }}>✦</div>
        <div className="yr-t serif">This archive will outlive all of us</div>
        <div className="yr-s" style={{ marginBottom: 0 }}>
          Designed to live across 100+ years and many hands — no single person, and no single moment,
          can ever be its end.
        </div>
      </div>

      {/* Modes */}
      <div className="slbl">Choose how the torch passes</div>
      {INHERITANCE_MODES.map((m) => (
        <div
          key={m.mode}
          className="wo"
          onClick={() => setMode(m.mode)}
          style={{ marginBottom: 10, borderColor: cfg.mode === m.mode ? 'var(--g)' : 'var(--paper3)', background: cfg.mode === m.mode ? 'var(--g5)' : 'var(--w)' }}
        >
          <div className="wo-c" style={{ display: cfg.mode === m.mode ? 'flex' : 'none' }}>
            <i className="ti ti-check" style={{ fontSize: 9 }} />
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div className="wo-ic" style={{ margin: 0 }}>
              <i className={`ti ${m.icon}`} />
            </div>
            <div>
              <div className="wo-t" style={{ fontSize: 14 }}>{m.title}</div>
              <div className="serif" style={{ fontSize: 14, color: 'var(--g3)', fontStyle: 'italic', margin: '2px 0 4px' }}>
                {m.torch}
              </div>
              <div className="wo-s">{m.blurb}</div>
            </div>
          </div>
        </div>
      ))}

      {/* Mode-specific configuration */}
      {cfg.mode === 'multi_generation' && (
        <div className="tout" style={{ padding: 18 }}>
          <div className="slbl" style={{ marginTop: 0 }}>The roles the archive passes through</div>
          {ROLE_LADDER.map((r, i) => (
            <div className="mrow" key={r.role} style={{ paddingLeft: 0, paddingRight: 0 }}>
              <div className="mav" style={{ background: 'var(--g)', color: 'var(--w)', fontFamily: 'var(--font-jost)', fontSize: 12 }}>
                {i + 1}
              </div>
              <div>
                <div className="mn">{r.label}</div>
                <div className="mr">{r.can}</div>
              </div>
            </div>
          ))}
          <div className="enote" style={{ marginTop: 10 }}>
            <i className="ti ti-arrow-up" style={{ color: 'var(--g)' }} /> Promote anyone up the ladder
            from the contributors list — the admin role can be shared and passed down, forever.
          </div>
        </div>
      )}

      {cfg.mode === 'named_heir' && (
        <div className="tout" style={{ padding: 18 }}>
          <div className="slbl" style={{ marginTop: 0 }}>Your designated keepers</div>
          {cfg.successorNames.length === 0 && (
            <div className="fsub" style={{ marginBottom: 10 }}>No heirs named yet.</div>
          )}
          {cfg.successorNames.map((n, i) => (
            <div className="mrow" key={i} style={{ paddingLeft: 0, paddingRight: 0 }}>
              <div className="mav" style={{ background: 'var(--g2)', color: 'var(--g3)' }}>
                {n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div>
                <div className="mn">{n}</div>
                <div className="mr">
                  <i className="ti ti-shield-star" style={{ color: 'var(--g)' }} /> You are a
                  designated keeper of this archive
                </div>
              </div>
              <button className="bb" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => save({ ...cfg, successorNames: cfg.successorNames.filter((_, j) => j !== i) })}>
                Remove
              </button>
            </div>
          ))}
          <div className="irow" style={{ padding: '12px 0 0', borderTop: 'none' }}>
            <input className="iin" placeholder="Name an heir from your family…" value={heir} onChange={(e) => setHeir(e.target.value)} />
            <button
              className="ibtn"
              onClick={() => {
                if (!heir.trim()) return;
                save({ ...cfg, successorNames: [...cfg.successorNames, heir.trim()] });
                setHeir('');
              }}
            >
              Name heir
            </button>
          </div>
        </div>
      )}

      {cfg.mode === 'scheduled' && (
        <div className="tout" style={{ padding: 18 }}>
          <div className="slbl" style={{ marginTop: 0 }}>When the handover happens</div>
          <div className="field">
            <label className="fl">Transfer on a specific date (optional)</label>
            <input className="fi2" type="date" value={cfg.transferDate} onChange={(e) => save({ ...cfg, transferDate: e.target.value })} />
          </div>
          <div className="field">
            <label className="fl">…or after this many months of quiet</label>
            <input
              className="fi2"
              type="number"
              min={1}
              value={cfg.inactivityMonths}
              onChange={(e) => save({ ...cfg, inactivityMonths: Number(e.target.value) || 12 })}
            />
          </div>
          <div className="field">
            <label className="fl">Pass to (successor)</label>
            <input
              className="fi2"
              placeholder="Who should receive the archive…"
              value={cfg.successorNames[0] ?? ''}
              onChange={(e) => save({ ...cfg, successorNames: [e.target.value] })}
            />
          </div>
          <div className="ibox">
            <i className="ti ti-mail-heart" /> Before anything changes, a warm check-in goes out:
            &ldquo;Confirm you&apos;re still keeping the archive.&rdquo; Only if it goes unanswered
            does the keeper role pass on.
          </div>
        </div>
      )}

      <div className="enote" style={{ marginTop: 14 }}>
        <i className="ti ti-infinity" style={{ color: 'var(--g)' }} /> Whatever you choose, no story is
        ever lost when hands change. The archive simply keeps being kept.
      </div>
    </div>
  );
}
