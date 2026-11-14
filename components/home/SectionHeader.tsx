import { SectionTitle } from '@/components/index';

import type { ReactNode } from 'react';

type SectionHeaderProps = {
  id: string;
  eyebrow: string;
  title: string;
  muted: string;
  action?: ReactNode;
};

/** Cabeçalho das secções da home: rótulo mono numerado + título em dois tons (+ ação opcional). */
export function SectionHeader({ id, eyebrow, title, muted, action }: SectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="label-mono mb-4 text-link">{eyebrow}</p>
        <SectionTitle id={id} as="h2" size="h2" title={title} muted={muted} />
      </div>
      {action}
    </div>
  );
}
