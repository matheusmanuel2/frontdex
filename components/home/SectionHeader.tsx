import type { ReactNode } from 'react';

type SectionHeaderProps = {
  id: string;
  title: string;
  description?: string;
  action?: ReactNode;
  /** Substitui o estilo do título (padrão: title-h2). */
  titleClassName?: string;
};

/** Cabeçalho das secções da home: título simples numa linha (+ ação opcional). Sem rótulo nem segundo tom. */
export function SectionHeader({ id, title, description, action, titleClassName = 'title-h2' }: SectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 id={id} className={`${titleClassName} text-primary`}>
          {title}
        </h2>
        {description ? <p className="mt-2 max-w-[42ch] text-body text-secondary">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
