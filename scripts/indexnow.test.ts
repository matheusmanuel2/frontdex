import { describe, expect, it } from 'vitest';

import { changedPaths } from './indexnow';

describe('IndexNow', () => {
  it('converte um recurso mudado nas páginas afetadas, nos dois idiomas', () => {
    const paths = changedPaths(['data/resources/kugiri.yaml', 'README.md']);
    expect(paths).toContain('/pt/r/kugiri');
    expect(paths).toContain('/en/r/kugiri');
    expect(paths).toContain('/pt/c/animation');
    expect(paths).toContain('/en/build');
    expect(paths).not.toContain('/pt/README');
  });

  it('ignora ficheiros fora de data/', () => {
    expect(changedPaths(['components/x.tsx'])).toEqual([]);
  });
});
