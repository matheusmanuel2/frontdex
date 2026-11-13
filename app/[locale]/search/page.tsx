import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { SearchIcon } from '@/components/icons';
import { Breadcrumb, ResourceList, ResourceRow, SectionTitle, TagChip } from '@/components/index';
import { SearchResults, type SearchPageLabels } from '@/components/search/SearchResults';
import { SiteHeader } from '@/components/site/SiteHeader';
import { getCategory, listAreas, listResources } from '@/lib/content';
import type { AppLocale } from '@/lib/i18n/routing';

import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'search' });
  return { title: t('label'), description: t('titleMuted'), robots: { index: false } };
}

/**
 * Busca (spec 008, T-603, mockup Search): página normal com formulário GET.
 * Com JS, mostra os resultados do Pagefind para ?q=; sem JS, o índice completo.
 */
export default async function SearchPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('search');
  const areaT = await getTranslations('area');
  const resources = listResources();

  const labels: SearchPageLabels = {
    resultsFor: t.raw('resultsFor') as string,
    empty: t.raw('empty') as string,
    loading: t('loading'),
    all: t('all'),
    category: t('category'),
    count: {
      zero: t('results', { count: 0 }),
      one: t('results', { count: 1 }),
      other: (t.raw('results') as string).includes('other')
        ? t('results', { count: 2 }).replace('2', '{count}')
        : '{count}',
    },
  };

  const fallback = (
    <section aria-labelledby="search-index" className="mt-10">
      <h2 id="search-index" className="title-h3 mb-5 text-primary">
        {t('indexList')}
      </h2>
      <ResourceList label={t('indexList')}>
        {resources.map((resource) => (
          <ResourceRow
            key={resource.slug}
            href={`/${locale}/r/${resource.slug}`}
            id={resource.id}
            name={resource.name}
            description={resource.description[locale]}
            compact
            aside={<TagChip>{getCategory(resource.category)?.name[locale]}</TagChip>}
          />
        ))}
      </ResourceList>
    </section>
  );

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="mx-auto w-full max-w-(--container-max) px-(--gutter) pt-12 pb-24 sm:pt-14">
        <Breadcrumb
          label={areaT('breadcrumb')}
          items={[{ label: areaT('index'), href: `/${locale}` }, { label: t('label') }]}
        />
        <SectionTitle as="h1" size="h1" title={t('title')} muted={t('titleMuted')} className="mt-5" />
        <form role="search" action={`/${locale}/search`} method="get" className="mt-8 flex max-w-2xl gap-2">
          <label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-pill border border-border-strong bg-carbon px-5 focus-within:border-focus">
            <SearchIcon size={18} className="text-muted" motion="none" />
            <span className="sr-only">{t('label')}</span>
            <input
              type="search"
              name="q"
              placeholder={t('placeholder')}
              className="h-full min-w-0 flex-1 bg-transparent text-body text-primary outline-none placeholder:text-muted"
            />
          </label>
          <button
            type="submit"
            className="t-hover h-12 rounded-pill bg-button-primary px-6 text-small font-semibold text-button-primary-text hover:opacity-90"
          >
            {t('submit')}
          </button>
        </form>
        <noscript>
          <p className="mt-4 text-small text-secondary">{t('noscript')}</p>
        </noscript>
        <Suspense fallback={fallback}>
          <SearchResults labels={labels} areas={listAreas().map((area) => area.name[locale])} fallback={fallback} />
        </Suspense>
      </main>
    </>
  );
}
