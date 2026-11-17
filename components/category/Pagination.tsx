import Link from 'next/link';

import { cn } from '@/lib/utils';

import { pagePath, pageWindow } from './paging';

export type PaginationLabels = {
  /** Nome da navegação ("Paginação"). */
  label: string;
  previous: string;
  next: string;
  /** "Página {page}" para leitores de ecrã. */
  page: string;
};

type Props = { base: string; page: number; count: number; labels: PaginationLabels };

const item = 't-hover inline-flex h-9 min-w-9 items-center justify-center rounded-pill px-3 text-small';

/** Navegação entre páginas da categoria (spec 003). Links reais: funciona sem JS. */
export function Pagination({ base, page, count, labels }: Props) {
  if (count <= 1) return null;
  return (
    <nav aria-label={labels.label} className="mt-6 flex flex-wrap items-center gap-1">
      {page > 1 ? (
        <Link
          href={pagePath(base, page - 1)}
          rel="prev"
          className={cn(item, 'text-secondary hover:bg-carbon hover:text-primary')}
        >
          {labels.previous}
        </Link>
      ) : null}
      {pageWindow(page, count).map((n, i) =>
        n === null ? (
          <span key={`gap-${i}`} aria-hidden className="px-2 font-mono text-mono text-muted">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={pagePath(base, n)}
            aria-current={n === page ? 'page' : undefined}
            aria-label={labels.page.replace('{page}', String(n))}
            className={cn(
              item,
              'font-mono text-mono',
              n === page ? 'bg-paper font-medium text-ink' : 'text-secondary hover:bg-carbon hover:text-primary',
            )}
          >
            {n}
          </Link>
        ),
      )}
      {page < count ? (
        <Link
          href={pagePath(base, page + 1)}
          rel="next"
          className={cn(item, 'text-secondary hover:bg-carbon hover:text-primary')}
        >
          {labels.next}
        </Link>
      ) : null}
    </nav>
  );
}
