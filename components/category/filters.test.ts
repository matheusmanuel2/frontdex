import { describe, expect, it } from 'vitest';

import { applyFilters, parseFilters, serializeFilters, type FilterItem } from './filters';

const item = (slug: string, overrides: Partial<FilterItem> = {}): FilterItem => ({
  slug,
  name: slug,
  description: '',
  tags: [],
  pricing: 'free',
  openSource: false,
  added: '2026-11-01',
  ...overrides,
});

const items = [
  item('b', { pricing: 'paid', added: '2026-11-03' }),
  item('a', { added: '2026-11-02' }),
  item('c', { pricing: 'freemium', added: '2026-11-04' }),
];

describe('filtros da categoria', () => {
  it('lê e escreve a URL, ignorando valores inválidos e filtros removidos', () => {
    const filters = parseFilters(new URLSearchParams('pricing=free&sort=name'));
    expect(filters).toEqual({ pricing: 'free', sort: 'name' });
    expect(serializeFilters(filters)).toBe('?pricing=free&sort=name');
    expect(parseFilters(new URLSearchParams('pricing=gratis&oss=1&level=beginner&sort=z'))).toEqual({
      sort: 'recent',
    });
    expect(serializeFilters({ sort: 'recent' })).toBe('');
  });

  it('filtra por preço', () => {
    expect(applyFilters(items, { pricing: 'paid', sort: 'recent' }).map((i) => i.slug)).toEqual(['b']);
  });

  it('ordena por recentes ou por nome', () => {
    expect(applyFilters(items, { sort: 'recent' }).map((i) => i.slug)).toEqual(['c', 'b', 'a']);
    expect(applyFilters(items, { sort: 'name' }).map((i) => i.slug)).toEqual(['a', 'b', 'c']);
  });
});
