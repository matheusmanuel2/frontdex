import '@/styles/globals.css';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import { NotFoundContent } from '@/components/site/NotFoundContent';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { fontVariables } from '@/lib/fonts';
import { HTML_LANG, routing } from '@/lib/i18n/routing';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: routing.defaultLocale, namespace: 'notFound' });
  const meta = await getTranslations({ locale: routing.defaultLocale, namespace: 'meta' });
  return { title: `${t('metaTitle')} · ${meta('siteName')}`, robots: { index: false } };
}

/** 404 fora de /pt e /en (por exemplo /xx/algo): mostra a versão em pt-BR, o idioma padrão. */
export default async function RootNotFound() {
  const locale = routing.defaultLocale;
  setRequestLocale(locale);
  const { locale: localeMessages } = await getMessages({ locale });

  return (
    <html lang={HTML_LANG[locale]} data-theme="dark" className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider locale={locale} messages={{ locale: localeMessages }}>
          <SiteHeader />
          <NotFoundContent />
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
