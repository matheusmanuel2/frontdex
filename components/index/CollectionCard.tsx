import Link from 'next/link';

import { ArrowUpRightIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

import { TagChip } from './TagChip';

type CollectionCardProps = {
  href: string;
  title: string;
  /** Rótulo mono no topo (por exemplo a área). */
  eyebrow?: string;
  /** Contagem já formatada ("6 recursos"). */
  count: string;
  description: string;
  /** Primeiros recursos, já unidos. */
  items?: string;
  className?: string;
};

/** Card de coleção (mockup Coleções). */
export function CollectionCard({ href, title, eyebrow, count, description, items, className }: CollectionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        't-hover t-icon-host group flex min-h-64 flex-col gap-4 rounded-card border border-border bg-carbon p-7 text-primary',
        'hover:border-border-strong hover:bg-graphite',
        className,
      )}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="label-mono text-muted">{eyebrow}</span>
        <TagChip>{count}</TagChip>
      </span>
      <span className="title-card">{title}</span>
      <span className="text-body text-secondary">{description}</span>
      <span className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="min-w-0 truncate font-mono text-mono text-muted">{items}</span>
        <ArrowUpRightIcon size={16} className="t-hover text-muted group-hover:text-link" />
      </span>
    </Link>
  );
}
