import Link from 'next/link';

import { ArrowUpRightIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

import { IndexId } from './IndexId';

import type { ReactNode } from 'react';

type ResourceRowProps = {
  href: string;
  name: string;
  description: string;
  id?: number;
  /** Selos ao lado do nome (por exemplo o TagChip "OSS"). */
  badges?: ReactNode;
  /** Linha mono por baixo da descrição (tags). */
  meta?: string;
  /** Coluna da direita (preço ou categoria). */
  aside?: ReactNode;
  /** Uma linha só, com a descrição cortada (lista "Em destaque"). */
  compact?: boolean;
  /** Posição numa lista ordenada (coleções): substitui o ID na primeira coluna. */
  position?: number;
};

/**
 * Linha da lista densa (mockups Categoria e Área): ID mono, nome, descrição,
 * metadados e seta que avança no hover. Vai dentro de ResourceList.
 */
export function ResourceRow({
  href,
  name,
  description,
  id,
  badges,
  meta,
  aside,
  compact = false,
  position,
}: ResourceRowProps) {
  const lead = position ?? id;
  return (
    <li className="border-b border-border last:border-b-0">
      <Link
        href={href}
        className={cn(
          't-hover t-icon-host group grid items-center gap-x-5 gap-y-2 px-5 py-4 text-primary hover:bg-row-hover sm:px-6',
          'grid-cols-[minmax(0,1fr)_16px]',
          // Sem ID (antes do assign-ids), a coluna do ID não existe.
          lead === undefined ? 'sm:grid-cols-[minmax(0,1fr)_auto_16px]' : 'sm:grid-cols-[64px_minmax(0,1fr)_auto_16px]',
          '-outline-offset-2',
        )}
      >
        {position !== undefined ? (
          <span className="hidden font-mono text-h3 text-link tabular-nums sm:block">
            {String(position).padStart(2, '0')}
          </span>
        ) : id === undefined ? null : (
          <span className="hidden sm:block">
            <IndexId id={id} />
          </span>
        )}
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-3">
            <span className="text-body font-medium">{name}</span>
            {badges}
          </span>
          <span className={cn('mt-1 block text-small text-secondary', compact && 'truncate')}>{description}</span>
          {meta ? <span className="mt-2 block font-mono text-mono text-muted">{meta}</span> : null}
        </span>
        {aside ? (
          <span className="hidden justify-self-start sm:block">{aside}</span>
        ) : (
          <span className="hidden sm:block" />
        )}
        <ArrowUpRightIcon size={16} className="t-hover text-muted group-hover:text-link" />
      </Link>
    </li>
  );
}

type ResourceListProps = { children: ReactNode; label?: string; className?: string; ordered?: boolean };

/** Painel da lista densa (raio 16px, spec 004). */
export function ResourceList({ children, label, className, ordered = false }: ResourceListProps) {
  const List = ordered ? 'ol' : 'ul';
  return (
    <List aria-label={label} className={cn('overflow-hidden rounded-panel border border-border bg-list', className)}>
      {children}
    </List>
  );
}
