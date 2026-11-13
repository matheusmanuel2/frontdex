import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import {
  Breadcrumb,
  CategoryCard,
  EmptyState,
  Eyebrow,
  ResourceList,
  ResourceRow,
  SectionTitle,
  TagChip,
} from '@/components/index';
import { Link } from '@/components/site/LocaleLink';
import { SiteHeader } from '@/components/site/SiteHeader';
import {
  AREA_NUMBER,
  AREAS,
  getArea,
  getCategory,
  listAreas,
  listCategories,
  listResources,
  type AreaSlug,
} from '@/lib/content';
import { routing, type AppLocale } from '@/lib/i18n/routing';
import { localizedMetadata } from '@/lib/seo/metadata';

import type { Metadata } from 'next';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => AREAS.map((area) => ({ locale, area })));
}

type Props = { params: Promise<{ locale: AppLocale; area: string }> };

function isArea(value: string): value is AreaSlug {
  return (AREAS as readonly string[]).includes(value);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, area: slug } = await params;
  const area = isArea(slug) ? getArea(slug) : undefined;
  if (!area) return {};
  return localizedMetadata(locale, `/${slug}`, area.name[locale], area.description[locale]);
}

const pill =
  't-hover inline-flex h-10 items-center rounded-pill border border-border-strong px-4 text-small text-primary hover:bg-graphite';

/** Página de área (spec 003, mockup Area.dc.html). Categorias vazias não aparecem. */
export default async function AreaPage({ params }: Props) {
  const { locale, area: slug } = await params;
  if (!isArea(slug)) notFound();
  setRequestLocale(locale);
  const area = getArea(slug);
  if (!area) notFound();

  const t = await getTranslations('area');
  const nav = await getTranslations('nav');
  const resources = listResources({ area: slug });
  const categories = listCategories(slug)
    .map((category) => ({ category, items: listResources({ category: category.slug }) }))
    .filter(({ items }) => items.length > 0);
  const recent = resources.slice(0, 5);
  const others = listAreas().filter((other) => other.slug !== slug);

  return (
    <>
      <SiteHeader current={slug} />
      <main id="conteudo" className="mx-auto w-full max-w-(--container-max) px-(--gutter) pt-12 pb-24 sm:pt-14">
        <Breadcrumb
          label={t('breadcrumb')}
          items={[{ label: t('index'), href: `/${locale}` }, { label: area.name[locale] }]}
        />
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow className="mb-5">
              {AREA_NUMBER[slug]} / {nav(slug)}
            </Eyebrow>
            <SectionTitle
              as="h1"
              size="h1"
              title={`${area.name[locale]}.`}
              muted={area.description[locale]}
              className="max-w-4xl"
            />
          </div>
          <p className="font-mono text-mono text-muted">
            {t('stats', { resources: resources.length, categories: categories.length })}
          </p>
        </div>

        {resources.length === 0 ? (
          <EmptyState
            className="mt-14"
            title={t('emptyTitle')}
            description={t('emptyBody')}
            actions={
              <Link href="/add" className={pill}>
                {t('suggest')}
              </Link>
            }
          />
        ) : (
          <>
            <section aria-labelledby="area-categories" className="mt-14">
              <h2 id="area-categories" className="title-h3 mb-5 text-primary">
                {t('categories')}
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categories.map(({ category, items }) => (
                  <li key={category.slug}>
                    <CategoryCard
                      href={`/${locale}/c/${category.slug}`}
                      name={category.name[locale]}
                      count={String(items.length)}
                      description={category.description?.[locale]}
                      examples={items
                        .slice(0, 3)
                        .map((item) => item.name)
                        .join(' · ')}
                      className="h-full"
                    />
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="area-recent" className="mt-16">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <h2 id="area-recent" className="title-h3 text-primary">
                  {t('recent', { area: area.name[locale] })}
                </h2>
                <Link href="/new" className={pill}>
                  {t('seeNew')}
                </Link>
              </div>
              <ResourceList label={t('recentList')}>
                {recent.map((resource) => (
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
          </>
        )}

        <section
          aria-labelledby="area-others"
          className="mt-16 flex flex-wrap items-center justify-between gap-5 rounded-card border border-border bg-carbon p-7"
        >
          <h2 id="area-others" className="text-body text-primary">
            {t('others')}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {others.map((other) => (
              <li key={other.slug}>
                <Link href={`/${other.slug}`} className={pill}>
                  {AREA_NUMBER[other.slug]} · {other.name[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
