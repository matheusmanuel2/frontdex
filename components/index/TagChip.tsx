import Link from 'next/link';

import { cn } from '@/lib/utils';

import type { ReactNode } from 'react';

const tone = {
  neutral: 'bg-graphite text-secondary',
  brand: 'bg-brand-tint text-brand-tint-text',
} as const;

type TagChipProps = {
  children: ReactNode;
  /** Com `href`, o chip é um link (com hover e foco). */
  href?: string;
  tone?: keyof typeof tone;
  className?: string;
};

/** Pílula mono para tags, preço, contagens e o selo OSS. */
export function TagChip({ children, href, tone: chipTone = 'neutral', className }: TagChipProps) {
  const classes = cn(
    'inline-flex h-6 items-center rounded-pill px-3 font-mono text-mono whitespace-nowrap',
    tone[chipTone],
    className,
  );
  if (!href) return <span className={classes}>{children}</span>;
  return (
    <Link href={href} className={cn(classes, 't-hover hover:text-primary hover:bg-border-strong')}>
      {children}
    </Link>
  );
}
