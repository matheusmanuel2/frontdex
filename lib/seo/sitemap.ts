import { pageCount } from '@/components/category/paging';
import {
  getCollectionResources,
  listAreas,
  listCategories,
  listCollections,
  listResources,
  type Resource,
} from '@/lib/content';

/**
 * Sitemap (spec 009 §2). Só páginas indexáveis: sem /search, /random nem recursos arquivados.
 * `lastmod` é real: a data de verificação mais recente dos recursos que a página mostra.
 * Páginas sem data própria nos YAML (Sobre, Contribuir) vão sem `lastmod`.
 */
export type SitemapEntry = { path: string; lastModified?: string };

function latest(resources: Resource[]): string | undefined {
  return resources.reduce<string | undefined>(
    (max, resource) => (!max || resource.last_checked > max ? resource.last_checked : max),
    undefined,
  );
}

export function sitemapEntries(): SitemapEntry[] {
  const all = listResources();
  return [
    { path: '', lastModified: latest(all) },
    ...listAreas().map((area) => ({ path: `/${area.slug}`, lastModified: latest(listResources({ area: area.slug })) })),
    ...listCategories().flatMap((category) => {
      const resources = listResources({ category: category.slug });
      const lastModified = latest(resources);
      const pages = pageCount(resources.length);
      return Array.from({ length: pages }, (_, i) => ({
        path: i === 0 ? `/c/${category.slug}` : `/c/${category.slug}/p/${i + 1}`,
        lastModified,
      }));
    }),
    ...all.map((resource) => ({ path: `/r/${resource.slug}`, lastModified: resource.last_checked })),
    { path: '/collections', lastModified: latest(listCollections().flatMap((c) => getCollectionResources(c.slug))) },
    ...listCollections().map((collection) => ({
      path: `/collections/${collection.slug}`,
      lastModified: latest(getCollectionResources(collection.slug)),
    })),
    { path: '/new', lastModified: latest(all) },
    { path: '/add' },
    { path: '/about' },
  ];
}
