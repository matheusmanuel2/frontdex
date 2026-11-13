import { describe, expect, it } from 'vitest';

import { applyFilters, parseFilters, serializeFilters, type FilterItem } from './filters';

const item = (slug: string, overrides: Partial<FilterItem> = {}): FilterItem => ({
  slug,
  name: slug,
  description: '',
  tags: [],
  pricing: 'free',
  openSource: false,
  levels: [],
  added: '2026-11-01',
  ...overrides,
});

const items = [
  item('b', { pricing: 'paid', added: '2026-11-03' }),
  item('a', { openSource: true, levels: ['beginner'], added: '2026-11-02' }),
  item('c', { pricing: 'freemium', openSource: true, added: '2026-11-04' }),
];

describe('filtros da categoria', () => {
  it('lê e escreve a URL, ignorando valores inválidos', () => {
    const filters = parseFilters(new URLSearchParams('pricing=free&oss=1&level=beginner&sort=name'));
    expect(filters).toEqual({ pricing: 'free', oss: true, level: 'beginner', sort: 'name' });
    expect(serializeFilters(filters)).toBe('?pricing=free&oss=1&level=beginner&sort=name');
    expect(parseFilters(new URLSearchParams('pricing=gratis&level=x&sort=z'))).toEqual({ oss: false, sort: 'recent' });
    expect(serializeFilters({ oss: false, sort: 'recent' })).toBe('');
  });

  it('filtra por preço, open source e nível', () => {
    expect(applyFilters(items, { pricing: 'paid', oss: false, sort: 'recent' }).map((i) => i.slug)).toEqual(['b']);
    expect(applyFilters(items, { oss: true, sort: 'recent' }).map((i) => i.slug)).toEqual(['c', 'a']);
    expect(applyFilters(items, { level: 'beginner', oss: false, sort: 'recent' }).map((i) => i.slug)).toEqual(['a']);
  });

  it('ordena por recentes ou por nome', () => {
    expect(applyFilters(items, { oss: false, sort: 'recent' }).map((i) => i.slug)).toEqual(['c', 'b', 'a']);
    expect(applyFilters(items, { oss: false, sort: 'name' }).map((i) => i.slug)).toEqual(['a', 'b', 'c']);
  });
});
