'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { EmptyState } from '@/components/index';
import { cn } from '@/lib/utils';

import { CategoryRows, type RowLabels } from './CategoryRows';
import { applyFilters, parseFilters, serializeFilters, type FilterItem, type Filters } from './filters';

import type { ReactNode } from 'react';

export type FilterLabels = RowLabels & {
  /** Selo das linhas ("OSS"); `oss` é o rótulo do checkbox. */
  ossBadge: string;
  filters: string;
  pricingLabel: string;
  all: string;
  oss: string;
  level: string;
  levelAny: string;
  levels: Record<'beginner' | 'intermediate' | 'expert', string>;
  sort: string;
  sortRecent: string;
  sortName: string;
  /** "Mostrando {shown} de {total}" com marcadores. */
  showing: string;
  emptyTitle: string;
  emptyBody: string;
  clear: string;
};

type FilterBarProps = {
  items: FilterItem[];
  locale: string;
  labels: FilterLabels;
  /** Link "Sugerir recurso" do estado vazio (vem do servidor). */
  suggest: ReactNode;
};

const control =
  't-hover h-10 rounded-pill border border-border-strong bg-ink px-3 text-small text-primary hover:border-border-button';

/**
 * Ilha de filtros da categoria (spec 003). Estado só na URL: cada mudança faz `router.push`,
 * por isso voltar/avançar funciona e o link é partilhável. Sem JS, o servidor mostra a lista completa.
 */
export function FilterBar({ items, locale, labels, suggest }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = parseFilters(new URLSearchParams(params.toString()));
  const shown = applyFilters(items, filters);

  const update = (next: Partial<Filters>) => {
    router.push(`${pathname}${serializeFilters({ ...filters, ...next })}`, { scroll: false });
  };

  const pricingOptions = [
    { value: undefined, label: labels.all },
    { value: 'free' as const, label: labels.pricing.free },
    { value: 'freemium' as const, label: labels.pricing.freemium },
    { value: 'paid' as const, label: labels.pricing.paid },
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
        <label className="t-hover flex h-10 cursor-pointer items-center gap-2 rounded-pill border border-border px-3 text-small text-secondary hover:text-primary">
          <input
            type="checkbox"
            checked={filters.oss}
            onChange={(event) => update({ oss: event.target.checked })}
            className="size-4 accent-index-blue"
          />
          {labels.oss}
        </label>
        <label className="flex items-center gap-2 text-small text-secondary">
          {labels.level}
          <select
            value={filters.level ?? ''}
            onChange={(event) => update({ level: (event.target.value || undefined) as Filters['level'] })}
            className={control}
          >
            <option value="">{labels.levelAny}</option>
            {(['beginner', 'intermediate', 'expert'] as const).map((level) => (
              <option key={level} value={level}>
                {labels.levels[level]}
              </option>
            ))}
          </select>
        </label>
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
        {labels.showing.replace('{shown}', String(shown.length)).replace('{total}', String(items.length))}
      </p>

      {shown.length > 0 ? (
        <CategoryRows items={shown} locale={locale} labels={{ ...labels, oss: labels.ossBadge }} />
      ) : (
        <EmptyState
          title={labels.emptyTitle}
          description={labels.emptyBody}
          actions={
            <>
              <button
                type="button"
                onClick={() => router.push(pathname, { scroll: false })}
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
