import { notFound } from 'next/navigation';

import { getArea, getCategory, listCategories } from '@/lib/content';
import { routing, type AppLocale } from '@/lib/i18n/routing';
import { createOpenGraphImage, OPEN_GRAPH_SIZE } from '@/lib/seo/open-graph';

export const alt = 'FrontDex';
export const size = OPEN_GRAPH_SIZE;
export const contentType = 'image/png';

type Props = { params: Promise<{ locale: AppLocale; category: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => listCategories().map((category) => ({ locale, category: category.slug })));
}

export default async function Image({ params }: Props) {
  const { locale, category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const area = getArea(category.area);

  return createOpenGraphImage({
    locale,
    eyebrow: area?.name[locale] ?? category.area,
    title: category.name[locale],
    description: category.description?.[locale] ?? '',
  });
}
