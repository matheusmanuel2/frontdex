/**
 * Schema do conteúdo da FrontDex (spec 001).
 *
 * Um único schema serve o site, o CI (`pnpm validate`) e o bot do Issue Form.
 * As regras que dependem de outros ficheiros (categoria existe, tags na lista,
 * URLs únicas, alternatives válidas) ficam em `validate.ts`, porque o schema
 * de um recurso só vê o próprio ficheiro.
 */
import { z } from 'zod';

/** Valor de marcação para campos por preencher. Só é aceite em `status: draft`. */
export const TODO = 'TODO';

export const LOCALES = ['pt', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const AREAS = ['discover', 'learn', 'build', 'grow'] as const;
export const PRICING = ['free', 'freemium', 'paid'] as const;
export const LEVELS = ['beginner', 'intermediate', 'expert'] as const;
export const RESOURCE_STATUS = ['active', 'draft', 'archived'] as const;
export const COLLECTION_STATUS = ['active', 'draft'] as const;

export const DESCRIPTION_MIN = 40;
export const DESCRIPTION_MAX = 160;
export const WHY_MAX = 160;
export const TAGS_MIN = 1;
export const TAGS_MAX = 6;

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug inválido: usa minúsculas, números e hífens');

/** Data ISO `YYYY-MM-DD`. O YAML pode devolver um `Date`; normalizamos para string. */
export const isoDateSchema = z.preprocess(
  (value) => (value instanceof Date && !Number.isNaN(value.getTime()) ? value.toISOString().slice(0, 10) : value),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'data inválida: usa o formato YYYY-MM-DD')
    .refine((value) => {
      const date = new Date(`${value}T00:00:00Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }, 'data inexistente'),
);

const httpsUrlSchema = z.url({ protocol: /^https$/, error: 'URL inválida: tem de começar por https://' });
const urlSchema = z.url({ protocol: /^https?$/, error: 'URL inválida' });

const todo = z.literal(TODO);

const localizedText = z.object({ pt: z.string().min(1), en: z.string().min(1) }).strict();

const descriptionText = z.union(
  [
    todo,
    z
      .string()
      .min(DESCRIPTION_MIN, `tem de ter entre ${DESCRIPTION_MIN} e ${DESCRIPTION_MAX} caracteres`)
      .max(DESCRIPTION_MAX, `tem de ter entre ${DESCRIPTION_MIN} e ${DESCRIPTION_MAX} caracteres`),
  ],
  {
    error: `tem de ter entre ${DESCRIPTION_MIN} e ${DESCRIPTION_MAX} caracteres`,
  },
);

const whyText = z.string().min(1).max(WHY_MAX, `tem de ter no máximo ${WHY_MAX} caracteres`);

export const areaSlugSchema = z.enum(AREAS, { error: `tem de ser ${AREAS.join(', ')}` });

export const resourceSchema = z
  .object({
    id: z.number().int().positive().optional(),
    name: z.string().min(1),
    url: httpsUrlSchema,
    repo: urlSchema.optional(),
    author: z.string().min(1).optional(),
    area: areaSlugSchema,
    category: slugSchema,
    tags: z
      .array(slugSchema)
      .min(TAGS_MIN, `precisa de pelo menos ${TAGS_MIN} tag`)
      .max(TAGS_MAX, `aceita no máximo ${TAGS_MAX} tags`)
      .refine((tags) => new Set(tags).size === tags.length, 'tags repetidas'),
    pricing: z.union([z.enum(PRICING), todo], { error: `tem de ser ${PRICING.join(', ')} (ou ${TODO} em draft)` }),
    open_source: z.union([z.boolean(), todo], { error: `tem de ser true ou false (ou ${TODO} em draft)` }),
    license: z.string().min(1).optional(),
    level: z
      .array(z.enum(LEVELS, { error: `tem de ser ${LEVELS.join(', ')}` }))
      .min(1)
      .optional(),
    description: z.object({ pt: descriptionText, en: descriptionText }).strict(),
    why: z.object({ pt: whyText, en: whyText }).partial().strict().optional(),
    alternatives: z.array(slugSchema).optional(),
    added: isoDateSchema,
    last_checked: isoDateSchema,
    status: z.enum(RESOURCE_STATUS, { error: `tem de ser ${RESOURCE_STATUS.join(', ')}` }),
    notes: z.string().optional(),
  })
  .strict()
  .superRefine((resource, ctx) => {
    if (resource.status === 'draft') return;
    for (const path of findTodoPaths(resource)) {
      ctx.addIssue({ code: 'custom', path, message: `"${TODO}" só é permitido em recursos com status: draft` });
    }
  });

export const areaSchema = z
  .object({
    slug: areaSlugSchema,
    name: localizedText,
    description: localizedText,
  })
  .strict();

export const categorySchema = z
  .object({
    slug: slugSchema,
    area: areaSlugSchema,
    name: localizedText,
    description: localizedText.optional(),
  })
  .strict();

export const tagSchema = slugSchema;

export const collectionSchema = z
  .object({
    title: localizedText,
    text: localizedText,
    resources: z.array(slugSchema).refine((list) => new Set(list).size === list.length, 'recursos repetidos'),
    status: z.enum(COLLECTION_STATUS, { error: `tem de ser ${COLLECTION_STATUS.join(', ')}` }),
  })
  .strict()
  .superRefine((collection, ctx) => {
    if (collection.status === 'draft') return;
    for (const path of findTodoPaths(collection)) {
      ctx.addIssue({ code: 'custom', path, message: `"${TODO}" só é permitido em coleções com status: draft` });
    }
  });

export const areasFileSchema = z.array(areaSchema);
export const categoriesFileSchema = z.array(categorySchema);
export const tagsFileSchema = z.array(tagSchema);

export type ResourceInput = z.input<typeof resourceSchema>;
export type ResourceData = z.output<typeof resourceSchema>;
export type Area = z.output<typeof areaSchema>;
export type AreaSlug = (typeof AREAS)[number];
export type Category = z.output<typeof categorySchema>;
export type Tag = z.output<typeof tagSchema>;
export type CollectionData = z.output<typeof collectionSchema>;
export type ResourceStatus = (typeof RESOURCE_STATUS)[number];

/** Recurso com o slug (nome do ficheiro). */
export type Resource = ResourceData & { slug: string };
/** Coleção com o slug (nome do ficheiro). */
export type Collection = CollectionData & { slug: string };

/** Devolve o caminho de cada string que começa por `TODO`, em qualquer profundidade. */
export function findTodoPaths(value: unknown, path: (string | number)[] = []): (string | number)[][] {
  if (typeof value === 'string') return value.trim().startsWith(TODO) ? [path] : [];
  if (Array.isArray(value)) return value.flatMap((item, index) => findTodoPaths(item, [...path, index]));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => (key === 'notes' ? [] : findTodoPaths(item, [...path, key])));
  }
  return [];
}
