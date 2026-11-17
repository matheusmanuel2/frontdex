'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { EmptyState } from '@/components/index';
import { cn } from '@/lib/utils';

import { CategoryRows, type RowLabels } from './CategoryRows';
import { applyFilters, parseFilters, serializeFilters, type FilterItem, type Filters } from './filters';
import { Pagination, type PaginationLabels } from './Pagination';

import type { ReactNode } from 'react';

export type FilterLabels = RowLabels & {
  filters: string;
  pricingLabel: string;
  all: string;
  sort: string;
  sortRecent: string;
  sortName: string;
  /** "Mostrando {shown} de {total}" com marcadores. */
  showing: string;
  emptyTitle: string;
  emptyBody: string;
  clear: string;
  /** Mostrado enquanto a lista completa carrega. */
  loading: string;
  pagination: PaginationLabels;
};

export type PageInfo = {
  /** Caminho da categoria, sem /p/N. */
  base: string;
  page: number;
  count: number;
  /** Total de recursos da categoria. */
  total: number;
  /** JSON com a lista completa (spec 003: items.json). */
  dataUrl: string;
};

type FilterBarProps = {
  /** Recursos da página atual (vêm do servidor). */
  items: FilterItem[];
  pageInfo: PageInfo;
  locale: string;
  labels: FilterLabels;
  /** Link "Sugerir recurso" do estado vazio (vem do servidor). */
  suggest: ReactNode;
};

const control =
  't-hover h-10 rounded-pill border border-border-strong bg-ink px-3 text-small text-primary hover:border-border-button';

/**
 * Ilha de filtros da categoria (spec 003). Estado só na URL: cada mudança faz `router.push`,
 * por isso voltar/avançar funciona e o link é partilhável. Sem filtros mostra a página do servidor;
 * com filtros carrega a categoria inteira de `items.json`. Sem JS, o servidor mostra a página pedida.
 */
export function FilterBar({ items, pageInfo, locale, labels, suggest }: FilterBarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const filters = parseFilters(new URLSearchParams(params.toString()));
  const filtering = filters.pricing !== undefined || filters.sort !== 'recent';
  const [all, setAll] = useState<FilterItem[] | null>(null);

  useEffect(() => {
    if (!filtering || all) return;
    let cancelled = false;
    fetch(pageInfo.dataUrl)
      .then((response) => (response.ok ? (response.json() as Promise<FilterItem[]>) : null))
      .then((data) => {
        if (!cancelled && data) setAll(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [filtering, all, pageInfo.dataUrl]);

  const loading = filtering && !all;
  const shown = filtering ? applyFilters(all ?? [], filters) : items;
  const total = pageInfo.total;

  const update = (next: Partial<Filters>) => {
    // Filtros valem para a categoria inteira: saem da página /p/N para a raiz.
    router.push(`${pageInfo.base}${serializeFilters({ ...filters, ...next })}`, { scroll: false });
  };

  const pricingOptions = [
    { value: undefined, label: labels.all },
    { value: 'free' as const, label: labels.pricing.free },
    { value: 'freemium' as const, label: labels.pricing.freemium },
    { value: 'paid' as const, label: labels.pricing.paid },
    { value: 'pay-what-you-want' as const, label: labels.pricing['pay-what-you-want'] },
  ];

  return (
    <>
      <div
        role="toolbar"
        aria-label={labels.filters}
        className="mb-4 flex flex-wrap items-center gap-3 rounded-card border border-border bg-carbon p-2 sm:rounded-pill"
      >
        <div role="group" aria-label={labels.pricingLabel} className="flex flex-wrap gap-1 rounded-pill bg-ink p-1">
          {pricingOptions.map((option) => {
            const active = filters.pricing === option.value;
            return (
              <button
                key={option.label}
                type="button"
                aria-pressed={active}
                onClick={() => update({ pricing: option.value })}
                className={cn(
                  't-hover h-8 rounded-pill px-3 text-small',
                  active ? 'bg-paper font-medium text-ink' : 'text-secondary hover:text-primary',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2 text-small text-secondary sm:mr-2 sm:ml-auto">
          {labels.sort}
          <select
            value={filters.sort}
            onChange={(event) => update({ sort: event.target.value === 'name' ? 'name' : 'recent' })}
            className={control}
          >
            <option value="recent">{labels.sortRecent}</option>
            <option value="name">{labels.sortName}</option>
          </select>
        </label>
      </div>

      <p role="status" className="mb-3 pl-1 font-mono text-mono text-muted">
        {loading
          ? labels.loading
          : labels.showing.replace('{shown}', String(shown.length)).replace('{total}', String(total))}
      </p>

      {loading ? (
        <CategoryRows items={items} locale={locale} labels={labels} />
      ) : shown.length > 0 ? (
        <>
          <CategoryRows items={shown} locale={locale} labels={labels} />
          {filtering ? null : (
            <Pagination base={pageInfo.base} page={pageInfo.page} count={pageInfo.count} labels={labels.pagination} />
          )}
        </>
      ) : (
        <EmptyState
          title={labels.emptyTitle}
          description={labels.emptyBody}
          actions={
            <>
              <button
                type="button"
                onClick={() => router.push(pageInfo.base, { scroll: false })}
                className="t-hover inline-flex h-10 items-center rounded-pill bg-button-primary px-4 text-small font-semibold text-button-primary-text hover:opacity-90"
              >
                {labels.clear}
              </button>
              {suggest}
            </>
          }
        />
      )}
    </>
  );
}
