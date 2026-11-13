'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';

import { trackUmamiEvent } from '@/lib/analytics/umami';

import type { SearchLabels } from './labels';

// O diálogo (e o índice do Pagefind) só carregam na primeira abertura (spec 008).
const CommandMenuDialog = dynamic(() => import('./CommandMenuDialog').then((module) => module.CommandMenuDialog), {
  ssr: false,
});

type Props = { locale: string; labels: SearchLabels };

function isTyping(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return Boolean(element && (element.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)));
}

/**
 * Ilha da busca (spec 003/008): abre o ⌘K com ⌘K, Ctrl+K, `/` e com qualquer link
 * marcado com `data-search-trigger` (botão do cabeçalho, do hero, da 404). Sem JS, esses
 * links levam a /[locale]/search.
 */
export function CommandMenuLauncher({ locale, labels }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);

  const show = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setMounted(true);
    setOpen(true);
    trackUmamiEvent('search_open');
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (open) setOpen(false);
        else show();
      } else if (event.key === '/' && !open && !isTyping(event.target)) {
        event.preventDefault();
        show();
      }
    };
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const trigger = (event.target as HTMLElement | null)?.closest('[data-search-trigger]');
      if (!trigger) return;
      // Captura: corre antes do <Link> do Next, que navegaria para /search.
      event.preventDefault();
      event.stopPropagation();
      show();
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick, true);
    };
  }, [open, show]);

  if (!mounted) return null;
  return (
    <CommandMenuDialog open={open} onOpenChange={setOpen} locale={locale} labels={labels} returnFocus={returnFocus} />
  );
}
