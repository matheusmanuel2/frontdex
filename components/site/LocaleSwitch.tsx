'use client';

import { usePathname } from 'next/navigation';

import { LOCALE_COOKIE } from '@/lib/i18n/routing';

/** Um ano, em segundos. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type LocaleSwitchProps = {
  /** Idioma para onde o link leva. */
  to: string;
  /** Valor de `hreflang` do destino. */
  hrefLang: string;
  /** Nome acessível; contém o texto visível (WCAG 2.5.3). */
  label: string;
  /** Texto visível ("PT / EN"). */
  short: string;
};

/**
 * Seletor de idioma (spec 007, T-404). Ilha client-side: leva à mesma rota no
 * outro idioma e grava o cookie NEXT_LOCALE, que o proxy lê em `/`.
 * Sem JS continua a ser um link normal. Os textos chegam por props (sem provider de i18n no browser).
 */
export function LocaleSwitch({ to, hrefLang, label, short }: LocaleSwitchProps) {
  const pathname = usePathname() ?? '/';
  // Tira o idioma atual; a 404 é gerada uma vez (em /_not-found) e não sabe a rota pedida: aí, home.
  const rest = pathname.replace(/^\/(pt|en)(?=\/|$)/, '');
  const path = rest === '/_not-found' || rest === '' ? '/' : rest;

  return (
    <a
      href={`/${to}${path === '/' ? '' : path}`}
      hrefLang={hrefLang}
      aria-label={label}
      onClick={() => {
        document.cookie = `${LOCALE_COOKIE}=${to}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
      }}
      className="t-hover inline-flex h-10 items-center rounded-pill border border-border-button px-3 font-mono text-mono text-secondary hover:border-border-strong hover:text-primary sm:px-4"
    >
      {short}
    </a>
  );
}
