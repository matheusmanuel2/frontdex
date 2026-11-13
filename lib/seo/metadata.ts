import type { AppLocale } from '@/lib/i18n/routing';

import type { Metadata } from 'next';

export const SITE_URL = new URL(process.env.SITE_URL ?? 'https://frontdex.dev').origin;

export function localizedMetadata(
  locale: AppLocale,
  path: string,
  title: string,
  description: string,
  extras: Pick<Metadata, 'robots' | 'alternates'> = {},
): Metadata {
  const localizedPath = (language: AppLocale) => `/${language}${path}`;

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
  };
}
