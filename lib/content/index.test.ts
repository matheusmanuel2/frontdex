import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { getContent, getResource, listResources, loadContent, resetContentCache } from './index';

const fixtures = path.join(process.cwd(), 'tests/fixtures/content');

afterEach(() => resetContentCache());

describe('loader', () => {
  it('lê data/ e expõe as consultas ligadas aos dados', () => {
    expect(getResource('kugiri')?.license).toBe('MIT');
    expect(listResources().every((resource) => resource.status === 'active')).toBe(true);
  });

  it('guarda o conteúdo em memória', () => {
    expect(getContent()).toBe(getContent());
  });

  it('lança com erros legíveis quando o conteúdo é inválido', () => {
    expect(() => loadContent(path.join(fixtures, 'todo-in-active/data'))).toThrow(
      /data\/resources\/exemplo\.yaml › pricing › .*draft/,
    );
  });
});
