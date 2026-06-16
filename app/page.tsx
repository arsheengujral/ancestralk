import { useTranslations } from 'next-intl';

/**
 * Temporary Phase 0 landing page — confirms the scaffold, fonts, theme tokens,
 * and i18n are wired. The full prototype-matched home page (hero, six feature
 * cards, Starter + Family Legacy pricing) lands in Phase 1.
 */
export default function HomePage() {
  const t = useTranslations('home');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-20">
      <div className="text-[11px] tracking-[3.5px] text-gold mb-5 font-medium">
        {t('eyebrow')}
      </div>
      <h1 className="serif font-light leading-[1.1] mb-6 max-w-[700px] text-[clamp(40px,6.5vw,68px)]">
        {t('titleLine1')}
        <br />
        {t('titleLine2')} <em className="italic text-goldDark">{t('titleEmphasis')}</em>
      </h1>
      <p className="text-ink3 leading-[1.75] max-w-[470px] mb-10 font-light text-base">
        {t('subtitle')}
      </p>
      <div className="text-gold text-sm tracking-[2px]">✦ ANCESTRALK ✦</div>
    </main>
  );
}
