import Link from 'next/link';
import { Fragment } from 'react';

import { cn } from '@/lib/utils';

export type BreadcrumbItem = { label: string; href?: string };

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  /** Nome acessível do <nav> (vem de messages/). */
  label: string;
  className?: string;
};

/** Trilho mono ("ÍNDICE / CONSTRUIR / ÍCONES"). O último item é a página atual. */
export function Breadcrumb({ items, label, className }: BreadcrumbProps) {
  return (
    <nav aria-label={label} className={className}>
      <ol className="label-mono flex flex-wrap items-center gap-x-2 gap-y-1 text-muted">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li>
                {item.href && !last ? (
                  <Link href={item.href} className="t-hover rounded-sm hover:text-primary">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={last ? 'page' : undefined} className={cn(last && 'text-primary')}>
                    {item.label}
                  </span>
                )}
              </li>
              {last ? null : (
                <li aria-hidden="true" className="text-muted">
                  /
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
