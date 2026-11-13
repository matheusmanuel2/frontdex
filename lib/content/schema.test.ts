import { describe, expect, it } from 'vitest';

import { areaSchema, categorySchema, collectionSchema, findTodoPaths, resourceSchema, tagSchema } from './schema';

const valid = {
  name: 'Exemplo',
  url: 'https://exemplo.dev',
  area: 'build',
  category: 'animation',
  tags: ['react', 'motion'],
  pricing: 'free',
  open_source: true,
  description: {
    pt: 'Componente de exemplo com quarenta caracteres ou mais.',
    en: 'Example component with forty characters or more here.',
  },
  added: '2026-11-12',
  last_checked: '2026-11-12',
  status: 'active',
};

function issues(input: unknown) {
  const result = resourceSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
}

describe('resourceSchema', () => {
  it('aceita um recurso ativo completo', () => {
    expect(issues(valid)).toEqual([]);
  });

  it('aceita os campos opcionais', () => {
    expect(
      issues({
        ...valid,
        id: 2,
        repo: 'https://github.com/exemplo/exemplo',
        author: 'Pessoa',
        license: 'MIT',
        level: ['beginner', 'expert'],
        why: { pt: 'Porque sim.', en: 'Because.' },
        alternatives: ['outro'],
        notes: 'nota interna',
      }),
    ).toEqual([]);
  });

  it('aceita datas que o YAML devolve como Date', () => {
    const result = resourceSchema.parse({ ...valid, added: new Date('2026-11-12T00:00:00Z') });
    expect(result.added).toBe('2026-11-12');
  });

  it.each([
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
  ])('exige %s', (field) => {
    const input: Record<string, unknown> = { ...valid };
    delete input[field];
    expect(issues(input).some((issue) => issue.startsWith(field))).toBe(true);
  });

  it('id é inteiro positivo', () => {
    expect(issues({ ...valid, id: 1.5 })).not.toEqual([]);
    expect(issues({ ...valid, id: 0 })).not.toEqual([]);
  });

  it('url tem de ser https', () => {
    expect(issues({ ...valid, url: 'http://exemplo.dev' })).not.toEqual([]);
    expect(issues({ ...valid, url: 'exemplo.dev' })).not.toEqual([]);
  });

  it('area só aceita as quatro áreas', () => {
    expect(issues({ ...valid, area: 'design' })).not.toEqual([]);
  });

  it('category e tags são slugs', () => {
    expect(issues({ ...valid, category: 'UI Components' })).not.toEqual([]);
    expect(issues({ ...valid, tags: ['React'] })).not.toEqual([]);
  });

  it('tags: entre 1 e 6, sem repetidas', () => {
    expect(issues({ ...valid, tags: [] })).not.toEqual([]);
    expect(issues({ ...valid, tags: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] })).not.toEqual([]);
    expect(issues({ ...valid, tags: ['a', 'b', 'c', 'd', 'e', 'f'] })).toEqual([]);
    expect(issues({ ...valid, tags: ['react', 'react'] })).not.toEqual([]);
  });

  it('pricing só aceita free, freemium e paid', () => {
    expect(issues({ ...valid, pricing: 'freemium' })).toEqual([]);
    expect(issues({ ...valid, pricing: 'gratis' })).not.toEqual([]);
  });

  it('open_source é booleano', () => {
    expect(issues({ ...valid, open_source: 'yes' })).not.toEqual([]);
  });

  it('level só aceita beginner, intermediate e expert', () => {
    expect(issues({ ...valid, level: ['senior'] })).not.toEqual([]);
  });

  it('descrição tem entre 40 e 160 caracteres em cada idioma', () => {
    expect(issues({ ...valid, description: { ...valid.description, pt: 'curta' } })[0]).toMatch(/^description\.pt/);
    expect(issues({ ...valid, description: { ...valid.description, en: 'x'.repeat(161) } })[0]).toMatch(
      /^description\.en/,
    );
    expect(issues({ ...valid, description: { pt: 'x'.repeat(40), en: 'x'.repeat(160) } })).toEqual([]);
  });

  it('descrição exige pt e en', () => {
    expect(issues({ ...valid, description: { pt: valid.description.pt } })).not.toEqual([]);
  });

  it('why tem no máximo 160 caracteres', () => {
    expect(issues({ ...valid, why: { pt: 'x'.repeat(161), en: 'ok' } })).not.toEqual([]);
    expect(issues({ ...valid, why: { pt: 'x'.repeat(160) } })).toEqual([]);
  });

  it('datas no formato YYYY-MM-DD', () => {
    expect(issues({ ...valid, added: '12/11/2026' })).not.toEqual([]);
    expect(issues({ ...valid, last_checked: '2026-13-40' })).not.toEqual([]);
  });

  it('status só aceita active, draft e archived', () => {
    expect(issues({ ...valid, status: 'archived' })).toEqual([]);
    expect(issues({ ...valid, status: 'published' })).not.toEqual([]);
  });

  it('rejeita campos desconhecidos', () => {
    expect(issues({ ...valid, price: 'free' })).not.toEqual([]);
  });

  describe('TODO', () => {
    const draft = {
      ...valid,
      pricing: 'TODO',
      open_source: 'TODO',
      description: { pt: 'TODO', en: 'TODO' },
      status: 'draft',
    };

    it('é aceite em draft', () => {
      expect(issues(draft)).toEqual([]);
    });

    it('falha em active', () => {
      const result = issues({ ...draft, status: 'active' });
      expect(result).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^pricing: .*draft/),
          expect.stringMatching(/^open_source: .*draft/),
          expect.stringMatching(/^description\.pt: .*draft/),
          expect.stringMatching(/^description\.en: .*draft/),
        ]),
      );
    });

    it('falha em archived', () => {
      expect(issues({ ...draft, status: 'archived' })).not.toEqual([]);
    });

    it('em notes não conta', () => {
      expect(issues({ ...valid, notes: 'TODO confirmar a licença' })).toEqual([]);
    });
  });
});

describe('findTodoPaths', () => {
  it('encontra TODO em qualquer profundidade', () => {
    expect(findTodoPaths({ a: 'TODO', b: { c: ['ok', 'TODO — falta'] } })).toEqual([['a'], ['b', 'c', 1]]);
  });
});

describe('areaSchema', () => {
  it('exige nome e descrição em pt e en', () => {
    const area = { slug: 'build', name: { pt: 'Construir', en: 'Build' }, description: { pt: 'a', en: 'b' } };
    expect(areaSchema.safeParse(area).success).toBe(true);
    expect(areaSchema.safeParse({ ...area, description: { pt: 'a' } }).success).toBe(false);
    expect(areaSchema.safeParse({ ...area, slug: 'design' }).success).toBe(false);
  });
});

describe('categorySchema', () => {
  it('exige slug, área e nome em pt e en; descrição opcional', () => {
    const category = { slug: 'icons', area: 'build', name: { pt: 'Ícones', en: 'Icons' } };
    expect(categorySchema.safeParse(category).success).toBe(true);
    expect(categorySchema.safeParse({ ...category, description: { pt: 'a', en: 'b' } }).success).toBe(true);
    expect(categorySchema.safeParse({ ...category, area: 'other' }).success).toBe(false);
    expect(categorySchema.safeParse({ ...category, name: { pt: 'Ícones' } }).success).toBe(false);
  });
});

describe('tagSchema', () => {
  it('é um slug', () => {
    expect(tagSchema.safeParse('ai-agents').success).toBe(true);
    expect(tagSchema.safeParse('AI Agents').success).toBe(false);
  });
});

describe('collectionSchema', () => {
  const collection = {
    title: { pt: 'Título', en: 'Title' },
    text: { pt: 'Texto do curador.', en: 'Curator note.' },
    resources: ['kugiri', 'calligraph'],
    status: 'active',
  };

  it('aceita uma coleção completa', () => {
    expect(collectionSchema.safeParse(collection).success).toBe(true);
  });

  it('rejeita recursos repetidos', () => {
    expect(collectionSchema.safeParse({ ...collection, resources: ['kugiri', 'kugiri'] }).success).toBe(false);
  });

  it('TODO só em draft', () => {
    const withTodo = { ...collection, text: { pt: 'TODO — texto', en: 'TODO — text' } };
    expect(collectionSchema.safeParse(withTodo).success).toBe(false);
    expect(collectionSchema.safeParse({ ...withTodo, status: 'draft' }).success).toBe(true);
  });
});
