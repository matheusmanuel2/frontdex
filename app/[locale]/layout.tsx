import '@/styles/globals.css';

import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

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
  // Só as mensagens das ilhas client-side vão para o browser (JS da home < 90 KB).
  const { locale: localeMessages } = await getMessages();

  return (
    <html lang={HTML_LANG[locale]} data-theme="dark" className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        <SkipLink />
        <NextIntlClientProvider messages={{ locale: localeMessages }}>
          {children}
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
