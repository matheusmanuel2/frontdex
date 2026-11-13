import Link from 'next/link';

import { cn } from '@/lib/utils';

import { TagChip } from './TagChip';

type CategoryCardProps = {
  href: string;
  name: string;
  /** Contagem já formatada (vem do loader). */
  count: number;
  description?: string;
  /** Exemplos de recursos, já unidos (por exemplo "Kugiri · Calligraph"). */
  examples?: string;
  className?: string;
};

/** Card de categoria da página de Área (raio 24px). */
export function CategoryCard({ href, name, count, description, examples, className }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        't-hover flex flex-col gap-3.5 rounded-card border border-border bg-carbon p-6 text-primary',
        'hover:border-border-strong hover:bg-graphite',
        className,
      )}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="title-h3">{name}</span>
        <TagChip>{count}</TagChip>
      </span>
      {description ? <span className="text-small text-secondary">{description}</span> : null}
      {examples ? (
        <span className="mt-auto border-t border-border pt-3.5 font-mono text-mono text-muted">{examples}</span>
      ) : null}
    </Link>
  );
}
