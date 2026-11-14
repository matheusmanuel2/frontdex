import { describe, expect, it } from 'vitest';

import { readRawContent } from './read';
import { validateContent } from './validate';

// T-202: o seed em data/ tem de passar o schema sem mudar valores.
describe('seed de data/', () => {
  const { content, errors } = validateContent(readRawContent());

  it('não tem erros', () => {
    expect(errors).toEqual([]);
  });

  it('os 8 recursos ativos do seed passam como active', () => {
    const active = content.resources
      .filter((resource) => resource.status === 'active')
      .map((resource) => resource.slug);
    expect(active).toEqual(
      expect.arrayContaining(['calligraph', 'cmux', 'kugiri', 'mobbin', 'refero', 'screensdesign', 'shaper', 'termui']),
    );
  });

  it('os recursos com TODO passam como draft', () => {
    for (const slug of [
      '60fps-design',
      'abtest-design',
      'agent-memory',
      'appkittie',
      'appllama',
      'appshots',
      'glass',
      'morphrig',
    ]) {
      expect(content.resources.find((resource) => resource.slug === slug)?.status).toBe('draft');
    }
  });
});
