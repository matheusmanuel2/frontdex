import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { CategoryRows } from '@/components/category/CategoryRows';
import { FilterBar, type FilterLabels, type PageInfo } from '@/components/category/FilterBar';
import type { FilterItem } from '@/components/category/filters';
import { Pagination } from '@/components/category/Pagination';
import { pageCount, pageItems, pagePath } from '@/components/category/paging';
import { SidebarList } from '@/components/category/SidebarList';
import { Breadcrumb, EmptyState, SectionTitle } from '@/components/index';
import { JsonLd } from '@/components/seo/JsonLd';
import { Link } from '@/components/site/LocaleLink';
import { SiteHeader } from '@/components/site/SiteHeader';
import { getArea, getCategory, listCategories, listResources } from '@/lib/content';
import { type AppLocale } from '@/lib/i18n/routing';
import { breadcrumbNode, collectionPageNode, graph } from '@/lib/seo/jsonld';
import { cn } from '@/lib/utils';

export const ghost =
  't-hover inline-flex h-10 items-center rounded-pill border border-border-strong px-4 text-small text-primary hover:bg-graphite';

/** Campos mínimos de cada recurso para a lista e a ilha de filtros. */
export function filterItems(slug: string, locale: AppLocale): FilterItem[] {
  return listResources({ category: slug }).map((item) => ({
    slug: item.slug,
    id: item.id,
    name: item.name,
    description: item.description[locale],
    tags: item.tags,
    pricing: item.pricing,
    openSource: item.open_source === true,
    added: item.added,
  }));
}

/** Página de categoria (spec 003, mockups Category e Empty). Filtros na URL; 50 por página; sem JS, a página pedida. */
export async function CategoryView({ locale, slug, page }: { locale: AppLocale; slug: string; page: number }) {
  const category = getCategory(slug);
  if (!category) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('category');
  const areaT = await getTranslations('area');
  const pricing = await getTranslations('pricing');
  const resource = await getTranslations('resource');
  const area = getArea(category.area);
  const resources = listResources({ category: slug });
  const siblings = listCategories(category.area);
  const base = `/${locale}/c/${slug}`;
  const count = pageCount(resources.length);
  if (page > count) notFound();
  const path = pagePath(base, page);
  const items = pageItems(filterItems(slug, locale), page);
  const pageInfo: PageInfo = { base, page, count, total: resources.length, dataUrl: `${base}/items.json` };

  const intro = category.description?.[locale] ?? t('titleMuted', { count: resources.length });
  const structured = graph(
    collectionPageNode(
      { locale, path, name: category.name[locale], description: intro },
      items.map((item) => ({ name: item.name, path: `/${locale}/r/${item.slug}` })),
    ),
    breadcrumbNode(path, [
      { name: areaT('index'), path: `/${locale}` },
      { name: area?.name[locale] ?? '', path: `/${locale}/${category.area}` },
      { name: category.name[locale], path: base },
    ]),
  );

  const labels: FilterLabels = {
    list: t('list'),
    oss: resource('oss'),
    pricing: {
      free: pricing('free'),
      freemium: pricing('freemium'),
      paid: pricing('paid'),
      'pay-what-you-want': pricing('pay-what-you-want'),
    },
    filters: t('filters'),
    pricingLabel: t('pricing'),
    all: t('all'),
    sort: t('sort'),
    sortRecent: t('sortRecent'),
    sortName: t('sortName'),
    showing: t.raw('showing') as string,
    emptyTitle: t('emptyTitle'),
    emptyBody: t('emptyBody'),
    clear: t('clear'),
    loading: t('loading'),
    pagination: {
      label: t('pagination'),
      previous: t('previous'),
      next: t('next'),
      page: t.raw('page') as string,
    },
  };
  const suggest = (
    <Link href="/add" data-umami-event="add_click" className={ghost}>
      {t('suggest')}
    </Link>
  );

  return (
    <>
      <SiteHeader current={category.area} />
      <JsonLd data={structured} />
      <main
        id="conteudo"
        className="mx-auto flex w-full max-w-(--container-max) flex-wrap items-start gap-12 px-(--gutter) pt-12 pb-24"
      >
        <aside aria-labelledby="category-siblings" className="w-full lg:sticky lg:top-6 lg:w-56 lg:shrink-0">
          <p id="category-siblings" className="label-mono mb-3 pl-3 text-muted">
            {t('sidebar', { area: area?.name[locale] ?? '' })}
          </p>
          <nav aria-labelledby="category-siblings">
            <SidebarList className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
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
            </SidebarList>
          </nav>
        </aside>

        <section aria-labelledby="category-title" className="t-reveal min-w-0 flex-1 basis-xl" data-pagefind-body>
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
          <SectionTitle id="category-title" as="h1" size="h1" title={`${category.name[locale]}.`} className="mt-5" />
          <p className="mt-5 max-w-2xl text-body text-secondary">{intro}</p>

          <div className="mt-8" data-pagefind-ignore>
            {items.length === 0 ? (
              <EmptyState title={t('noneTitle')} description={t('noneBody')} actions={suggest} />
            ) : (
              <Suspense
                fallback={
                  <>
                    <CategoryRows items={items} locale={locale} labels={labels} />
                    <Pagination base={base} page={page} count={count} labels={labels.pagination} />
                  </>
                }
              >
                <FilterBar items={items} pageInfo={pageInfo} locale={locale} labels={labels} suggest={suggest} />
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
