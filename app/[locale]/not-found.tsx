import { getTranslations } from 'next-intl/server';

import { NotFoundContent } from '@/components/site/NotFoundContent';
import { SiteHeader } from '@/components/site/SiteHeader';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('notFound');
  return { title: t('metaTitle'), robots: { index: false } };
}

/** 404 no idioma da rota (T-406). */
export default function LocaleNotFound() {
  return (
    <>
      <SiteHeader />
      <NotFoundContent />
    </>
  );
}
