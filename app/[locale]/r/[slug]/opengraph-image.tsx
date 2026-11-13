import { notFound } from 'next/navigation';

import { getResource, listResources } from '@/lib/content';
import { routing, type AppLocale } from '@/lib/i18n/routing';
import { createOpenGraphImage, OPEN_GRAPH_SIZE } from '@/lib/seo/open-graph';

export const alt = 'FrontDex';
export const size = OPEN_GRAPH_SIZE;
export const contentType = 'image/png';

type Props = { params: Promise<{ locale: AppLocale; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => listResources().map((resource) => ({ locale, slug: resource.slug })));
}

export default async function Image({ params }: Props) {
  const { locale, slug } = await params;
  const resource = getResource(slug);
  if (!resource) notFound();

  return createOpenGraphImage({
    locale,
    eyebrow: resource.slug,
    title: resource.name,
    description: resource.description[locale],
    id: resource.id,
  });
}
