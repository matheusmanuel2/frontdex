/**
 * Leitura dos ficheiros de `data/`. É o único módulo do código que toca no disco
 * para ler conteúdo (spec 001, T-203).
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

import { parseDocument } from 'yaml';

export type RawFile = {
  /** Caminho relativo à raiz do repositório, para mensagens de erro. */
  file: string;
  /** Slug derivado do nome do ficheiro (só para recursos e coleções). */
  slug: string;
  data: unknown;
  /** Erro de sintaxe YAML, se houver. */
  parseError?: string;
};

export type RawContent = {
  areas: RawFile;
  categories: RawFile;
  tags: RawFile;
  resources: RawFile[];
  collections: RawFile[];
};

export const DEFAULT_DATA_DIR = path.join(process.cwd(), 'data');

function readYaml(absolute: string, rootForMessages: string): RawFile {
  const file = path.relative(rootForMessages, absolute).split(path.sep).join('/');
  const slug = path.basename(absolute, path.extname(absolute));
  if (!existsSync(absolute)) return { file, slug, data: undefined, parseError: 'ficheiro não existe' };
  const doc = parseDocument(readFileSync(absolute, 'utf8'), { prettyErrors: false });
  if (doc.errors.length > 0) {
    return { file, slug, data: undefined, parseError: doc.errors.map((error) => error.message).join('; ') };
  }
  return { file, slug, data: doc.toJS() };
}

function readDir(dir: string, rootForMessages: string): RawFile[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.yaml'))
    .sort()
    .map((name) => readYaml(path.join(dir, name), rootForMessages));
}

/** Lê todos os YAML de uma pasta `data/` sem validar. */
export function readRawContent(dataDir: string = DEFAULT_DATA_DIR): RawContent {
  const root = path.dirname(dataDir);
  return {
    areas: readYaml(path.join(dataDir, 'areas.yaml'), root),
    categories: readYaml(path.join(dataDir, 'categories.yaml'), root),
    tags: readYaml(path.join(dataDir, 'tags.yaml'), root),
    resources: readDir(path.join(dataDir, 'resources'), root),
    collections: readDir(path.join(dataDir, 'collections'), root),
  };
}
