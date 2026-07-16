'use client';

import { useState } from 'react';
import type { TabId } from './data';
import { DEMO } from './data';
import { PhoneFrame, BottomNav } from './shell';
import { Today } from './screens/Today';
import { CheckIn, CheckInFlow } from './screens/CheckIn';
import { Rituals } from './screens/Rituals';
import { Learn } from './screens/Learn';
import { You } from './screens/You';
import { RitualScreen } from './screens/RitualScreen';
import { DayComplete } from './screens/DayComplete';
import { Journey } from './screens/Journey';
import { IngredientDetail } from './screens/IngredientDetail';

type Overlay =
  | null
  | { kind: 'checkin' }
  | { kind: 'ritual'; which: 'am' | 'pm' }
  | { kind: 'daycomplete' }
  | { kind: 'journey' }
  | { kind: 'ingredient'; id: string };

export default function AttiraApp() {
  const [tab, setTab] = useState<TabId>('today');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [streak, setStreak] = useState(DEMO.streak);
  const [nightDone, setNightDone] = useState(false);

  const go = (t: TabId) => {
    setOverlay(null);
    setTab(t);
  };

  const screen = () => {
    switch (tab) {
      case 'today':
        return (
          <Today
            streak={streak}
            nightDone={nightDone}
            onBeginNight={() => setOverlay({ kind: 'ritual', which: 'pm' })}
            onGo={go}
          />
        );
      case 'checkin':
        return <CheckIn onBegin={() => setOverlay({ kind: 'checkin' })} />;
      case 'rituals':
        return (
          <Rituals
            nightDone={nightDone}
            onOpen={(which) => setOverlay({ kind: 'ritual', which })}
          />
        );
      case 'learn':
        return <Learn onOpen={(id) => setOverlay({ kind: 'ingredient', id })} />;
      case 'you':
        return (
          <You
            streak={streak}
            onOpenJourney={() => setOverlay({ kind: 'journey' })}
            onReplayCeremony={() => setOverlay({ kind: 'daycomplete' })}
          />
        );
    }
  };

  return (
    <div className="att-root">
      <div className="att-stage">
        <div className="att-brandbar">
          <span className="att-word">ATTIRA</span>
          <span className="att-tag">Skin</span>
        </div>
        <PhoneFrame>
          <div key={tab} className="att-screen-enter" style={{ position: 'absolute', inset: 0 }}>
            {screen()}
          </div>

          {overlay === null && <BottomNav active={tab} onChange={go} />}

          {overlay?.kind === 'checkin' && (
            <Overlayer>
              <CheckInFlow onDone={() => setOverlay(null)} />
            </Overlayer>
          )}

          {overlay?.kind === 'ritual' && (
            <Overlayer>
              <RitualScreen
                which={overlay.which}
                streak={streak}
                onBack={() => setOverlay(null)}
                onComplete={() => {
                  if (overlay.which === 'pm') {
                    setOverlay({ kind: 'daycomplete' });
                  } else {
                    setOverlay(null);
                    setTab('today');
                  }
                }}
              />
            </Overlayer>
          )}

          {overlay?.kind === 'daycomplete' && (
            <Overlayer>
              <DayComplete
                onClose={() => {
                  setNightDone(true);
                  setStreak((s) => (nightDone ? s : s + 1));
                  setOverlay(null);
                  setTab('today');
                }}
              />
            </Overlayer>
          )}

          {overlay?.kind === 'journey' && (
            <Overlayer>
              <Journey streak={streak} onBack={() => setOverlay(null)} />
            </Overlayer>
          )}

          {overlay?.kind === 'ingredient' && (
            <Overlayer>
              <IngredientDetail id={overlay.id} onBack={() => setOverlay(null)} />
            </Overlayer>
          )}
        </PhoneFrame>
      </div>
    </div>
  );
}

/* A full-cover layer above the bottom nav for immersive moments. */
function Overlayer({ children }: { children: React.ReactNode }) {
  return (
    <div className="att-screen-enter" style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
      {children}
    </div>
  );
}
