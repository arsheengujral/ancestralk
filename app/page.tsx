import Link from 'next/link';
import { useTranslations } from 'next-intl';

const FEATURES = [
  {
    icon: 'ti-microphone',
    title: "Speak, don't type",
    desc: 'Every question answered by voice. We keep their exact words, their pauses, their warmth — forever.',
  },
  {
    icon: 'ti-git-fork',
    title: 'Living family tree',
    desc: 'Every branch carries a full story, photos, voice, and a life timeline. The tree grows as your family does.',
  },
  {
    icon: 'ti-clock',
    title: 'Future messages',
    desc: "A letter sealed until your grandchild's 18th birthday. Delivered decades from now. Nothing like it exists.",
  },
  {
    icon: 'ti-photo-album',
    title: 'Yearly album',
    desc: 'Every year — an auto-made video album and printable photo book. A new chapter, automatically.',
  },
  {
    icon: 'ti-users',
    title: 'Every voice included',
    desc: 'A sister in Dubai, a parent in Delhi, a cousin in Toronto — each adds their own chapter to one archive.',
  },
  {
    icon: 'ti-bell',
    title: 'Gentle reminders',
    desc: '"Your mother turns 75 today. Her chapter is still blank." The nudge that beats forgetting.',
  },
];

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div>
      <div className="hero">
        <div className="hero-bg" />
        <div className="eyebrow">{t('eyebrow')}</div>
        <h1 className="serif">
          {t('titleLine1')}
          <br />
          {t('titleLine2')} <em>{t('titleEmphasis')}</em>
        </h1>
        <p className="hero-sub">{t('subtitle')}</p>
        <div className="hbtns">
          <Link href="/begin" className="hb pri">
            {t('ctaPrimary')}
          </Link>
          <Link href="/archive" className="hb out">
            {t('ctaSecondary')}
          </Link>
        </div>

        <div className="feat-grid">
          {FEATURES.map((f) => (
            <div className="feat" key={f.title}>
              <div className="fi-icon">
                <i className={`ti ${f.icon}`} />
              </div>
              <div className="fi-t">{f.title}</div>
              <div className="fi-d">{f.desc}</div>
            </div>
          ))}
        </div>

        <div className="price-wrap">
          <div className="pcard">
            <div className="pbadge free">FREE TO BEGIN</div>
            <div className="pname serif">Starter</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <div className="pamt serif">$0</div>
            </div>
            <div className="pdesc">
              See what your family&apos;s archive could become — no card needed.
            </div>
            {['1 family member profile', '4 story questions', '1 written chapter', '5 photos'].map(
              (p) => (
                <div className="pf" key={p}>
                  <i className="ti ti-check" />
                  {p}
                </div>
              ),
            )}
            <div style={{ height: 14 }} />
            <Link
              href="/begin"
              className="bp"
              style={{
                background: 'var(--paper2)',
                color: 'var(--ink2)',
                display: 'block',
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              Try free
            </Link>
          </div>

          <div className="pcard hot">
            <div className="pbadge">ONE FAMILY · ONE PRICE</div>
            <div className="pname serif">Family Legacy</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <div className="pamt serif">$60</div>
              <div className="pper">/ year</div>
            </div>
            <div className="pdesc">
              Unlimited members. Grandparents to grandchildren yet unborn. Everything included.
            </div>
            {[
              'Unlimited family members',
              'Voice archive & playback',
              'Future messages',
              'Yearly album + photo book',
              'Life timelines',
              'Elderly voice-only mode',
              '3 languages, more coming',
            ].map((p) => (
              <div className="pf" key={p}>
                <i className="ti ti-check" />
                {p}
              </div>
            ))}
            <div style={{ height: 14 }} />
            <Link
              href="/begin"
              className="bp"
              style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
            >
              Begin your family&apos;s story
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
