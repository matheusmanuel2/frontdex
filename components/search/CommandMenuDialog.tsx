'use client';

import { Dialog as DialogPrimitive } from 'radix-ui';
import { useEffect, useId, useMemo, useRef, useState, type RefObject } from 'react';

import { ArrowRightIcon, SearchIcon } from '@/components/icons';
import { IndexId } from '@/components/index';
import { loadPagefind, search, type SearchHit } from '@/lib/search/pagefind';
import { cn } from '@/lib/utils';

import type { SearchLabels } from './labels';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
  labels: SearchLabels;
  returnFocus: RefObject<HTMLElement | null>;
};

type Item = {
  key: string;
  group: 'resources' | 'categories' | 'shortcuts';
  href: string;
  externalUrl?: string;
  hit?: SearchHit;
  label?: string;
};

/**
 * Menu de busca ⌘K (spec 008, mockup CommandK): Dialog da Watermelon re-tematizado,
 * sem blur. Grupos Recursos, Categorias e Atalhos. Enter abre; ⌘Enter abre o site do recurso.
 */
export function CommandMenuDialog({ open, onOpenChange, locale, labels, returnFocus }: Props) {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadPagefind().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    search(query).then((results) => {
      if (cancelled) return;
      setHits(results);
      setActive(0);
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const shortcuts: Item[] = useMemo(
    () => [
      { key: 's1', group: 'shortcuts', label: labels.s1, href: `/${locale}/c/icons` },
      { key: 's2', group: 'shortcuts', label: labels.s2, href: `/${locale}/search?q=react` },
      { key: 's3', group: 'shortcuts', label: labels.s3, href: `/${locale}/c/animation` },
      { key: 's4', group: 'shortcuts', label: labels.s4, href: `/${locale}/c/courses?pricing=free` },
    ],
    [labels, locale],
  );

  const items: Item[] = query.trim()
    ? [
        ...hits
          .filter((hit) => hit.kind === 'resource')
          .map((hit) => ({
            key: hit.url,
            group: 'resources' as const,
            href: hit.url,
            externalUrl: hit.externalUrl,
            hit,
          })),
        ...hits
          .filter((hit) => hit.kind === 'category')
          .map((hit) => ({ key: hit.url, group: 'categories' as const, href: hit.url, hit })),
      ]
    : shortcuts;

  const go = (item: Item | undefined, external: boolean) => {
    if (!item) return;
    if (external && item.externalUrl) window.open(item.externalUrl, '_blank', 'noopener');
    else window.location.assign(item.href);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, items.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(items[active], event.metaKey || event.ctrlKey);
    }
  };

  const groups = (['resources', 'categories', 'shortcuts'] as const)
    .map((group) => ({ group, entries: items.filter((item) => item.group === group) }))
    .filter(({ entries }) => entries.length > 0);
  const activeItem = items[active];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="t-modal-overlay fixed inset-0 z-50 bg-overlay" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocus.current?.focus();
          }}
          className="t-modal fixed inset-x-4 top-[12vh] z-50 mx-auto flex max-h-[76vh] max-w-2xl flex-col overflow-hidden rounded-card border border-border-strong bg-carbon text-primary"
        >
          <DialogPrimitive.Title className="sr-only">{labels.label}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">{labels.hint}</DialogPrimitive.Description>
          <div className="flex items-center gap-3 border-b border-border px-5">
            <SearchIcon size={18} className="text-muted" motion="none" />
            <input
              ref={inputRef}
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={activeItem ? `${listId}-${activeItem.key}` : undefined}
              aria-autocomplete="list"
              aria-label={labels.label}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder={labels.placeholder}
              className="h-14 min-w-0 flex-1 bg-transparent text-body text-primary outline-none placeholder:text-muted"
            />
            <kbd className="rounded-pill bg-graphite px-2 py-1 font-mono text-mono text-muted">Esc</kbd>
          </div>

          <div id={listId} role="listbox" aria-label={labels.label} className="min-h-0 flex-1 overflow-y-auto p-2">
            {query.trim() && !ready ? <p className="px-3 py-4 text-small text-muted">{labels.loading}</p> : null}
            {query.trim() && ready && items.length === 0 ? (
              <p className="px-3 py-4 text-small text-secondary">{labels.empty.replace('{q}', query.trim())}</p>
            ) : null}
            {groups.map(({ group, entries }) => (
              <div key={group} role="group" aria-label={labels[group]} className="mb-2">
                <p aria-hidden="true" className="label-mono px-3 pt-2 pb-1 text-muted">
                  {labels[group]}
                </p>
                {entries.map((item) => {
                  const index = items.indexOf(item);
                  const selected = index === active;
                  return (
                    <a
                      key={item.key}
                      id={`${listId}-${item.key}`}
                      role="option"
                      aria-selected={selected}
                      href={item.href}
                      tabIndex={-1}
                      onMouseMove={() => setActive(index)}
                      onClick={(event) => {
                        event.preventDefault();
                        go(item, event.metaKey || event.ctrlKey);
                      }}
                      className={cn(
                        't-hover t-icon-host flex items-center gap-4 rounded-panel px-3 py-3',
                        selected ? 'bg-graphite text-primary' : 'text-secondary',
                      )}
                    >
                      {item.hit ? (
                        <>
                          <span className="w-12 shrink-0">
                            <IndexId id={item.hit.id} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-body font-medium text-primary">{item.hit.title}</span>
                            <span className="block truncate text-small text-secondary">
                              {item.hit.description ?? item.hit.excerpt.replace(/<[^>]+>/g, '')}
                            </span>
                          </span>
                          {item.hit.category ? (
                            <span className="hidden shrink-0 font-mono text-mono text-muted sm:block">
                              {item.hit.category}
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-body">{item.label}</span>
                          <ArrowRightIcon size={16} className="text-muted" />
                        </>
                      )}
                    </a>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-3">
            <p className="font-mono text-mono text-muted">{labels.hint}</p>
            {query.trim() ? (
              <a href={`/${locale}/search?q=${encodeURIComponent(query.trim())}`} className="link-inline text-small">
                {labels.seeAll}
              </a>
            ) : null}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
