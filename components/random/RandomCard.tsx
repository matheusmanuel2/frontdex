'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import { ArrowUpRightIcon, ShuffleIcon } from '@/components/icons';
import { IndexId, TagChip } from '@/components/index';
import { trackUmamiEvent } from '@/lib/analytics/umami';

export type RandomItem = {
  slug: string;
  id?: number;
  name: string;
  url: string;
  host: string;
  description: string;
  why?: string;
  /** "Construir / Animação" já traduzido. */
  place: string;
  /** "Grátis · MIT" já traduzido. */
  badge?: string;
};

type Labels = { open: string; another: string; visit: string; footer: string };

function subscribe() {
  return () => {};
}

/**
 * Card da Surpresa (T-508, decisão D-01): a lista vem do build e a escolha é feita
 * no browser (sem servidor). Sem JS, mostra o primeiro da lista.
 */
export function RandomCard({ items, locale, labels }: { items: RandomItem[]; locale: string; labels: Labels }) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [index, setIndex] = useState<number | null>(null);

  const pick = useCallback(() => {
    setIndex((current) => {
      if (items.length < 2) return 0;
      let next = Math.floor(Math.random() * items.length);
      if (next === current) next = (next + 1) % items.length;
      return next;
    });
    trackUmamiEvent('random');
  }, [items.length]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.key.toLowerCase() !== 'r' || event.metaKey || event.ctrlKey || event.altKey) return;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      pick();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pick]);

  // Sorteia ao montar (cada visita, também por navegação client-side). O HTML estático mostra o primeiro.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- o sorteio só pode acontecer no browser
    setIndex(Math.floor(Math.random() * items.length));
  }, [items.length]);

  const current = items[hydrated ? (index ?? 0) : 0];
  if (!current) return null;

  return (
    <>
      <article
        aria-live="polite"
        className="mx-auto mt-12 max-w-3xl rounded-card border border-border bg-carbon p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-mono text-muted">
            {current.id !== undefined ? (
              <>
                <IndexId id={current.id} /> ·{' '}
              </>
            ) : null}
            {current.place}
          </span>
          {current.badge ? <TagChip tone="brand">{current.badge}</TagChip> : null}
        </div>
        <div className="mt-7 flex items-center gap-4">
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-panel bg-graphite font-mono text-h3 text-primary"
          >
            {current.name.charAt(0).toLowerCase()}
          </span>
          <div className="min-w-0">
            <h2 className="title-card text-primary">{current.name}</h2>
            <p className="mt-1 truncate font-mono text-mono text-muted">{current.host}</p>
          </div>
        </div>
        <p className="mt-6 text-h3 font-normal text-primary">{current.description}</p>
        {current.why ? <p className="mt-3 text-body text-secondary">{current.why}</p> : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`/${locale}/r/${current.slug}`}
            className="t-hover inline-flex h-10 items-center rounded-pill bg-button-primary px-5 text-small font-semibold text-button-primary-text hover:opacity-90"
          >
            {labels.open}
          </a>
          {hydrated ? (
            <button
              type="button"
              onClick={pick}
              className="t-hover t-icon-host inline-flex h-10 items-center gap-2 rounded-pill border border-border-strong px-5 text-small text-primary hover:bg-graphite"
            >
              <ShuffleIcon size={16} />
              {labels.another}
            </button>
          ) : null}
          <a
            href={current.url}
            rel="noopener"
            data-umami-event="resource_outbound"
            data-umami-event-slug={current.slug}
            data-umami-event-target="website"
            className="t-hover t-icon-host inline-flex h-10 items-center gap-2 rounded-pill border border-border-strong px-5 text-small text-primary hover:bg-graphite"
          >
            {labels.visit}
            <ArrowUpRightIcon size={16} />
          </a>
        </div>
      </article>
      <p className="mt-5 text-center font-mono text-mono text-muted">{labels.footer}</p>
    </>
  );
}
