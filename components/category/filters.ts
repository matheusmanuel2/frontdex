import type { Pricing, Resource } from '@/lib/content/schema';

/** O mínimo de cada recurso que a ilha de filtros precisa (evita mandar o YAML inteiro para o browser). */
export type FilterItem = {
  slug: string;
  id?: number;
  name: string;
  description: string;
  tags: string[];
  pricing: Resource['pricing'];
  openSource: boolean;
  added: string;
};

export type Filters = {
  pricing?: Pricing;
  sort: 'recent' | 'name';
};

/** Cópia local de PRICING (schema.ts puxaria o Zod para o bundle do cliente). */
const PRICING: readonly Pricing[] = ['free', 'freemium', 'paid', 'pay-what-you-want'];

/** Lê os filtros da URL (spec 003: `?pricing=free&sort=…`). Valores inválidos são ignorados. */
export function parseFilters(params: URLSearchParams): Filters {
  const pricing = params.get('pricing');
  return {
    pricing: (PRICING as readonly string[]).includes(pricing ?? '') ? (pricing as Filters['pricing']) : undefined,
    sort: params.get('sort') === 'name' ? 'name' : 'recent',
  };
}

/** Escreve os filtros na query string, só com os valores diferentes do padrão. */
export function serializeFilters(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.pricing) params.set('pricing', filters.pricing);
  if (filters.sort !== 'recent') params.set('sort', filters.sort);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function applyFilters(items: FilterItem[], filters: Filters): FilterItem[] {
  const filtered = items.filter((item) => !filters.pricing || item.pricing === filters.pricing);
  return [...filtered].sort((a, b) =>
    filters.sort === 'name'
      ? a.name.localeCompare(b.name, 'en')
      : a.added === b.added
        ? a.name.localeCompare(b.name, 'en')
        : a.added < b.added
          ? 1
          : -1,
  );
}
