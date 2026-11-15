import { routing } from '@/lib/i18n/routing';
import { SITE_URL } from '@/lib/seo/metadata';
import { sitemapEntries } from '@/lib/seo/sitemap';

import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    sitemapEntries().map(({ path, lastModified }) => ({
      url: new URL(`/${locale}${path}`, SITE_URL).toString(),
      ...(lastModified ? { lastModified } : {}),
      alternates: {
        languages: {
          pt: new URL(`/pt${path}`, SITE_URL).toString(),
          en: new URL(`/en${path}`, SITE_URL).toString(),
          'x-default': new URL(`/pt${path}`, SITE_URL).toString(),
        },
      },
    })),
  );
}
