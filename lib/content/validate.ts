/**
 * Validação do conteúdo inteiro: schema de cada ficheiro + regras entre ficheiros
 * (spec 001). Puro: recebe o conteúdo já lido e devolve dados ou erros.
 */
import {
  areasFileSchema,
  categoriesFileSchema,
  collectionSchema,
  resourceSchema,
  slugSchema,
  tagsFileSchema,
  type Area,
  type Category,
  type Collection,
  type Resource,
  type Tag,
} from './schema';

import type { RawContent, RawFile } from './read';
import type { z } from 'zod';

export type ContentError = {
  file: string;
  /** Caminho do campo, em notação com pontos (`description.pt`). Vazio = ficheiro inteiro. */
  field: string;
  message: string;
};

export type ContentWarning = ContentError;

export type Content = {
  areas: Area[];
  categories: Category[];
  tags: Tag[];
  /** Todos os recursos, de todos os estados. As consultas filtram por `active`. */
  resources: Resource[];
  collections: Collection[];
};

export type ValidationResult = {
  content: Content;
  errors: ContentError[];
  warnings: ContentWarning[];
};

/** Formato legível pedido pela spec: `ficheiro › campo › motivo`. */
export function formatError(error: ContentError): string {
  return [error.file, error.field || '(ficheiro)', error.message].join(' › ');
}

function issuePath(issue: z.core.$ZodIssue): string {
  return issue.path.map(String).join('.');
}

function parseWith<T>(schema: z.ZodType<T>, raw: RawFile, errors: ContentError[]): T | undefined {
  if (raw.parseError) {
    errors.push({ file: raw.file, field: '', message: `YAML inválido: ${raw.parseError}` });
    return undefined;
  }
  const result = schema.safeParse(raw.data);
  if (result.success) return result.data;
  for (const issue of result.error.issues) {
    errors.push({ file: raw.file, field: issuePath(issue), message: issue.message });
  }
  return undefined;
}

// SPDX: aviso (não erro), porque a spec só dá exemplos e os dados atuais podem ter valores por confirmar.
const SPDX_LIKE = /^[A-Za-z0-9.+-]+(?:-only|-or-later)?(?: (?:OR|AND|WITH) [A-Za-z0-9.+-]+)*$/;
const KNOWN_AMBIGUOUS_LICENSES = new Set(['GPL', 'LGPL', 'AGPL', 'BSD', 'CC', 'Apache']);

export function validateContent(raw: RawContent): ValidationResult {
  const errors: ContentError[] = [];
  const warnings: ContentWarning[] = [];

  const areas = parseWith(areasFileSchema, raw.areas, errors) ?? [];
  const categories = parseWith(categoriesFileSchema, raw.categories, errors) ?? [];
  const tags = parseWith(tagsFileSchema, raw.tags, errors) ?? [];

  // Unicidade nos ficheiros de apoio.
  const seenAreas = new Set<string>();
  areas.forEach((area, index) => {
    if (seenAreas.has(area.slug))
      errors.push({ file: raw.areas.file, field: `${index}.slug`, message: `área "${area.slug}" repetida` });
    seenAreas.add(area.slug);
  });
  const categoryBySlug = new Map<string, Category>();
  categories.forEach((category, index) => {
    if (categoryBySlug.has(category.slug)) {
      errors.push({
        file: raw.categories.file,
        field: `${index}.slug`,
        message: `categoria "${category.slug}" repetida`,
      });
    }
    categoryBySlug.set(category.slug, category);
  });
  const tagSet = new Set<string>();
  tags.forEach((tag, index) => {
    if (tagSet.has(tag)) errors.push({ file: raw.tags.file, field: String(index), message: `tag "${tag}" repetida` });
    tagSet.add(tag);
  });

  const resources: Resource[] = [];
  const resourceFiles = new Map<string, string>();
  checkFileNames([...raw.resources, ...raw.collections], errors);
  for (const file of raw.resources) {
    const data = parseWith(resourceSchema, file, errors);
    if (!data) continue;
    resources.push({ ...data, slug: file.slug });
    resourceFiles.set(file.slug, file.file);
  }

  const urlOwner = new Map<string, string>();
  const idOwner = new Map<number, string>();
  // Inclui os ficheiros que falharam o schema, para não somar um segundo erro enganador ("não existe").
  const slugs = new Set(raw.resources.map((file) => file.slug));

  for (const resource of resources) {
    const file = resourceFiles.get(resource.slug) ?? resource.slug;

    const normalizedUrl = normalizeUrl(resource.url);
    const owner = urlOwner.get(normalizedUrl);
    if (owner) errors.push({ file, field: 'url', message: `URL repetida: já existe em ${owner}` });
    else urlOwner.set(normalizedUrl, file);

    if (resource.id !== undefined) {
      const idFile = idOwner.get(resource.id);
      if (idFile) errors.push({ file, field: 'id', message: `id ${resource.id} repetido: já existe em ${idFile}` });
      else idOwner.set(resource.id, file);
    }

    const category = categoryBySlug.get(resource.category);
    if (!category) {
      errors.push({
        file,
        field: 'category',
        message: `categoria "${resource.category}" não existe em data/categories.yaml`,
      });
    } else if (category.area !== resource.area) {
      errors.push({
        file,
        field: 'category',
        message: `categoria "${resource.category}" pertence à área "${category.area}", não a "${resource.area}"`,
      });
    }

    resource.tags.forEach((tag, index) => {
      if (!tagSet.has(tag))
        errors.push({ file, field: `tags.${index}`, message: `tag "${tag}" não existe em data/tags.yaml` });
    });

    resource.alternatives?.forEach((alternative, index) => {
      if (alternative === resource.slug) {
        errors.push({
          file,
          field: `alternatives.${index}`,
          message: 'um recurso não pode ser alternativa de si mesmo',
        });
      } else if (!slugs.has(alternative)) {
        errors.push({
          file,
          field: `alternatives.${index}`,
          message: `recurso "${alternative}" não existe em data/resources/`,
        });
      }
    });

    if (resource.license && (KNOWN_AMBIGUOUS_LICENSES.has(resource.license) || !SPDX_LIKE.test(resource.license))) {
      warnings.push({ file, field: 'license', message: `"${resource.license}" não é um identificador SPDX completo` });
    }
  }

  const collections: Collection[] = [];
  for (const file of raw.collections) {
    const data = parseWith(collectionSchema, file, errors);
    if (!data) continue;
    data.resources.forEach((slug, index) => {
      if (!slugs.has(slug))
        errors.push({
          file: file.file,
          field: `resources.${index}`,
          message: `recurso "${slug}" não existe em data/resources/`,
        });
    });
    collections.push({ ...data, slug: file.slug });
  }

  return { content: { areas, categories, tags, resources, collections }, errors, warnings };
}

/** O nome do ficheiro é o slug e a URL (spec 001): só minúsculas, números e hífens, extensão `.yaml`. */
function checkFileNames(files: RawFile[], errors: ContentError[]): void {
  for (const file of files) {
    if (!file.file.endsWith('.yaml')) {
      errors.push({ file: file.file, field: '', message: 'extensão inválida: usa .yaml' });
    } else if (!slugSchema.safeParse(file.slug).success) {
      errors.push({
        file: file.file,
        field: '',
        message: `nome de ficheiro inválido: "${file.slug}" tem de ser um slug (minúsculas, números e hífens)`,
      });
    }
  }
}

/** Compara URLs sem diferenças triviais (maiúsculas no host, barra final, `www.`). */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = parsed.pathname.replace(/\/+$/, '');
    return `${host}${pathname}${parsed.search}`;
  } catch {
    return url;
  }
}
