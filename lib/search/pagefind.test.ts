import { describe, expect, it } from 'vitest';

import { pageUrl } from './pagefind';

describe('pageUrl', () => {
  it('tira a extensão .html do caminho gerado', () => {
    expect(pageUrl('/pt/r/kugiri.html')).toBe('/pt/r/kugiri');
    expect(pageUrl('/en/c/icons.html')).toBe('/en/c/icons');
    expect(pageUrl('/pt/index.html')).toBe('/pt');
    expect(pageUrl('/_next/static/pt/r/calligraph.html')).toBe('/pt/r/calligraph');
  });
});
