import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Breadcrumb, CollectionCard, EmptyState, Eyebrow, SectionTitle } from '@/components/index';
import { Link } from '@/components/site/LocaleLink';
import { SiteHeader } from '@/components/site/SiteHeader';
import { getArea, getCollectionResources, listCollections } from '@/lib/content';
import type { AppLocale } from '@/lib/i18n/routing';
import { localizedMetadata } from '@/lib/seo/metadata';

import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'collections' });
  return localizedMetadata(locale, '/collections', t('title').replace(/\.$/, ''), t('intro'));
}

const ghost =
  't-hover inline-flex h-10 items-center rounded-pill border border-border-strong px-4 text-small text-primary hover:bg-graphite';

/** Lista de coleções (spec 003, mockup Collections). Só as `active` são publicadas. */
export default async function CollectionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('collections');
  const areaT = await getTranslations('area');
  const nav = await getTranslations('nav');
  const collections = listCollections();

  return (
    <>
      <SiteHeader current="collections" />
      <main id="conteudo" className="mx-auto w-full max-w-(--container-max) px-(--gutter) pt-12 pb-24 sm:pt-14">
        <Breadcrumb
          label={areaT('breadcrumb')}
          items={[{ label: areaT('index'), href: `/${locale}` }, { label: nav('collections') }]}
        />
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow className="mb-5">{nav('collections')}</Eyebrow>
            <SectionTitle as="h1" size="h1" title={t('title')} muted={t('titleMuted')} />
            <p className="mt-5 max-w-xl text-body text-secondary">{t('intro')}</p>
          </div>
          <p className="font-mono text-mono text-muted">{t('count', { count: collections.length })}</p>
        </div>

        {collections.length === 0 ? (
          <EmptyState
            className="mt-14"
            title={t('emptyTitle')}
            description={t('emptyBody')}
            actions={
              <Link href="/add" data-umami-event="add_click" className={ghost}>
                {t('propose')}
              </Link>
            }
          />
        ) : (
          <ul className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {collections.map((collection) => {
              const items = getCollectionResources(collection.slug);
              const areas = [...new Set(items.map((item) => item.area))];
              return (
                <li key={collection.slug}>
                  <CollectionCard
                    href={`/${locale}/collections/${collection.slug}`}
                    eyebrow={areas.length === 1 && areas[0] ? getArea(areas[0])?.name[locale] : undefined}
                    title={collection.title[locale]}
                    count={t('resources', { count: items.length })}
                    description={collection.text[locale]}
                    items={items
                      .slice(0, 3)
                      .map((item) => item.name)
                      .join(' · ')}
                    className="h-full"
                  />
                </li>
              );
            })}
          </ul>
        )}

        {collections.length > 0 ? (
          <section className="mt-14 flex flex-wrap items-center justify-between gap-5 rounded-card border border-border bg-carbon p-7">
            <div>
              <p className="text-body text-primary">{t('proposeTitle')}</p>
              <p className="mt-1 text-small text-secondary">{t('proposeBody')}</p>
            </div>
            <Link href="/add" data-umami-event="add_click" className={ghost}>
              {t('propose')}
            </Link>
          </section>
        ) : null}
      </main>
    </>
  );
}
