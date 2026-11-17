import { describe, expect, it } from 'vitest';

import { PAGE_SIZE, pageCount, pageItems, pagePath, pageWindow } from './paging';

import type { FilterItem } from './filters';

const item = (n: number): FilterItem => ({
  slug: `r${n}`,
  name: `R${String(n).padStart(3, '0')}`,
  description: '',
  tags: [],
  pricing: 'free',
  openSource: false,
  added: `2026-01-${String((n % 28) + 1).padStart(2, '0')}`,
});

describe('paginação da categoria', () => {
  it('conta páginas de 30, com mínimo de 1', () => {
    expect(pageCount(0)).toBe(1);
    expect(pageCount(30)).toBe(1);
    expect(pageCount(31)).toBe(2);
    expect(pageCount(394)).toBe(14);
  });

  it('corta a página na ordem "Mais recentes" e não repete itens entre páginas', () => {
    const items = Array.from({ length: 70 }, (_, i) => item(i));
    const pages = [1, 2, 3].map((p) => pageItems(items, p));
    expect(pages.map((p) => p.length)).toEqual([PAGE_SIZE, PAGE_SIZE, 10]);
    expect(new Set(pages.flat().map((i) => i.slug)).size).toBe(70);
    expect(pages[0]![0]!.added >= pages[2]![9]!.added).toBe(true);
  });

  it('a página 1 é a raiz da categoria', () => {
    expect(pagePath('/pt/c/icons', 1)).toBe('/pt/c/icons');
    expect(pagePath('/pt/c/icons', 3)).toBe('/pt/c/icons/p/3');
  });

  it('mostra primeira, última e vizinhas, com saltos', () => {
    expect(pageWindow(1, 1)).toEqual([1]);
    expect(pageWindow(1, 8)).toEqual([1, 2, null, 8]);
    expect(pageWindow(5, 8)).toEqual([1, null, 4, 5, 6, null, 8]);
    expect(pageWindow(8, 8)).toEqual([1, null, 7, 8]);
  });
});
