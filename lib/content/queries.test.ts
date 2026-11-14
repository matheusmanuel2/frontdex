import { describe, expect, it } from 'vitest';

import {
  getAlternatives,
  getArea,
  getCategory,
  getCollection,
  getCollectionResources,
  getResource,
  listAreas,
  listCategories,
  listCollections,
  listNew,
  listResources,
} from './queries';

import type { Collection, Resource } from './schema';
import type { Content } from './validate';

function resource(slug: string, overrides: Partial<Resource> = {}): Resource {
  return {
    slug,
    name: slug,
    url: `https://${slug}.dev`,
    area: 'build',
    category: 'animation',
    tags: ['motion'],
    pricing: 'free',
    open_source: true,
    description: { pt: 'x'.repeat(40), en: 'x'.repeat(40) },
    added: '2026-11-01',
    last_checked: '2026-11-01',
    status: 'active',
    ...overrides,
  };
}

function collection(slug: string, overrides: Partial<Collection> = {}): Collection {
  return {
    slug,
    title: { pt: slug, en: slug },
    text: { pt: 'texto', en: 'text' },
    resources: [],
    status: 'active',
    ...overrides,
  };
}

const content: Content = {
  areas: [
    { slug: 'discover', name: { pt: 'Descobrir', en: 'Discover' }, description: { pt: 'a', en: 'a' } },
    { slug: 'build', name: { pt: 'Construir', en: 'Build' }, description: { pt: 'b', en: 'b' } },
  ],
  categories: [
    { slug: 'ui-inspiration', area: 'discover', name: { pt: 'Inspiração', en: 'Inspiration' } },
    { slug: 'animation', area: 'build', name: { pt: 'Animação', en: 'Animation' } },
    { slug: 'icons', area: 'build', name: { pt: 'Ícones', en: 'Icons' } },
  ],
  tags: ['motion', 'react', 'screens'],
  resources: [
    resource('alpha', { added: '2026-11-10', tags: ['motion', 'react'], alternatives: ['beta', 'rascunho', 'gama'] }),
    resource('beta', { added: '2026-11-12' }),
    resource('gama', { added: '2026-10-01', area: 'discover', category: 'ui-inspiration', tags: ['screens'] }),
    resource('rascunho', { status: 'draft', added: '2026-11-13' }),
    resource('arquivado', { status: 'archived' }),
    resource('aaa', { added: '2026-11-12' }),
  ],
  collections: [
    collection('publicada', { resources: ['gama', 'rascunho', 'alpha'] }),
    collection('por-fazer', { status: 'draft' }),
  ],
};

const slugs = (list: { slug: string }[]) => list.map((item) => item.slug);

describe('listResources', () => {
  it('só devolve active por omissão, do mais recente para o mais antigo (desempate por nome)', () => {
    expect(slugs(listResources(content))).toEqual(['aaa', 'beta', 'alpha', 'gama']);
  });

  it('filtra por área, categoria e tag', () => {
    expect(slugs(listResources(content, { area: 'discover' }))).toEqual(['gama']);
    expect(slugs(listResources(content, { category: 'animation' }))).toEqual(['aaa', 'beta', 'alpha']);
    expect(slugs(listResources(content, { tag: 'react' }))).toEqual(['alpha']);
    expect(slugs(listResources(content, { area: 'build', tag: 'screens' }))).toEqual([]);
  });

  it('filtra por status ou devolve todos', () => {
    expect(slugs(listResources(content, { status: 'draft' }))).toEqual(['rascunho']);
    expect(listResources(content, { status: 'all' })).toHaveLength(6);
  });

  it('não altera o conteúdo recebido', () => {
    const before = slugs(content.resources);
    listResources(content);
    expect(slugs(content.resources)).toEqual(before);
  });
});

describe('getResource', () => {
  it('devolve o recurso ativo', () => {
    expect(getResource(content, 'alpha')?.name).toBe('alpha');
  });

  it('não devolve draft, archived nem slugs inexistentes', () => {
    expect(getResource(content, 'rascunho')).toBeUndefined();
    expect(getResource(content, 'arquivado')).toBeUndefined();
    expect(getResource(content, 'nada')).toBeUndefined();
  });
});

describe('getAlternatives', () => {
  it('devolve as alternativas ativas pela ordem do YAML', () => {
    expect(slugs(getAlternatives(content, 'alpha'))).toEqual(['beta', 'gama']);
  });

  it('devolve lista vazia sem alternativas ou recurso', () => {
    expect(getAlternatives(content, 'beta')).toEqual([]);
    expect(getAlternatives(content, 'nada')).toEqual([]);
  });
});

describe('listNew', () => {
  it('devolve os ativos a partir de uma data, inclusive', () => {
    expect(slugs(listNew(content, { since: '2026-11-10' }))).toEqual(['aaa', 'beta', 'alpha']);
  });

  it('sem data devolve todos os ativos', () => {
    expect(listNew(content)).toHaveLength(4);
  });
});

describe('áreas e categorias', () => {
  it('getArea e listAreas', () => {
    expect(getArea(content, 'build')?.name.pt).toBe('Construir');
    expect(getArea(content, 'grow')).toBeUndefined();
    expect(slugs(listAreas(content))).toEqual(['discover', 'build']);
  });

  it('getCategory e listCategories pela ordem do ficheiro', () => {
    expect(getCategory(content, 'icons')?.area).toBe('build');
    expect(getCategory(content, 'nada')).toBeUndefined();
    expect(slugs(listCategories(content))).toEqual(['ui-inspiration', 'animation', 'icons']);
    expect(slugs(listCategories(content, 'build'))).toEqual(['animation', 'icons']);
  });
});

describe('coleções', () => {
  it('só publica coleções active', () => {
    expect(slugs(listCollections(content))).toEqual(['publicada']);
    expect(slugs(listCollections(content, { includeDrafts: true }))).toEqual(['publicada', 'por-fazer']);
    expect(getCollection(content, 'por-fazer')).toBeUndefined();
  });

  it('devolve os recursos ativos pela ordem do curador', () => {
    expect(slugs(getCollectionResources(content, 'publicada'))).toEqual(['gama', 'alpha']);
    expect(getCollectionResources(content, 'por-fazer')).toEqual([]);
  });
});
