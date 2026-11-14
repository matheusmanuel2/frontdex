import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { RssIcon } from '@/components/icons';
import { Breadcrumb, EmptyState, ResourceList, ResourceRow, SectionTitle, TagChip } from '@/components/index';
import { SiteHeader } from '@/components/site/SiteHeader';
import { getCategory, groupByWeek, listNew } from '@/lib/content';
import type { AppLocale } from '@/lib/i18n/routing';
import { localizedMetadata } from '@/lib/seo/metadata';

import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'new' });
  return localizedMetadata(locale, '/new', t('title').replace(/\.$/, ''), t('intro'), {
    alternates: { types: { 'application/rss+xml': `/${locale}/feed.xml` } },
  });
}

/** Novos (spec 003, mockup New): por semana de entrada, do mais recente para o mais antigo. */
export default async function NewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('new');
  const areaT = await getTranslations('area');
  const format = await getFormatter();
  const weeks = groupByWeek(listNew());

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="mx-auto w-full max-w-(--container-max) px-(--gutter) pt-12 pb-24 sm:pt-14">
        <Breadcrumb
          label={areaT('breadcrumb')}
          items={[{ label: areaT('index'), href: `/${locale}` }, { label: t('title').replace(/\.$/, '') }]}
        />
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionTitle as="h1" size="h1" title={t('title')} muted={t('titleMuted')} />
            <p className="mt-5 max-w-xl text-body text-secondary">{t('intro')}</p>
          </div>
          <a
            href={`/${locale}/feed.xml`}
            className="t-hover t-icon-host inline-flex h-10 items-center gap-2 rounded-pill border border-border-strong px-4 text-small text-primary hover:bg-graphite"
          >
            <RssIcon size={16} />
            {t('rss')}
          </a>
        </div>

        {weeks.length === 0 ? (
          <EmptyState className="mt-14" title={t('empty')} />
        ) : (
          weeks.map((week) => {
            const label = t('week', {
              date: format.dateTime(new Date(`${week.start}T00:00:00Z`), { dateStyle: 'long', timeZone: 'UTC' }),
            });
            return (
              <section key={week.start} aria-labelledby={`week-${week.start}`} className="mt-14">
                <div className="mb-4 flex items-baseline justify-between gap-4">
                  <h2 id={`week-${week.start}`} className="title-h3 text-primary">
                    {label}
                  </h2>
                  <span className="font-mono text-mono text-muted">{t('count', { count: week.resources.length })}</span>
                </div>
                <ResourceList label={label}>
                  {week.resources.map((resource) => (
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
          })
        )}
      </main>
    </>
  );
}
