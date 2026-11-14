import { cn } from '@/lib/utils';

import type { ReactNode } from 'react';

const sizes = { display: 'title-display', h1: 'title-h1', h2: 'title-h2' } as const;

type SectionTitleProps = {
  /** Primeira linha, na cor principal. */
  title: ReactNode;
  /** Segunda linha, em --color-title-muted (título em dois tons). */
  muted?: ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  size?: keyof typeof sizes;
  className?: string;
  id?: string;
};

/** Título em dois tons com Geist 400 (spec 006: parte da identidade). */
export function SectionTitle({ title, muted, as: Tag = 'h2', size = 'h2', className, id }: SectionTitleProps) {
  return (
    <Tag id={id} className={cn(sizes[size], 'text-primary text-balance', className)}>
      {title}
      {muted ? (
        <>
          <br />
          <span className="text-title-muted">{muted}</span>
        </>
      ) : null}
    </Tag>
  );
}
