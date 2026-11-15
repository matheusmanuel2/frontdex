/**
 * Dados estruturados schema.org (spec 009 §5). Só marcamos o que está visível na página:
 * nada de SearchAction, FAQ ou rich results que o Google já não mostra para este tipo de site.
 */
import { GITHUB_URL } from '@/components/site/nav';
import type { Resource } from '@/lib/content';
import { HTML_LANG, type AppLocale } from '@/lib/i18n/routing';

import { SITE_NAME, absoluteUrl } from './metadata';

type Node = Record<string, unknown>;
export type JsonLdGraph = { '@context': 'https://schema.org'; '@graph': Node[] };

const ORGANIZATION_ID = absoluteUrl('/#organization');
const WEBSITE_ID = absoluteUrl('/#website');

export function graph(...nodes: Node[]): JsonLdGraph {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

export function organizationNode(): Node {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: absoluteUrl('/'),
    logo: { '@type': 'ImageObject', url: absoluteUrl('/icon-512.png'), width: 512, height: 512 },
    sameAs: [GITHUB_URL],
  };
}

export function websiteNode(locale: AppLocale, description: string): Node {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: absoluteUrl(`/${locale}`),
    description,
    inLanguage: ['pt-BR', 'en'],
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbNode(path: string, crumbs: Crumb[]): Node {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(path)}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

type PageInput = { locale: AppLocale; path: string; name: string; description: string };

function pageBase({ locale, path, name, description }: PageInput, type: string, withBreadcrumb: boolean): Node {
  return {
    '@type': type,
    '@id': absoluteUrl(path),
    url: absoluteUrl(path),
    name,
    description,
    inLanguage: HTML_LANG[locale],
    isPartOf: { '@id': WEBSITE_ID },
    ...(withBreadcrumb ? { breadcrumb: { '@id': `${absoluteUrl(path)}#breadcrumb` } } : {}),
  };
}

/** Hubs (área, categoria, coleção): CollectionPage com a lista de recursos visível. */
export function collectionPageNode(page: PageInput, items: Crumb[]): Node {
  return {
    ...pageBase(page, 'CollectionPage', true),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
  };
}

/** Páginas simples (Sobre, Contribuir, Novos…). */
export function webPageNode(page: PageInput, type: 'WebPage' | 'AboutPage' = 'WebPage'): Node {
  return pageBase(page, type, true);
}

const SOFTWARE_CATEGORIES = new Set(['ui-components', 'animation', 'charts', 'dev-tools', 'ai-tools', 'icons']);

/** Tipo schema.org do recurso, pela categoria (spec 009 §5). */
export function resourceType(category: string): 'SoftwareApplication' | 'Course' | 'Book' | 'CreativeWork' {
  if (SOFTWARE_CATEGORIES.has(category)) return 'SoftwareApplication';
  if (category === 'courses') return 'Course';
  if (category === 'books') return 'Book';
  return 'CreativeWork';
}

/** Página de recurso: WebPage nossa (datas de entrada/verificação) com o recurso como mainEntity. */
export function resourcePageNode(resource: Resource, page: PageInput): Node {
  const type = resourceType(resource.category);
  const free = resource.pricing === 'free' ? true : resource.pricing === 'paid' ? false : undefined;
  const mainEntity: Node = {
    '@type': type,
    name: resource.name,
    url: resource.url,
    description: resource.description[page.locale],
    ...(type === 'SoftwareApplication' ? { applicationCategory: 'DeveloperApplication' } : {}),
    ...(resource.author ? { author: resource.author } : {}),
    ...(resource.license ? { license: resource.license } : {}),
    ...(free !== undefined ? { isAccessibleForFree: free } : {}),
    ...(resource.repo ? { sameAs: [resource.repo] } : {}),
    ...(resource.tags.length > 0 ? { keywords: resource.tags.join(', ') } : {}),
  };
  return {
    ...pageBase(page, 'WebPage', true),
    datePublished: resource.added,
    dateModified: resource.last_checked,
    mainEntity,
  };
}

/** Serializa para um <script type="application/ld+json"> sem quebrar o HTML. */
export function serializeJsonLd(data: JsonLdGraph): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
