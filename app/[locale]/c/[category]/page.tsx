import { getTranslations } from 'next-intl/server';

import { CategoryView } from '@/components/category/CategoryView';
import { getCategory, listCategories, listResources } from '@/lib/content';
import { routing, type AppLocale } from '@/lib/i18n/routing';
import { localizedMetadata } from '@/lib/seo/metadata';

import type { Metadata } from 'next';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => listCategories().map((category) => ({ locale, category: category.slug })));
}

type Props = { params: Promise<{ locale: AppLocale; category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  const t = await getTranslations({ locale, namespace: 'seo' });
  const name = category.name[locale];
  const count = listResources({ category: slug }).length;
  return localizedMetadata(
    locale,
    `/c/${slug}`,
    t('categoryTitle', { category: name }),
    category.description?.[locale] ?? t('categoryDescription', { category: name, count }),
  );
}

export default async function CategoryPage({ params }: Props) {
  const { locale, category } = await params;
  return <CategoryView locale={locale} slug={category} page={1} />;
}
