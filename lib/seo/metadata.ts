import type { AppLocale } from '@/lib/i18n/routing';

import type { Metadata } from 'next';

export const SITE_URL = new URL(process.env.SITE_URL ?? 'https://frontdex.dev').origin;
export const SITE_NAME = 'FrontDex';

/** Locale do Open Graph (`og:locale`) por idioma do site. */
export const OG_LOCALE: Record<AppLocale, string> = { pt: 'pt_BR', en: 'en_US' };

/** URL absoluto de um caminho do site. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

type Extras = Pick<Metadata, 'robots' | 'alternates'> & {
  /** `article` nas páginas de recurso; `website` no resto. */
  ogType?: 'website' | 'article';
  /** Título só para Open Graph/Twitter (sem o sufixo do template). */
  socialTitle?: string;
};

/**
 * Metadados de uma rota localizada (spec 009): title, description, canonical,
 * hreflang pt/en/x-default e Open Graph/Twitter com URL, tipo e locale.
 * As imagens OG vêm das convenções `opengraph-image` de cada rota.
 */
export function localizedMetadata(
  locale: AppLocale,
  path: string,
  title: string,
  description: string,
  { ogType = 'website', socialTitle, ...extras }: Extras = {},
): Metadata {
  const localizedPath = (language: AppLocale) => `/${language}${path}`;
  const other: AppLocale = locale === 'pt' ? 'en' : 'pt';
  const shareTitle = socialTitle ?? `${title} · ${SITE_NAME}`;

  return {
    ...extras,
    title,
    description,
    alternates: {
      ...extras.alternates,
      canonical: localizedPath(locale),
      languages: {
        pt: localizedPath('pt'),
        en: localizedPath('en'),
        'x-default': localizedPath('pt'),
      },
    },
    openGraph: {
      type: ogType,
      siteName: SITE_NAME,
      url: localizedPath(locale),
      locale: OG_LOCALE[locale],
      alternateLocale: [OG_LOCALE[other]],
      title: shareTitle,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description,
    },
  };
}
