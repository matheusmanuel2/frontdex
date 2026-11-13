'use client';

import { useLocale, useTranslations } from 'next-intl';

import { usePathname } from '@/lib/i18n/navigation';
import { LOCALE_COOKIE, routing } from '@/lib/i18n/routing';

/** Um ano, em segundos. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Seletor de idioma (spec 007, T-404). Ilha client-side: leva à mesma rota no
 * outro idioma e grava o cookie NEXT_LOCALE, que o proxy lê em `/`.
 * Sem JS continua a ser um link normal para a rota no outro idioma.
 */
export function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('locale');
  const other = routing.locales.find((candidate) => candidate !== locale) ?? routing.defaultLocale;

  // A 404 é gerada uma vez (em /_not-found) e não sabe a rota pedida: aí, leva à home do outro idioma.
  const path = pathname === '/_not-found' ? '/' : pathname;

  return (
    <a
      href={`/${other}${path === '/' ? '' : path}`}
      hrefLang={other === 'pt' ? 'pt-BR' : 'en'}
      aria-label={t('label')}
      onClick={() => {
        document.cookie = `${LOCALE_COOKIE}=${other}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
      }}
      className="t-hover inline-flex h-10 items-center rounded-pill border border-border-button px-3 font-mono text-mono text-secondary hover:border-border-strong hover:text-primary sm:px-4"
    >
      {t('short')}
    </a>
  );
}
