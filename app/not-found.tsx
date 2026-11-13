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
  return {
    title: `${t('metaTitle')} · ${meta('siteName')}`,
    description: t('body'),
    robots: { index: false },
  };
}

/**
 * 404 de qualquer rota desconhecida. Com tudo estático, o Next só gera uma página 404,
 * por isso ela é bilingue: bloco em pt-BR e bloco em inglês, cada um com o seu `lang` (D-09).
 */
export default async function RootNotFound() {
  const locale = routing.defaultLocale;
  setRequestLocale(locale);

  return (
    <html lang={HTML_LANG[locale]} data-theme="dark" className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        <SkipLink />
        <SiteHeader />
        <main id="conteudo" className="divide-y divide-border">
          <NotFoundContent locale="pt" />
          <NotFoundContent locale="en" primary={false} />
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
