import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { CopyLinkButton } from '@/components/collection/CopyLinkButton';
import { Breadcrumb, Eyebrow, ResourceList, ResourceRow, TagChip } from '@/components/index';
import { Link } from '@/components/site/LocaleLink';
import { SiteHeader } from '@/components/site/SiteHeader';
import { getCategory, getCollection, getCollectionResources, listCollections } from '@/lib/content';
import { routing, type AppLocale } from '@/lib/i18n/routing';
import { localizedMetadata } from '@/lib/seo/metadata';

import type { Metadata } from 'next';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    listCollections().map((collection) => ({ locale, slug: collection.slug })),
  );
}

type Props = { params: Promise<{ locale: AppLocale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return {};
  return localizedMetadata(locale, `/collections/${slug}`, collection.title[locale], collection.text[locale]);
}

const ghost =
  't-hover inline-flex h-10 items-center rounded-pill border border-border-strong px-4 text-small text-primary hover:bg-graphite';

/** Coleção (spec 003, mockup Collection): nota do curador e lista ordenada numerada. */
export default async function CollectionPage({ params }: Props) {
  const { locale, slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('collections');
  const areaT = await getTranslations('area');
  const nav = await getTranslations('nav');
  const items = getCollectionResources(slug);
  const others = listCollections().filter((other) => other.slug !== slug);

  return (
    <>
      <SiteHeader current="collections" />
      <main id="conteudo" className="mx-auto w-full max-w-(--container-max) px-(--gutter) pt-12 pb-24 sm:pt-14">
        <Breadcrumb
          label={areaT('breadcrumb')}
          items={[
            { label: areaT('index'), href: `/${locale}` },
            { label: nav('collections'), href: `/${locale}/collections` },
            { label: collection.title[locale] },
          ]}
        />
        <div className="mt-5 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <Eyebrow className="mb-5">{t('eyebrow', { count: items.length })}</Eyebrow>
            <h1 className="title-h1 text-primary">{collection.title[locale]}</h1>
            <div className="mt-7 flex flex-wrap gap-3">
              <CopyLinkButton label={t('copy')} copiedLabel={t('copied')} />
            </div>
          </div>
          <aside aria-labelledby="curator-note" className="rounded-card border border-border bg-carbon p-6">
            <h2 id="curator-note" className="label-mono mb-3 text-muted">
              {t('note')}
            </h2>
            <p className="text-body text-primary">{collection.text[locale]}</p>
          </aside>
        </div>

        <div className="mt-14">
          <ResourceList ordered label={t('list')}>
            {items.map((item, index) => (
              <ResourceRow
                key={item.slug}
                href={`/${locale}/r/${item.slug}`}
                position={index + 1}
                name={item.name}
                description={item.description[locale]}
                meta={item.why?.[locale] ? `${t('why')} ${item.why[locale]}` : undefined}
                aside={<TagChip>{getCategory(item.category)?.name[locale]}</TagChip>}
              />
            ))}
          </ResourceList>
        </div>

        {others.length > 0 ? (
          <section aria-labelledby="other-collections" className="mt-12 flex flex-wrap items-center gap-2">
            <h2 id="other-collections" className="mr-2 text-small text-muted">
              {t('others')}
            </h2>
            {others.slice(0, 3).map((other) => (
              <Link key={other.slug} href={`/collections/${other.slug}`} className={ghost}>
                {other.title[locale]}
              </Link>
            ))}
            <Link href="/collections" className={ghost}>
              {t('all')}
            </Link>
          </section>
        ) : null}
      </main>
    </>
  );
}
