import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { readRawContent } from './read';
import { formatError, normalizeUrl, validateContent } from './validate';

const fixtures = path.join(process.cwd(), 'tests/fixtures/content');
const run = (name: string) => validateContent(readRawContent(path.join(fixtures, name, 'data')));

describe('validateContent', () => {
  it('o fixture válido não tem erros', () => {
    const { errors, content } = run('valid');
    expect(errors).toEqual([]);
    expect(content.resources.map((resource) => resource.slug)).toEqual(['exemplo', 'outro']);
  });

  // Uma regra da spec 001 por fixture: [pasta, campo, motivo esperado].
  it.each([
    ['schema-invalid', 'pricing', /tem de ser free, freemium, paid/],
    ['yaml-syntax', '', /YAML inválido/],
    ['duplicate-url', 'url', /URL repetida/],
    ['unknown-category', 'category', /não existe em data\/categories\.yaml/],
    ['category-wrong-area', 'category', /pertence à área "discover"/],
    ['unknown-tag', 'tags.1', /tag "vue" não existe/],
    ['broken-alternative', 'alternatives.0', /"nao-existe" não existe/],
    ['description-length', 'description.pt', /entre 40 e 160/],
    ['todo-in-active', 'pricing', /só é permitido em recursos com status: draft/],
    ['duplicate-id', 'id', /id 1 repetido/],
    ['collection-broken-resource', 'resources.1', /"nao-existe" não existe/],
    ['bad-filename', '', /nome de ficheiro inválido: "Meu_Recurso"/],
    ['bad-extension', '', /extensão inválida/],
    ['invalid-date', 'added', /data inexistente/],
  ])('%s falha em %s', (fixture, field, message) => {
    const { errors } = run(fixture);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.field).toBe(field);
    expect(errors[0]?.message).toMatch(message);
  });

  it('formata os erros como ficheiro › campo › motivo', () => {
    const [error] = run('unknown-tag').errors;
    expect(error && formatError(error)).toBe(
      'data/resources/exemplo.yaml › tags.1 › tag "vue" não existe em data/tags.yaml',
    );
  });
});

describe('normalizeUrl', () => {
  it('ignora www, maiúsculas no host e barra final', () => {
    expect(normalizeUrl('https://WWW.Exemplo.dev/')).toBe(normalizeUrl('https://exemplo.dev'));
    expect(normalizeUrl('https://exemplo.dev/a')).not.toBe(normalizeUrl('https://exemplo.dev/b'));
  });
});

describe('referências a recursos inválidos', () => {
  it('não somam um segundo erro "não existe"', () => {
    const { errors } = run('schema-invalid');
    expect(errors.every((error) => !/não existe em data\/resources/.test(error.message))).toBe(true);
  });
});
