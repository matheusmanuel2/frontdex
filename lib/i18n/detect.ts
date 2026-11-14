import { isLocale, routing, type AppLocale } from './routing';

/** Países lusófonos (spec 007): sem idioma no browser, estes vão para /pt. */
export const LUSOPHONE_COUNTRIES = new Set(['AO', 'BR', 'PT', 'MZ', 'CV', 'GW', 'ST', 'TL']);

type Signals = {
  cookie?: string | null;
  acceptLanguage?: string | null;
  country?: string | null;
};

/** Primeiro idioma do Accept-Language por ordem de qualidade (q). */
function preferredLanguage(header: string): string | undefined {
  return header
    .split(',')
    .map((part, index) => {
      const [tag = '', ...params] = part.trim().split(';');
      const q = params.map((param) => param.trim()).find((param) => param.startsWith('q='));
      return { tag: tag.toLowerCase(), q: q ? Number(q.slice(2)) : 1, index };
    })
    .filter((entry) => entry.tag && entry.tag !== '*' && entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index)[0]?.tag;
}

/**
 * Escolhe o idioma de `/` (spec 007), por esta ordem:
 * 1. cookie NEXT_LOCALE; 2. Accept-Language (português → pt, outro → en);
 * 3. país (lusófonos → pt, outros → en); 4. sem sinal → pt.
 */
export function detectLocale({ cookie, acceptLanguage, country }: Signals): AppLocale {
  if (cookie && isLocale(cookie)) return cookie;

  const language = acceptLanguage ? preferredLanguage(acceptLanguage) : undefined;
  if (language) return language === 'pt' || language.startsWith('pt-') ? 'pt' : 'en';

  if (country) return LUSOPHONE_COUNTRIES.has(country.toUpperCase()) ? 'pt' : 'en';

  return routing.defaultLocale;
}
