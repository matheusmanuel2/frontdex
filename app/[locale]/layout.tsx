import '@/styles/globals.css';

import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { CommandMenuLauncher } from '@/components/search/CommandMenuLauncher';
import type { SearchLabels } from '@/components/search/labels';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SkipLink } from '@/components/site/SkipLink';
import { fontVariables } from '@/lib/fonts';
import { HTML_LANG, routing } from '@/lib/i18n/routing';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: hasLocale(routing.locales, locale) ? locale : 'pt', namespace: 'meta' });
  return {
    title: { default: t('title'), template: `%s · ${t('siteName')}` },
    description: t('description'),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'search' });
  const searchLabels: SearchLabels = {
    label: t('label'),
    placeholder: t('placeholder'),
    close: t('close'),
    resources: t('resources'),
    categories: t('categories'),
    shortcuts: t('shortcuts'),
    loading: t('loading'),
    empty: t.raw('empty') as string,
    hint: t('hint'),
    seeAll: t('seeAll'),
    s1: t('s1'),
    s2: t('s2'),
    s3: t('s3'),
    s4: t('s4'),
  };

  return (
    <html lang={HTML_LANG[locale]} data-theme="dark" className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        <SkipLink />
        <>
          {children}
          <SiteFooter />
          <CommandMenuLauncher locale={locale} labels={searchLabels} />
        </>
      </body>
    </html>
  );
}
