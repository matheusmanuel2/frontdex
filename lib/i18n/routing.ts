import { defineRouting } from 'next-intl/routing';

/**
 * Idiomas (spec 007): pt-BR padrão em /pt, inglês em /en, slugs iguais.
 * A deteção de idioma é só em `/` e é nossa (proxy.ts), não a do next-intl.
 */
export const routing = defineRouting({
  locales: ['pt', 'en'],
  defaultLocale: 'pt',
  localePrefix: 'always',
  localeDetection: false,
  localeCookie: false,
});

export type AppLocale = (typeof routing.locales)[number];

/** Valor de `<html lang>` por idioma. */
export const HTML_LANG: Record<AppLocale, string> = { pt: 'pt-BR', en: 'en' };

/** Cookie com a escolha do visitante (spec 007), gravado pelo LocaleSwitch e lido em `/`. */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export function isLocale(value: string): value is AppLocale {
  return (routing.locales as readonly string[]).includes(value);
}
