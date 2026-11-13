/**
 * Ponto de entrada do conteúdo para o site. Lê `data/` uma vez por processo
 * (cache em memória durante o build) e expõe as consultas já ligadas aos dados.
 *
 * O site nunca lê YAML diretamente: importa só daqui.
 */
import * as queries from './queries';
import { DEFAULT_DATA_DIR, readRawContent } from './read';
import { formatError, validateContent, type Content } from './validate';

import type { AreaSlug } from './schema';

export * from './schema';
export type { Content, ContentError } from './validate';
export type { ResourceFilter } from './queries';

let cache: Content | undefined;

/** Lê e valida `data/`. Lança se o conteúdo tiver erros: o build não publica conteúdo inválido. */
export function loadContent(dataDir: string = DEFAULT_DATA_DIR): Content {
  const { content, errors } = validateContent(readRawContent(dataDir));
  if (errors.length > 0) {
    throw new Error(`Conteúdo inválido em data/ (corre pnpm validate):\n${errors.map(formatError).join('\n')}`);
  }
  return content;
}

export function getContent(): Content {
  // Em `next dev` relê sempre, para as edições aos YAML aparecerem sem reiniciar.
  if (process.env.NODE_ENV === 'development') return loadContent();
  cache ??= loadContent();
  return cache;
}

/** Só para testes. */
export function resetContentCache(): void {
  cache = undefined;
}

export const getResource = (slug: string) => queries.getResource(getContent(), slug);
export const listResources = (filter?: queries.ResourceFilter) => queries.listResources(getContent(), filter);
export const getAlternatives = (slug: string) => queries.getAlternatives(getContent(), slug);
export const listNew = (options?: { since?: string }) => queries.listNew(getContent(), options);
export const getArea = (slug: string) => queries.getArea(getContent(), slug);
export const listAreas = () => queries.listAreas(getContent());
export const getCategory = (slug: string) => queries.getCategory(getContent(), slug);
export const listCategories = (area?: AreaSlug) => queries.listCategories(getContent(), area);
export const listCollections = (options?: { includeDrafts?: boolean }) =>
  queries.listCollections(getContent(), options);
export const getCollection = (slug: string) => queries.getCollection(getContent(), slug);
export const getCollectionResources = (slug: string) => queries.getCollectionResources(getContent(), slug);
export { resourceToYaml } from './yaml';
export { AREA_NUMBER } from './labels';
