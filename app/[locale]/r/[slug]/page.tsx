import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { ArrowUpRightIcon } from '@/components/icons';
import { Breadcrumb, IndexId, ResourceList, ResourceRow, TagChip } from '@/components/index';
import { Link } from '@/components/site/LocaleLink';
import { GITHUB_URL } from '@/components/site/nav';
import { SiteHeader } from '@/components/site/SiteHeader';
import { getAlternatives, getArea, getCategory, getResource, listResources } from '@/lib/content';
import { routing, type AppLocale } from '@/lib/i18n/routing';
import { localizedMetadata } from '@/lib/seo/metadata';

import type { Metadata } from 'next';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => listResources().map((resource) => ({ locale, slug: resource.slug })));
}

type Props = { params: Promise<{ locale: AppLocale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const resource = getResource(slug);
  if (!resource) return {};
  return localizedMetadata(locale, `/r/${slug}`, resource.name, resource.description[locale]);
}

function host(url: string) {
  return new URL(url).hostname.replace(/^www\./, '');
}

/** Página de recurso (spec 003, mockup Resource.dc.html). Só mostra o que existe nos dados. */
export default async function ResourcePage({ params }: Props) {
  const { locale, slug } = await params;
  const resource = getResource(slug);
  if (!resource) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('resource');
  const areaT = await getTranslations('area');
  const pricing = await getTranslations('pricing');
  const level = await getTranslations('level');
  const format = await getFormatter();
  const category = getCategory(resource.category);
  const area = getArea(resource.area);
  const alternatives = getAlternatives(slug);
  const why = resource.why?.[locale];
  const date = (value: string) =>
    format.dateTime(new Date(`${value}T00:00:00Z`), { dateStyle: 'medium', timeZone: 'UTC' });

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
      <main id="conteudo" className="mx-auto w-full max-w-(--container-max) px-(--gutter) pt-12 pb-24">
        <Breadcrumb
          label={areaT('breadcrumb')}
          items={[
            { label: areaT('index'), href: `/${locale}` },
            { label: area?.name[locale] ?? '', href: `/${locale}/${resource.area}` },
            { label: category?.name[locale] ?? '', href: `/${locale}/c/${resource.category}` },
            { label: resource.name },
          ]}
        />

        <div className="mt-8 flex flex-wrap items-start gap-12">
          <div className="min-w-0 flex-[999_1_560px]" data-pagefind-body>
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
            {resource.id !== undefined || resource.open_source === true ? (
              <div className="mb-5 flex items-center gap-2">
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
                href={resource.url}
                rel="noopener"
                data-umami-event="resource_outbound"
                data-umami-event-slug={resource.slug}
                data-umami-event-target="website"
                className="t-hover t-icon-host inline-flex h-12 items-center gap-4 rounded-pill bg-button-primary pr-2 pl-6 text-body font-medium text-button-primary-text hover:opacity-90"
              >
                {t('visit', { host: host(resource.url) })}
                <span
                  aria-hidden="true"
                  className="inline-flex size-9 items-center justify-center rounded-pill bg-index-blue text-button-brand-text"
                >
                  <ArrowUpRightIcon size={16} />
                </span>
              </a>
              {resource.repo && resource.repo !== resource.url ? (
                <a
                  href={resource.repo}
                  rel="noopener"
                  data-umami-event="resource_outbound"
                  data-umami-event-slug={resource.slug}
                  data-umami-event-target="repo"
                  className="t-hover inline-flex h-12 items-center rounded-pill border border-border-strong px-6 text-body text-primary hover:bg-graphite"
                >
                  {t('repo')}
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
          </div>

          <aside aria-labelledby="details" className="flex w-full flex-col gap-4 lg:max-w-sm lg:flex-[1_1_280px]">
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
                rel="noopener"
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
