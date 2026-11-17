import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { ArrowUpRightIcon } from '@/components/icons';
import { Breadcrumb, IndexId, ResourceList, ResourceRow, TagChip } from '@/components/index';
import { JsonLd } from '@/components/seo/JsonLd';
import { Link } from '@/components/site/LocaleLink';
import { GITHUB_URL } from '@/components/site/nav';
import { SiteHeader } from '@/components/site/SiteHeader';
import { getArea, getCategory, getResource, getResourcePage, listResourcePages, listResources } from '@/lib/content';
import { routing, type AppLocale } from '@/lib/i18n/routing';
import { outboundUrl } from '@/lib/outbound';
import { breadcrumbNode, graph, resourcePageNode } from '@/lib/seo/jsonld';
import { localizedMetadata } from '@/lib/seo/metadata';

import type { Metadata } from 'next';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => listResourcePages().map((resource) => ({ locale, slug: resource.slug })));
}

type Props = { params: Promise<{ locale: AppLocale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const resource = getResourcePage(slug);
  if (!resource) return {};
  const t = await getTranslations({ locale, namespace: 'seo' });
  const category = getCategory(resource.category)?.name[locale];
  const title = category ? t('resourceTitle', { name: resource.name, category }) : resource.name;
  return localizedMetadata(locale, `/r/${slug}`, title, resource.description[locale], {
    ogType: 'article',
    // Arquivados ficam como registo, fora do índice (spec 009).
    ...(resource.status === 'archived' ? { robots: { index: false, follow: true } } : {}),
  });
}

function host(url: string) {
  return new URL(url).hostname.replace(/^www\./, '');
}

/** Quantos recursos da mesma categoria aparecem em "Mais em …". */
const RELATED_COUNT = 4;

/** Página de recurso (spec 003 + 009, mockup Resource.dc.html). Só mostra o que existe nos dados. */
export default async function ResourcePage({ params }: Props) {
  const { locale, slug } = await params;
  const resource = getResourcePage(slug);
  if (!resource) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('resource');
  const areaT = await getTranslations('area');
  const pricing = await getTranslations('pricing');
  const level = await getTranslations('level');
  const a11y = await getTranslations('a11y');
  const format = await getFormatter();
  const category = getCategory(resource.category);
  const area = getArea(resource.area);
  const seo = await getTranslations('seo');
  const archived = resource.status === 'archived';
  const alternatives = (resource.alternatives ?? [])
    .map((alternative) => getResource(alternative))
    .filter((alternative) => alternative !== undefined);
  const shown = new Set([slug, ...alternatives.map((alternative) => alternative.slug)]);
  const related = listResources({ category: resource.category })
    .filter((item) => !shown.has(item.slug))
    .slice(0, RELATED_COUNT);
  const why = resource.why?.[locale];
  const date = (value: string) => (
    <time dateTime={value}>
      {format.dateTime(new Date(`${value}T00:00:00Z`), { dateStyle: 'medium', timeZone: 'UTC' })}
    </time>
  );
  const path = `/${locale}/r/${slug}`;
  const structured = graph(
    resourcePageNode(resource, { locale, path, name: resource.name, description: resource.description[locale] }),
    breadcrumbNode(path, [
      { name: areaT('index'), path: `/${locale}` },
      { name: area?.name[locale] ?? '', path: `/${locale}/${resource.area}` },
      { name: category?.name[locale] ?? '', path: `/${locale}/c/${resource.category}` },
      { name: resource.name, path },
    ]),
  );

  const details: { key: string; value: React.ReactNode }[] = [
    {
      key: t('category'),
      value: category ? (
        <Link href={`/c/${category.slug}`} className="link-inline">
          {category.name[locale]}
        </Link>
      ) : null,
    },
    { key: t('area'), value: area?.name[locale] },
    { key: t('pricing'), value: resource.pricing === 'TODO' ? null : pricing(resource.pricing) },
    { key: t('openSource'), value: resource.open_source === 'TODO' ? null : resource.open_source ? t('yes') : t('no') },
    { key: t('license'), value: resource.license },
    { key: t('level'), value: resource.level?.map((item) => level(item)).join(', ') },
    { key: t('author'), value: resource.author },
    { key: t('added'), value: date(resource.added) },
    { key: t('checked'), value: date(resource.last_checked) },
  ].filter((row) => row.value);

  return (
    <>
      <SiteHeader current={resource.area} />
      <JsonLd data={structured} />
      <main id="conteudo" className="t-reveal mx-auto w-full max-w-(--container-max) px-(--gutter) pt-12 pb-24">
        <Breadcrumb
          label={areaT('breadcrumb')}
          items={[
            { label: areaT('index'), href: `/${locale}` },
            { label: area?.name[locale] ?? '', href: `/${locale}/${resource.area}` },
            { label: category?.name[locale] ?? '', href: `/${locale}/c/${resource.category}` },
            { label: resource.name },
          ]}
        />

        <div className="t-reveal mt-8 flex flex-wrap items-start gap-12">
          <article className="t-reveal min-w-0 flex-[999_1_560px]" data-pagefind-body={archived ? undefined : ''}>
            {/* Metadados e filtros da busca (spec 008): não aparecem na página. */}
            <div hidden>
              <span data-pagefind-meta="kind">resource</span>
              <span data-pagefind-meta="slug">{resource.slug}</span>
              {resource.id !== undefined ? <span data-pagefind-meta="id">{resource.id}</span> : null}
              <span data-pagefind-meta="url">{resource.url}</span>
              <span data-pagefind-meta="category">{category?.name[locale]}</span>
              <span data-pagefind-meta="description">{resource.description[locale]}</span>
              <span data-pagefind-meta="area">{area?.name[locale]}</span>
              <span data-pagefind-filter="area">{area?.name[locale]}</span>
              <span data-pagefind-filter="category">{category?.name[locale]}</span>
              {resource.pricing === 'TODO' ? null : (
                <span data-pagefind-filter="pricing">{pricing(resource.pricing)}</span>
              )}
              {resource.open_source === true ? <span data-pagefind-filter="oss">{t('ossBadge')}</span> : null}
            </div>
            {archived ? (
              <p
                role="note"
                className="mb-6 rounded-card border border-border-strong bg-carbon px-6 py-4 text-body text-secondary"
              >
                {seo('archived')}
              </p>
            ) : null}
            {resource.id !== undefined || resource.open_source === true || archived ? (
              <div className="mb-5 flex items-center gap-2">
                {archived ? <TagChip>{t('archivedBadge')}</TagChip> : null}
                {resource.id !== undefined ? (
                  <span className="inline-flex h-7 items-center rounded-pill border border-border-strong bg-carbon px-3">
                    <IndexId id={resource.id} className="text-small" />
                  </span>
                ) : null}
                {resource.open_source === true ? <TagChip tone="brand">{t('ossBadge')}</TagChip> : null}
              </div>
            ) : null}
            <h1 className="title-display text-primary">{resource.name}</h1>
            <p className="mt-5 max-w-2xl text-h3 font-normal text-primary">{resource.description[locale]}</p>

            <div className="mt-7 flex flex-wrap gap-3" data-pagefind-ignore>
              <a
                href={outboundUrl(resource.url)}
                target="_blank"
                rel="noopener"
                data-umami-event="resource_outbound"
                data-umami-event-slug={resource.slug}
                data-umami-event-target="website"
                className="t-hover t-icon-host inline-flex h-12 items-center gap-4 rounded-pill bg-button-primary pr-2 pl-6 text-body font-medium text-button-primary-text hover:opacity-90"
              >
                <span>
                  {t('visit', { host: host(resource.url) })}
                  <span className="sr-only"> {a11y('newTab')}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="inline-flex size-9 items-center justify-center rounded-pill bg-index-blue text-button-brand-text"
                >
                  <ArrowUpRightIcon size={16} />
                </span>
              </a>
              {resource.repo && resource.repo !== resource.url ? (
                <a
                  href={outboundUrl(resource.repo)}
                  target="_blank"
                  rel="noopener"
                  data-umami-event="resource_outbound"
                  data-umami-event-slug={resource.slug}
                  data-umami-event-target="repo"
                  className="t-hover inline-flex h-12 items-center rounded-pill border border-border-strong px-6 text-body text-primary hover:bg-graphite"
                >
                  {t('repo')}
                  <span className="sr-only"> {a11y('newTab')}</span>
                </a>
              ) : null}
            </div>

            {why ? (
              <section aria-labelledby="why" className="mt-10 rounded-card border border-border bg-list p-7">
                <h2 id="why" className="label-mono mb-3 text-link">
                  {t('why')}
                </h2>
                <p className="text-h3 font-normal text-primary">{why}</p>
              </section>
            ) : null}

            {alternatives.length > 0 ? (
              <section aria-labelledby="alternatives" className="mt-14" data-pagefind-ignore>
                <h2 id="alternatives" className="title-h3 text-primary">
                  {t('alternatives')}
                </h2>
                <p className="mt-1 mb-5 text-body text-secondary">{t('alternativesMuted')}</p>
                <ResourceList label={t('alternativesList', { name: resource.name })}>
                  {alternatives.map((alternative) => (
                    <ResourceRow
                      key={alternative.slug}
                      href={`/${locale}/r/${alternative.slug}`}
                      id={alternative.id}
                      name={alternative.name}
                      description={alternative.description[locale]}
                    />
                  ))}
                </ResourceList>
              </section>
            ) : null}

            {related.length > 0 && category ? (
              <section aria-labelledby="related" className="mt-14" data-pagefind-ignore>
                <h2 id="related" className="title-h3 mb-5 text-primary">
                  <Link href={`/c/${category.slug}`} className="t-hover hover:text-link">
                    {seo('related', { category: category.name[locale] })}
                  </Link>
                </h2>
                <ResourceList label={seo('relatedList', { category: category.name[locale] })}>
                  {related.map((item) => (
                    <ResourceRow
                      key={item.slug}
                      href={`/${locale}/r/${item.slug}`}
                      id={item.id}
                      name={item.name}
                      description={item.description[locale]}
                      compact
                    />
                  ))}
                </ResourceList>
              </section>
            ) : null}
          </article>

          <aside
            aria-labelledby="details"
            className="t-reveal flex w-full flex-col gap-4 lg:max-w-sm lg:flex-[1_1_280px]"
          >
            <div className="overflow-hidden rounded-card border border-border bg-carbon">
              <h2 id="details" className="label-mono border-b border-border px-6 py-4 text-muted">
                {t('details')}
              </h2>
              <dl className="px-6 pt-1 pb-3">
                {details.map((row) => (
                  <div key={row.key} className="flex justify-between gap-4 border-b border-border py-3 last:border-b-0">
                    <dt className="font-mono text-mono text-muted">{row.key}</dt>
                    <dd className="text-right text-small text-primary">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-card border border-border px-6 py-5">
              <h2 className="label-mono mb-3 text-muted">{t('tags')}</h2>
              <ul className="flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <li key={tag}>
                    <TagChip>{tag}</TagChip>
                  </li>
                ))}
              </ul>
            </div>
            <p className="px-2 text-small text-secondary">
              {t('edit')}{' '}
              <a
                href={`${GITHUB_URL}/edit/main/data/resources/${resource.slug}.yaml`}
                target="_blank" rel="noopener noreferrer"
                className="link-inline"
              >
                {t('editLink')}
              </a>
              .
            </p>
          </aside>
        </div>
      </main>
    </>
  );
}
