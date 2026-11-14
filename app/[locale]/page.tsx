import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';

import { SectionTitle } from '@/components/index';
import { SiteHeader } from '@/components/site/SiteHeader';
import type { AppLocale } from '@/lib/i18n/routing';

type Props = { params: Promise<{ locale: AppLocale }> };

/** Home provisória: o hero e as secções entram no M5 (T-501, T-502). */
export default function HomePage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations('home');

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="mx-auto w-full max-w-(--container-max) px-(--gutter) py-24">
        <SectionTitle as="h1" size="display" title={t('title')} muted={t('titleMuted')} />
      </main>
    </>
  );
}
