import { cn } from '@/lib/utils';

/** Formata o ID do índice com 4 dígitos: 2 → `#0002`. */
export function formatIndexId(id: number): string {
  return `#${String(id).padStart(4, '0')}`;
}

type IndexIdProps = { id?: number; className?: string };

/** ID do índice em mono (spec 006: parte da identidade). Sem ID (antes do merge) não mostra nada. */
export function IndexId({ id, className }: IndexIdProps) {
  if (id === undefined) return null;
  return <span className={cn('font-mono text-mono text-muted tabular-nums', className)}>{formatIndexId(id)}</span>;
}
