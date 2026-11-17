import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { CategoryView } from '@/components/category/CategoryView';
import { pageCount } from '@/components/category/paging';
import { getCategory, listCategories, listResources } from '@/lib/content';
import { routing, type AppLocale } from '@/lib/i18n/routing';
import { localizedMetadata } from '@/lib/seo/metadata';

import type { Metadata } from 'next';

export const dynamicParams = false;

/** Páginas 2..N de cada categoria (spec 003, "Paginação da categoria"). */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    listCategories().flatMap((category) => {
      const count = pageCount(listResources({ category: category.slug }).length);
      return Array.from({ length: count - 1 }, (_, i) => ({ locale, category: category.slug, page: String(i + 2) }));
    }),
  );
}

type Props = { params: Promise<{ locale: AppLocale; category: string; page: string }> };

const toPage = (raw: string) => (/^[2-9]$|^[1-9]\d+$/.test(raw) ? Number(raw) : NaN);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: slug, page: raw } = await params;
  const category = getCategory(slug);
  const page = toPage(raw);
  if (!category || Number.isNaN(page)) return {};
  const t = await getTranslations({ locale, namespace: 'seo' });
  const name = category.name[locale];
  const count = listResources({ category: slug }).length;
  return localizedMetadata(
    locale,
    `/c/${slug}/p/${page}`,
    t('categoryPageTitle', { category: name, page }),
    category.description?.[locale] ?? t('categoryDescription', { category: name, count }),
  );
}

export default async function CategoryPageN({ params }: Props) {
  const { locale, category, page: raw } = await params;
  const page = toPage(raw);
  if (Number.isNaN(page)) notFound();
  return <CategoryView locale={locale} slug={category} page={page} />;
}
