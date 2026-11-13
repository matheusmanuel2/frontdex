import { getTranslations, setRequestLocale } from 'next-intl/server';

import { EmptyState, Eyebrow, SectionTitle } from '@/components/index';
import { RandomCard, type RandomItem } from '@/components/random/RandomCard';
import { SiteHeader } from '@/components/site/SiteHeader';
import { getArea, getCategory, listResources } from '@/lib/content';
import type { AppLocale } from '@/lib/i18n/routing';

import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'random' });
  return { title: t('eyebrow'), description: t('title') };
}

/** Surpresa (spec 003 + decisão D-01): card com um recurso ao acaso, escolhido no browser. */
export default async function RandomPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('random');
  const pricing = await getTranslations('pricing');

  const items: RandomItem[] = listResources().map((resource) => ({
    slug: resource.slug,
    id: resource.id,
    name: resource.name,
    url: resource.url,
    host: resource.url.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, ''),
    description: resource.description[locale],
    why: resource.why?.[locale],
    place: [getArea(resource.area)?.name[locale], getCategory(resource.category)?.name[locale]]
      .filter(Boolean)
      .join(' / '),
    badge:
      [resource.pricing === 'TODO' ? null : pricing(resource.pricing), resource.license].filter(Boolean).join(' · ') ||
      undefined,
  }));

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="mx-auto w-full max-w-(--container-max) px-(--gutter) pt-20 pb-28">
        <div className="text-center">
          <Eyebrow className="mb-5">{t('eyebrow')}</Eyebrow>
          <SectionTitle as="h1" size="h1" title={t('title')} muted={t('titleMuted')} />
        </div>
        {items.length === 0 ? (
          <EmptyState className="mx-auto mt-12 max-w-3xl" title={t('empty')} />
        ) : (
          <>
            <RandomCard
              items={items}
              locale={locale}
              labels={{
                open: t('open'),
                another: t('another'),
                visit: t('visit'),
                footer: t('footer', { count: items.length }),
              }}
            />
            <noscript>
              <p className="mt-3 text-center text-small text-secondary">{t('noscript')}</p>
            </noscript>
          </>
        )}
      </main>
    </>
  );
}
