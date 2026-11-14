'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { IndexId } from '@/components/index';
import { search, type SearchHit } from '@/lib/search/pagefind';
import { cn } from '@/lib/utils';

export type SearchPageLabels = {
  /** Com {q}. */
  resultsFor: string;
  /** Com {q}. */
  empty: string;
  loading: string;
  all: string;
  category: string;
  /** Com {count}: "{count} resultados" já formatado pelo servidor para 0/1/n. */
  count: Record<'zero' | 'one' | 'other', string>;
};

type Props = {
  labels: SearchPageLabels;
  areas: string[];
  /** Índice completo renderizado no servidor: aparece sem JS e enquanto não há termo. */
  fallback: ReactNode;
};

/**
 * Resultados de /[locale]/search (spec 008, T-603). Usa o mesmo Pagefind do ⌘K;
 * o termo vem de `?q=` e os chips de área de `?area=`. Sem JS, o servidor mostra o índice completo.
 */
export function SearchResults({ labels, areas, fallback }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const q = params.get('q')?.trim() ?? '';
  const area = params.get('area') ?? '';
  const [hits, setHits] = useState<SearchHit[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!q) return;
    search(q, 50).then((results) => {
      if (!cancelled) setHits(results);
    });
    return () => {
      cancelled = true;
    };
  }, [q]);

  if (!q) return <>{fallback}</>;
  if (hits === null) return <p className="mt-8 text-small text-muted">{labels.loading}</p>;

  const visible = hits.filter((hit) => !area || hit.area === area);
  const countLabel = (
    visible.length === 0 ? labels.count.zero : visible.length === 1 ? labels.count.one : labels.count.other
  ).replace('{count}', String(visible.length));
  const setArea = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set('area', value);
    else next.delete('area');
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <section aria-labelledby="search-results" className="mt-10">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4">
        <h2 id="search-results" className="title-h3 text-primary">
          {labels.resultsFor.replace('{q}', q)}
        </h2>
        <p role="status" className="font-mono text-mono text-muted">
          {countLabel}
        </p>
      </div>
      <div role="group" className="mb-5 flex flex-wrap gap-2">
        {['', ...areas].map((value) => (
          <button
            key={value || 'all'}
            type="button"
            aria-pressed={area === value}
            onClick={() => setArea(value)}
            className={cn(
              't-hover h-8 rounded-pill border px-3 text-small',
              area === value
                ? 'border-transparent bg-paper text-ink'
                : 'border-border-strong text-secondary hover:text-primary',
            )}
          >
            {value || labels.all}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="rounded-panel border border-border bg-list px-6 py-8 text-body text-secondary">
          {labels.empty.replace('{q}', q)}
        </p>
      ) : (
        <ul className="overflow-hidden rounded-panel border border-border bg-list">
          {visible.map((hit) => (
            <li key={hit.url} className="border-b border-border last:border-b-0">
              <a href={hit.url} className="t-hover flex items-start gap-5 px-6 py-4 hover:bg-row-hover">
                <span className="hidden w-16 shrink-0 pt-1 sm:block">
                  <IndexId id={hit.id} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-body font-medium text-primary">{hit.title}</span>
                  <span
                    className="mt-1 block text-small text-secondary [&_mark]:rounded-sm [&_mark]:bg-brand-tint [&_mark]:px-1 [&_mark]:text-brand-tint-text"
                    // Excerto do Pagefind, gerado do nosso próprio HTML no build (só <mark>).
                    dangerouslySetInnerHTML={{ __html: hit.excerpt }}
                  />
                </span>
                {hit.kind === 'category' ? (
                  <span className="shrink-0 font-mono text-mono text-muted">{labels.category}</span>
                ) : hit.category ? (
                  <span className="hidden shrink-0 font-mono text-mono text-muted sm:block">{hit.category}</span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
