import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Breadcrumb, Eyebrow, SectionTitle } from '@/components/index';
import { GITHUB_URL } from '@/components/site/nav';
import { SiteHeader } from '@/components/site/SiteHeader';
import AddEn from '@/content/pages/add.en.mdx';
import AddPt from '@/content/pages/add.pt.mdx';
import type { AppLocale } from '@/lib/i18n/routing';
import { localizedMetadata } from '@/lib/seo/metadata';

import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'add' });
  return localizedMetadata(locale, '/add', t('eyebrow'), t('intro'));
}

const CONTENT = { pt: AddPt, en: AddEn };

/** Contribuir (spec 003/002, mockup Add). Texto longo em MDX por idioma; rascunho para o Matheus rever. */
export default async function AddPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('add');
  const areaT = await getTranslations('area');
  const Content = CONTENT[locale];

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
        <p className="mt-5 max-w-2xl text-body text-secondary">{t('intro')}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`${GITHUB_URL}/issues/new?template=add-resource.yml`}
            rel="noopener"
            className="t-hover inline-flex h-10 items-center rounded-pill bg-button-primary px-5 text-small font-semibold text-button-primary-text hover:opacity-90"
          >
            {t('form')}
          </a>
          <a
            href={`${GITHUB_URL}/blob/main/CONTRIBUTING.md`}
            rel="noopener"
            className="t-hover inline-flex h-10 items-center rounded-pill border border-border-strong px-5 text-small text-primary hover:bg-graphite"
          >
            {t('contributing')}
          </a>
        </div>
        <article className="mt-14 border-t border-border pt-12">
          <h2 className="label-mono mb-2 text-link">{t('question')}</h2>
          <Content />
        </article>
      </main>
    </>
  );
}
