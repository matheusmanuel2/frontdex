import { cn } from '@/lib/utils';

import type { ReactNode } from 'react';

type EyebrowProps = { children: ReactNode; className?: string; as?: 'span' | 'p' };

/** Rótulo mono em pílula por cima dos títulos ("03 / CONSTRUIR"). */
export function Eyebrow({ children, className, as: Tag = 'span' }: EyebrowProps) {
  return (
    <Tag className={cn('label-mono inline-flex w-fit rounded-pill bg-graphite px-3 py-1 text-secondary', className)}>
      {children}
    </Tag>
  );
}
