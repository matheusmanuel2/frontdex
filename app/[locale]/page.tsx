import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Hero } from '@/components/hero/Hero';
import {
  AreasSection,
  CollectionsSection,
  ContributeSection,
  FreshSection,
  GemsSection,
} from '@/components/home/HomeSections';
import { JsonLd } from '@/components/seo/JsonLd';
import { listAreas, listCategories, listResources } from '@/lib/content';
import type { AppLocale } from '@/lib/i18n/routing';
import { graph, organizationNode, websiteNode } from '@/lib/seo/jsonld';
import { localizedMetadata } from '@/lib/seo/metadata';

import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const metadata = localizedMetadata(locale, '', t('title'), t('description'), { socialTitle: t('title') });
  return { ...metadata, title: { absolute: t('title') } };
}

/** Home (spec 003, mockup Main): hero, 4 áreas, Recém-indexados, Joias escondidas, Coleções, Contribua. */
export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const meta = await getTranslations('meta');

  return (
    <main>
      <JsonLd data={graph(organizationNode(), websiteNode(locale, meta('description')))} />
      <Hero
        resourceCount={listResources().length}
        categoryCount={listCategories().length}
        areaCount={listAreas().length}
      />
      <AreasSection />
      <FreshSection />
      <GemsSection />
      <CollectionsSection />
      <ContributeSection />
    </main>
  );
}
