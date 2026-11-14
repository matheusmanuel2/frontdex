import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { CategoryRows } from '@/components/category/CategoryRows';
import { FilterBar, type FilterLabels } from '@/components/category/FilterBar';
import type { FilterItem } from '@/components/category/filters';
import { Breadcrumb, EmptyState, SectionTitle } from '@/components/index';
import { Link } from '@/components/site/LocaleLink';
import { SiteHeader } from '@/components/site/SiteHeader';
import { getArea, getCategory, listCategories, listResources } from '@/lib/content';
import { routing, type AppLocale } from '@/lib/i18n/routing';
import { cn } from '@/lib/utils';

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
  const t = await getTranslations({ locale, namespace: 'category' });
  const count = listResources({ category: slug }).length;
  return {
    title: category.name[locale],
    description: category.description?.[locale] ?? `${category.name[locale]}: ${t('titleMuted', { count })}`,
  };
}

const ghost =
  't-hover inline-flex h-10 items-center rounded-pill border border-border-strong px-4 text-small text-primary hover:bg-graphite';

/** Página de categoria (spec 003, mockups Category e Empty). Filtros na URL; sem JS, a lista completa. */
export default async function CategoryPage({ params }: Props) {
  const { locale, category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('category');
  const areaT = await getTranslations('area');
  const pricing = await getTranslations('pricing');
  const level = await getTranslations('level');
  const resource = await getTranslations('resource');
  const area = getArea(category.area);
  const resources = listResources({ category: slug });
  const siblings = listCategories(category.area);

  const items: FilterItem[] = resources.map((item) => ({
    slug: item.slug,
    id: item.id,
    name: item.name,
    description: item.description[locale],
    tags: item.tags,
    pricing: item.pricing,
    openSource: item.open_source === true,
    levels: item.level ?? [],
    added: item.added,
  }));

  const labels: FilterLabels = {
    list: t('list'),
    oss: resource('oss'),
    ossBadge: resource('oss'),
    pricing: { free: pricing('free'), freemium: pricing('freemium'), paid: pricing('paid') },
    filters: t('filters'),
    pricingLabel: t('pricing'),
    all: t('all'),
    level: t('level'),
    levelAny: t('levelAny'),
    levels: { beginner: level('beginner'), intermediate: level('intermediate'), expert: level('expert') },
    sort: t('sort'),
    sortRecent: t('sortRecent'),
    sortName: t('sortName'),
    showing: t.raw('showing') as string,
    emptyTitle: t('emptyTitle'),
    emptyBody: t('emptyBody'),
    clear: t('clear'),
  };
  // O toolbar usa o rótulo "Só open source"; as linhas, o selo "OSS".
  const filterLabels: FilterLabels = { ...labels, oss: t('oss') };
  const suggest = (
    <Link href="/add" className={ghost}>
      {t('suggest')}
    </Link>
  );

  return (
    <>
      <SiteHeader current={category.area} />
      <main
        id="conteudo"
        className="mx-auto flex w-full max-w-(--container-max) flex-wrap items-start gap-12 px-(--gutter) pt-12 pb-24"
      >
        <aside aria-labelledby="category-siblings" className="w-full lg:sticky lg:top-6 lg:w-56 lg:shrink-0">
          <p id="category-siblings" className="label-mono mb-3 pl-3 text-muted">
            {t('sidebar', { area: area?.name[locale] ?? '' })}
          </p>
          <nav aria-labelledby="category-siblings">
            <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {siblings.map((sibling) => {
                const active = sibling.slug === slug;
                return (
                  <li key={sibling.slug} className="shrink-0">
                    <Link
                      href={`/c/${sibling.slug}`}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        't-hover flex justify-between gap-4 rounded-pill px-3 py-2 text-small',
                        active ? 'bg-carbon text-primary' : 'text-secondary hover:bg-carbon hover:text-primary',
                      )}
                    >
                      <span>{sibling.name[locale]}</span>
                      <span className="font-mono text-mono text-muted">
                        {listResources({ category: sibling.slug }).length}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <section aria-labelledby="category-title" className="min-w-0 flex-1 basis-xl" data-pagefind-body>
          <Breadcrumb
            label={areaT('breadcrumb')}
            items={[
              { label: areaT('index'), href: `/${locale}` },
              { label: area?.name[locale] ?? '', href: `/${locale}/${category.area}` },
              { label: category.name[locale] },
            ]}
          />
          <div hidden>
            <span data-pagefind-meta="kind">category</span>
            <span data-pagefind-meta="slug">{category.slug}</span>
            <span data-pagefind-meta="title">{category.name[locale]}</span>
            <span data-pagefind-meta="description">
              {category.description?.[locale] ?? t('titleMuted', { count: resources.length })}
            </span>
            <span data-pagefind-meta="count">{resources.length}</span>
            <span data-pagefind-meta="area">{area?.name[locale]}</span>
            <span data-pagefind-filter="area">{area?.name[locale]}</span>
          </div>
          <SectionTitle
            id="category-title"
            as="h1"
            size="h1"
            title={`${category.name[locale]}.`}
            muted={t('titleMuted', { count: resources.length })}
            className="mt-5"
          />
          {category.description ? (
            <p className="mt-5 max-w-2xl text-body text-secondary">{category.description[locale]}</p>
          ) : null}

          <div className="mt-8" data-pagefind-ignore>
            {items.length === 0 ? (
              <EmptyState title={t('noneTitle')} description={t('noneBody')} actions={suggest} />
            ) : (
              <Suspense fallback={<CategoryRows items={items} locale={locale} labels={labels} />}>
                <FilterBar items={items} locale={locale} labels={filterLabels} suggest={suggest} />
              </Suspense>
            )}
          </div>

          <div
            data-pagefind-ignore
            className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-carbon px-7 py-6"
          >
            <div>
              <p className="text-body font-medium text-primary">
                {t('missingTitle', { category: category.name[locale] })}
              </p>
              <p className="mt-1 text-small text-secondary">{t('missingBody')}</p>
            </div>
            {suggest}
          </div>
        </section>
      </main>
    </>
  );
}
