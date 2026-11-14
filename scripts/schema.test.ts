import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { buildJsonSchema, SCHEMA_PATH } from './schema';

describe('pnpm schema', () => {
  const schema = JSON.parse(buildJsonSchema());

  it('data/schema.json está atualizado', () => {
    expect(readFileSync(SCHEMA_PATH, 'utf8')).toBe(buildJsonSchema());
  });

  it('expõe os campos obrigatórios da spec 001', () => {
    expect(schema.required).toEqual(
      expect.arrayContaining([
        'name',
        'url',
        'area',
        'category',
        'tags',
        'pricing',
        'open_source',
        'description',
        'added',
        'last_checked',
        'status',
      ]),
    );
  });

  it('dá autocomplete com as categorias e tags de data/', () => {
    expect(schema.properties.category.enum).toContain('animation');
    expect(schema.properties.tags.items.enum).toContain('react');
  });

  it('limita a descrição a 40–160 caracteres', () => {
    const variants = schema.properties.description.properties.pt.anyOf;
    expect(variants).toContainEqual({ type: 'string', minLength: 40, maxLength: 160 });
  });
});

describe('data/schema.json no editor', () => {
  it('aceita todos os recursos do seed (sem erros falsos no VS Code)', async () => {
    const { default: Ajv } = await import('ajv');
    const { default: addFormats } = await import('ajv-formats');
    const { readdirSync } = await import('node:fs');
    const path = await import('node:path');
    const { parse } = await import('yaml');

    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    const validate = ajv.compile(JSON.parse(readFileSync(SCHEMA_PATH, 'utf8')));
    const dir = path.join(process.cwd(), 'data/resources');

    for (const file of readdirSync(dir).filter((name) => name.endsWith('.yaml'))) {
      // O yaml-language-server lê datas sem aspas como string (YAML 1.2 core).
      const data = parse(readFileSync(path.join(dir, file), 'utf8'), { schema: 'core' });
      expect({ file, ok: validate(data), errors: validate.errors }).toMatchObject({ file, ok: true });
    }
  });

  it('marca erro num YAML novo com valores errados', async () => {
    const { default: Ajv } = await import('ajv');
    const { default: addFormats } = await import('ajv-formats');
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    const validate = ajv.compile(JSON.parse(readFileSync(SCHEMA_PATH, 'utf8')));
    expect(validate({ name: 'Novo', url: 'http://novo.dev', area: 'design', tags: ['nao-existe'] })).toBe(false);
  });
});
