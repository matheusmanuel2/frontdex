import { applyFilters, type FilterItem } from './filters';

/** Recursos por página da categoria (spec 003, "Paginação da categoria"). */
export const PAGE_SIZE = 50;

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

/** Itens da página `page` (1-based) na ordem padrão ("Mais recentes"). */
export function pageItems(items: FilterItem[], page: number): FilterItem[] {
  const sorted = applyFilters(items, { sort: 'recent' });
  return sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
}

/** Caminho da página: a 1 é a raiz da categoria, as seguintes ficam em /p/N. */
export function pagePath(base: string, page: number): string {
  return page <= 1 ? base : `${base}/p/${page}`;
}

/**
 * Números a mostrar na navegação: primeira, última e as vizinhas da atual.
 * `null` marca um salto ("…").
 */
export function pageWindow(current: number, count: number): (number | null)[] {
  const pages = new Set([1, count, current - 1, current, current + 1].filter((n) => n >= 1 && n <= count));
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((n, i) => {
    const prev = sorted[i - 1];
    if (i > 0 && prev !== undefined && n - prev > 1) out.push(null);
    out.push(n);
  });
  return out;
}
