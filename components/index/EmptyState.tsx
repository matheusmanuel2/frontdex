import { cn } from '@/lib/utils';

import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  /** Botões (por exemplo "Limpar filtros" e "Sugerir recurso"). */
  actions?: ReactNode;
  className?: string;
};

/** Estado vazio (mockup Empty): painel discreto, texto e ações. Sem ilustrações (spec 006). */
export function EmptyState({ title, description, actions, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-4 rounded-panel border border-border bg-list px-6 py-10 sm:px-8',
        className,
      )}
    >
      <p className="title-h3 text-primary">{title}</p>
      {description ? <p className="max-w-xl text-body text-secondary">{description}</p> : null}
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
