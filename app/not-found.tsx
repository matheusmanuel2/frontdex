import '@/styles/globals.css';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { NotFoundContent } from '@/components/site/NotFoundContent';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SkipLink } from '@/components/site/SkipLink';
import { fontVariables } from '@/lib/fonts';
import { HTML_LANG, routing } from '@/lib/i18n/routing';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: routing.defaultLocale, namespace: 'notFound' });
  const meta = await getTranslations({ locale: routing.defaultLocale, namespace: 'meta' });
  return { title: `${t('metaTitle')} · ${meta('siteName')}`, robots: { index: false } };
}

/**
 * 404 de qualquer rota desconhecida. Com tudo estático, o Next só gera esta (em pt-BR),
 * também para /en/… (decisão D-09 em aberto).
 */
export default async function RootNotFound() {
  const locale = routing.defaultLocale;
  setRequestLocale(locale);

  return (
    <html lang={HTML_LANG[locale]} data-theme="dark" className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        <SkipLink />
        <SiteHeader />
        <NotFoundContent />
        <SiteFooter />
      </body>
    </html>
  );
}
