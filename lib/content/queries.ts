/**
 * Consultas puras sobre o conteúdo já validado. Não leem ficheiros: recebem `Content`.
 * Por omissão só devolvem o que é publicado (`status: active`).
 */
import type { AreaSlug, Category, Collection, Resource, ResourceStatus, Area } from './schema';
import type { Content } from './validate';

export type ResourceFilter = {
  area?: AreaSlug;
  category?: string;
  tag?: string;
  /** Por omissão `active`. Passa `'all'` para todos os estados. */
  status?: ResourceStatus | 'all';
};

/** Ordem estável: mais recente primeiro, depois por nome. */
function byAddedDescThenName(a: Resource, b: Resource): number {
  if (a.added !== b.added) return a.added < b.added ? 1 : -1;
  return a.name.localeCompare(b.name, 'en');
}

export function listResources(content: Content, filter: ResourceFilter = {}): Resource[] {
  const status = filter.status ?? 'active';
  return content.resources
    .filter((resource) => status === 'all' || resource.status === status)
    .filter((resource) => !filter.area || resource.area === filter.area)
    .filter((resource) => !filter.category || resource.category === filter.category)
    .filter((resource) => !filter.tag || resource.tags.includes(filter.tag))
    .sort(byAddedDescThenName);
}

/** Recurso publicado pelo slug. Recursos `draft` e `archived` não existem para o site. */
export function getResource(content: Content, slug: string): Resource | undefined {
  return content.resources.find((resource) => resource.slug === slug && resource.status === 'active');
}

/** Alternativas publicadas de um recurso, pela ordem do YAML. */
export function getAlternatives(content: Content, slug: string): Resource[] {
  const resource = getResource(content, slug);
  if (!resource?.alternatives) return [];
  return resource.alternatives
    .map((alternative) => getResource(content, alternative))
    .filter((alternative): alternative is Resource => alternative !== undefined);
}

/** Recursos publicados com `added` igual ou posterior a `since` (YYYY-MM-DD). */
export function listNew(content: Content, { since }: { since?: string } = {}): Resource[] {
  return listResources(content).filter((resource) => !since || resource.added >= since);
}

export function getArea(content: Content, slug: string): Area | undefined {
  return content.areas.find((area) => area.slug === slug);
}

export function listAreas(content: Content): Area[] {
  return [...content.areas];
}

export function getCategory(content: Content, slug: string): Category | undefined {
  return content.categories.find((category) => category.slug === slug);
}

/** Categorias pela ordem de `data/categories.yaml`; com `area`, só as dessa área. */
export function listCategories(content: Content, area?: AreaSlug): Category[] {
  return content.categories.filter((category) => !area || category.area === area);
}

/** Coleções publicadas. Com `includeDrafts`, todas. */
export function listCollections(content: Content, { includeDrafts = false } = {}): Collection[] {
  return content.collections.filter((collection) => includeDrafts || collection.status === 'active');
}

export function getCollection(content: Content, slug: string): Collection | undefined {
  return listCollections(content).find((collection) => collection.slug === slug);
}

/** Recursos publicados de uma coleção, pela ordem do curador. */
export function getCollectionResources(content: Content, slug: string): Resource[] {
  const collection = getCollection(content, slug);
  if (!collection) return [];
  return collection.resources
    .map((resourceSlug) => getResource(content, resourceSlug))
    .filter((resource): resource is Resource => resource !== undefined);
}
