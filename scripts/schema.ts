/**
 * `pnpm schema` — gera data/schema.json a partir do schema Zod do recurso (spec 001, T-205).
 * `pnpm schema --check` falha se o ficheiro estiver desatualizado (usado no CI).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

import { z } from 'zod';

import { readRawContent } from '../lib/content/read';
import { resourceSchema } from '../lib/content/schema';
import { validateContent } from '../lib/content/validate';

export const SCHEMA_PATH = path.join(process.cwd(), 'data/schema.json');

type JsonSchema = Record<string, unknown> & { properties?: Record<string, Record<string, unknown>> };

/** Descrições curtas que o editor mostra ao passar o rato em cada campo. */
const FIELD_HELP: Record<string, string> = {
  id: 'Atribuído pelo bot assign-ids depois do merge. Não preenchas.',
  name: 'Nome oficial do recurso.',
  url: 'URL https, única em todo o repositório.',
  repo: 'Repositório público, se existir.',
  author: 'Pessoa ou organização.',
  area: 'discover · learn · build · grow',
  category: 'Slug de data/categories.yaml, da mesma área.',
  tags: '1 a 6 slugs de data/tags.yaml.',
  pricing: 'free · freemium · paid (TODO só em draft).',
  open_source: 'Código público com licença open source (TODO só em draft).',
  license: 'Identificador SPDX: MIT, GPL-3.0, MPL-2.0…',
  level: 'beginner · intermediate · expert',
  description: 'O que o recurso faz e o que o distingue, 40–160 caracteres em pt e en.',
  why: 'A frase de curadoria, até 160 caracteres.',
  alternatives: 'Slugs de outros recursos.',
  added: 'Data em que entrou no índice (YYYY-MM-DD).',
  last_checked: 'Atualizada pelo link checker (YYYY-MM-DD).',
  status: 'active · draft · archived. O site só publica active.',
  notes: 'Notas internas de curadoria, nunca exibidas.',
};

export function buildJsonSchema(dataDir: string = path.join(process.cwd(), 'data')): string {
  const schema = z.toJSONSchema(resourceSchema, {
    io: 'input',
    unrepresentable: 'any',
    target: 'draft-07',
  }) as JsonSchema;
  const { content } = validateContent(readRawContent(dataDir));
  const properties = schema.properties ?? {};

  for (const [field, help] of Object.entries(FIELD_HELP)) {
    if (properties[field]) properties[field].description = help;
  }
  if (properties.url) properties.url.pattern = '^https://';
  // Autocomplete com os valores que existem hoje em data/. O CI garante que o ficheiro acompanha os dados.
  if (properties.category) properties.category.enum = content.categories.map((category) => category.slug);
  const tags = properties.tags?.items as Record<string, unknown> | undefined;
  if (tags) tags.enum = [...content.tags];

  const document = {
    ...schema,
    title: 'FrontDex — recurso',
    description:
      'Um recurso do índice (data/resources/<slug>.yaml). Gerado por pnpm schema a partir de lib/content/schema.ts; não editar à mão.',
  };
  return `${JSON.stringify(document, null, 2)}\n`;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (isMain) {
  const next = buildJsonSchema();
  if (process.argv.includes('--check')) {
    const current = existsSync(SCHEMA_PATH) ? readFileSync(SCHEMA_PATH, 'utf8') : '';
    if (current !== next) {
      console.error('✗ data/schema.json está desatualizado. Corre pnpm schema e faz commit do resultado.');
      process.exitCode = 1;
    } else {
      console.log('✓ data/schema.json está atualizado.');
    }
  } else {
    writeFileSync(SCHEMA_PATH, next);
    console.log('✓ data/schema.json gerado.');
  }
}
