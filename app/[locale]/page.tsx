import { setRequestLocale } from 'next-intl/server';

import { Hero } from '@/components/hero/Hero';
import { listResources } from '@/lib/content';
import type { AppLocale } from '@/lib/i18n/routing';

type Props = { params: Promise<{ locale: AppLocale }> };

/** Home (spec 003): hero + secções (T-502). */
export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main id="conteudo">
      <Hero resourceCount={listResources().length} />
    </main>
  );
}
