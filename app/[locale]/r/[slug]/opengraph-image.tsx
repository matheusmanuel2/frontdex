import { notFound } from 'next/navigation';

import { getCategory, getResourcePage, listResourcePages } from '@/lib/content';
import { routing, type AppLocale } from '@/lib/i18n/routing';
import { createOpenGraphImage, OPEN_GRAPH_SIZE } from '@/lib/seo/open-graph';

export const alt = 'FrontDex';
export const size = OPEN_GRAPH_SIZE;
export const contentType = 'image/png';

type Props = { params: Promise<{ locale: AppLocale; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => listResourcePages().map((resource) => ({ locale, slug: resource.slug })));
}

export default async function Image({ params }: Props) {
  const { locale, slug } = await params;
  const resource = getResourcePage(slug);
  if (!resource) notFound();

  return createOpenGraphImage({
    locale,
    eyebrow: getCategory(resource.category)?.name[locale] ?? resource.slug,
    title: resource.name,
    // O "why" é o nosso texto original; sem ele, a descrição.
    description: resource.why?.[locale] ?? resource.description[locale],
    id: resource.id,
  });
}
