import { describe, expect, it } from 'vitest';

import { contrast, contrastTable, readThemes, resolveColor } from './contrast';

describe('contraste dos tokens', () => {
  it('todas as combinações usadas passam AA nos dois temas', () => {
    const failing = contrastTable().filter((row) => !row.pass);
    expect(failing.map((row) => `${row.theme} ${row.text}/${row.background} ${row.ratio.toFixed(2)}`)).toEqual([]);
  });

  it('resolve var() e calcula a razão WCAG', () => {
    const { dark } = readThemes();
    expect(resolveColor(dark, 'link')).toEqual([0x5b, 0x97, 0xff]);
    expect(contrast([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5);
  });

  it('o tema light herda os tokens que não redefine', () => {
    const { light } = readThemes();
    expect(light['color-ink-hero']).toBe('#0d0d0f');
  });
});
