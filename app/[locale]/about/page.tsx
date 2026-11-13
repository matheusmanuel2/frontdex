import { getTranslations, setRequestLocale } from 'next-intl/server';

import { StarIcon } from '@/components/icons';
import { Breadcrumb, Eyebrow, SectionTitle } from '@/components/index';
import { Link } from '@/components/site/LocaleLink';
import { GITHUB_URL } from '@/components/site/nav';
import { SiteHeader } from '@/components/site/SiteHeader';
import AboutEn from '@/content/pages/about.en.mdx';
import AboutPt from '@/content/pages/about.pt.mdx';
import { listAreas, listCategories, listResources } from '@/lib/content';
import type { AppLocale } from '@/lib/i18n/routing';
import { localizedMetadata } from '@/lib/seo/metadata';

import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return localizedMetadata(locale, '/about', t('eyebrow'), t('titleMuted'));
}

const CONTENT = { pt: AboutPt, en: AboutEn };
const PRINCIPLES = ['p1', 'p2', 'p3', 'p4', 'p5'] as const;

/** Sobre (spec 003, mockup About). Números vêm do loader; texto longo em MDX (rascunho para rever). */
export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');
  const areaT = await getTranslations('area');
  const Content = CONTENT[locale];

  const stats = [
    { label: t('resources'), value: listResources().length },
    { label: t('categories'), value: listCategories().length },
    { label: t('areas'), value: listAreas().length },
  ];

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="mx-auto w-full max-w-(--container-max) px-(--gutter) pt-12 pb-24 sm:pt-14">
        <Breadcrumb
          label={areaT('breadcrumb')}
          items={[{ label: areaT('index'), href: `/${locale}` }, { label: t('eyebrow') }]}
        />
        <Eyebrow className="mt-5 mb-5">{t('eyebrow')}</Eyebrow>
        <SectionTitle as="h1" size="h1" title={t('title')} muted={t('titleMuted')} />

        <section aria-labelledby="about-why" className="mt-14 border-t border-border pt-12">
          <h2 id="about-why" className="label-mono mb-2 text-link">
            {t('why')}
          </h2>
          <Content />
        </section>

        <section aria-labelledby="about-principles" className="mt-16">
          <h2 id="about-principles" className="title-h3 mb-5 text-primary">
            {t('principles')}
          </h2>
          <ol className="overflow-hidden rounded-panel border border-border bg-list">
            {PRINCIPLES.map((key, index) => (
              <li
                key={key}
                className="grid gap-x-5 gap-y-1 border-b border-border px-6 py-5 last:border-b-0 sm:grid-cols-[64px_minmax(0,1fr)]"
              >
                <span className="font-mono text-mono text-link">{String(index + 1).padStart(2, '0')}</span>
                <span>
                  <span className="block text-body font-medium text-primary">{t(key)}</span>
                  <span className="mt-1 block text-small text-secondary">{t(`${key}d`)}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="about-stats" className="mt-16">
          <h2 id="about-stats" className="sr-only">
            {t('stats')}
          </h2>
          <dl className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-card border border-border bg-carbon p-6">
                <dt className="label-mono text-muted">{stat.label}</dt>
                <dd className="title-h1 mt-3 text-primary tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          aria-labelledby="about-support"
          className="mt-16 grid items-start gap-10 rounded-card border border-border bg-carbon p-7 sm:p-10 lg:grid-cols-2"
        >
          <div>
            <SectionTitle id="about-support" as="h2" size="h2" title={t('support')} muted={t('supportMuted')} />
            <p className="mt-5 max-w-md text-body text-secondary">{t('supportBody')}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={GITHUB_URL}
                rel="noopener"
                className="t-hover t-icon-host inline-flex h-10 items-center gap-2 rounded-pill bg-button-primary px-5 text-small font-semibold text-button-primary-text hover:opacity-90"
              >
                <StarIcon size={16} />
                {t('star')}
              </a>
              <Link
                href="/add"
                data-umami-event="add_click"
                className="t-hover inline-flex h-10 items-center rounded-pill border border-border-strong px-5 text-small text-primary hover:bg-graphite"
              >
                {t('contribute')}
              </Link>
            </div>
          </div>
          <dl className="grid gap-3 text-small">
            {[
              [t('curation'), t('curationValue')],
              [t('code'), t('codeValue')],
              [t('content'), t('contentValue')],
              [t('analytics'), t('analyticsValue')],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-border pb-3 last:border-b-0">
                <dt className="font-mono text-mono text-muted">{label}</dt>
                <dd className="text-right text-primary">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </>
  );
}
