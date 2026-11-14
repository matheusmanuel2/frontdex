import { listAreas, listCategories, listCollections, listResources } from '@/lib/content';
import { routing } from '@/lib/i18n/routing';
import { SITE_URL } from '@/lib/seo/metadata';

import type { MetadataRoute } from 'next';

const paths = [
  '',
  ...listAreas().map((area) => `/${area.slug}`),
  ...listCategories().map((category) => `/c/${category.slug}`),
  ...listResources().map((resource) => `/r/${resource.slug}`),
  '/collections',
  ...listCollections().map((collection) => `/collections/${collection.slug}`),
  '/new',
  '/random',
  '/add',
  '/about',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: new URL(`/${locale}${path}`, SITE_URL).toString(),
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
