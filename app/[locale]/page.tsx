import { setRequestLocale } from 'next-intl/server';

import { Hero } from '@/components/hero/Hero';
import {
  AreasSection,
  CollectionsSection,
  ContributeSection,
  FreshSection,
  GemsSection,
} from '@/components/home/HomeSections';
import { listResources } from '@/lib/content';
import type { AppLocale } from '@/lib/i18n/routing';

type Props = { params: Promise<{ locale: AppLocale }> };

/** Home (spec 003, mockup Main): hero, 4 áreas, Recém-indexados, Joias escondidas, Coleções, Contribua. */
export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main id="conteudo">
      <Hero resourceCount={listResources().length} />
      <AreasSection />
      <FreshSection />
      <GemsSection />
      <CollectionsSection />
      <ContributeSection />
    </main>
  );
}
