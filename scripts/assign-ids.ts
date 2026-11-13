import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { parseDocument } from 'yaml';

type ResourceSource = { file: string; source: string };
export type IdAssignment = ResourceSource & { id: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function assignResourceIds(resources: ResourceSource[]): IdAssignment[] {
  const parsed = resources.map(({ file, source }) => {
    const document = parseDocument(source, { prettyErrors: false });
    if (document.errors.length > 0) {
      throw new Error(
        `${file} › (ficheiro) › YAML inválido: ${document.errors.map((error) => error.message).join('; ')}`,
      );
    }

    const resource: unknown = document.toJS();
    if (!isRecord(resource)) throw new Error(`${file} › (ficheiro) › esperado um objeto YAML de recurso.`);
    const id = resource.id;
    if (id !== undefined && (typeof id !== 'number' || !Number.isSafeInteger(id) || id < 1)) {
      throw new Error(`${file} › id › esperado um inteiro positivo.`);
    }
    return { file, document, id };
  });

  const existingIds = new Map<number, string>();
  for (const resource of parsed) {
    if (resource.id === undefined) continue;
    if (existingIds.has(resource.id)) {
      throw new Error(`ID ${resource.id} duplicado em ${existingIds.get(resource.id)} e ${resource.file}.`);
    }
    existingIds.set(resource.id, resource.file);
  }

  const pending = parsed
    .filter((resource) => resource.id === undefined)
    .sort((left, right) => (left.file < right.file ? -1 : left.file > right.file ? 1 : 0));
  const largestId = Math.max(0, ...existingIds.keys());
  if (pending.length > 0 && largestId >= Number.MAX_SAFE_INTEGER) {
    throw new Error('Não é possível atribuir mais IDs inteiros seguros.');
  }

  let nextId = largestId + 1;
  return pending.map(({ file, document }) => {
    const id = nextId;
    nextId += 1;
    document.set('id', id);
    return { file, source: document.toString(), id };
  });
}

function assignMissingIds(resourcesDir: string): IdAssignment[] {
  const files = readdirSync(resourcesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.yaml'))
    .map((entry) => path.join(resourcesDir, entry.name));

  return assignResourceIds(files.map((file) => ({ file, source: readFileSync(file, 'utf8') })));
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (isMain) {
  const resourcesDir = path.resolve(process.argv[2] ?? 'data/resources');
  try {
    const assignments = assignMissingIds(resourcesDir);
    for (const assignment of assignments) {
      writeFileSync(assignment.file, assignment.source);
      console.log(`${path.relative(process.cwd(), assignment.file)} › id › ${assignment.id}`);
    }
    if (assignments.length === 0) console.log('Todos os recursos já têm ID; nenhum ficheiro alterado.');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
