import { ResourceList, ResourceRow, TagChip } from '@/components/index';

import type { FilterItem } from './filters';

export type RowLabels = {
  list: string;
  oss: string;
  pricing: Record<'free' | 'freemium' | 'paid', string>;
};

/** Linhas da categoria. Usado pelo servidor (lista completa, sem JS) e pela ilha de filtros. */
export function CategoryRows({ items, locale, labels }: { items: FilterItem[]; locale: string; labels: RowLabels }) {
  return (
    <ResourceList label={labels.list}>
      {items.map((item) => (
        <ResourceRow
          key={item.slug}
          href={`/${locale}/r/${item.slug}`}
          id={item.id}
          name={item.name}
          description={item.description}
          meta={item.tags.join(' · ')}
          badges={item.openSource ? <TagChip tone="brand">{labels.oss}</TagChip> : null}
          aside={item.pricing === 'TODO' ? null : <TagChip>{labels.pricing[item.pricing]}</TagChip>}
        />
      ))}
    </ResourceList>
  );
}
