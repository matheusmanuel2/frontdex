'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** Barras laterais de categoria montadas agora (no máximo uma, durante a troca há duas). */
let mounted = 0;

/**
 * Lista da barra lateral da categoria (spec 003). Entra em sequência quando a tela
 * de categoria abre; ao trocar de categoria pela própria barra, a barra anterior
 * ainda está montada no render da nova, por isso a lista aparece parada e só o
 * conteúdo anima. No servidor (SSG) e na hidratação, `mounted` é 0: anima.
 */
export function SidebarList({ className, children }: { className?: string; children: ReactNode }) {
  const [reveal] = useState(() => mounted === 0);
  useEffect(() => {
    mounted += 1;
    return () => {
      mounted -= 1;
    };
  }, []);
  return <ul className={cn(reveal && 't-reveal-list', className)}>{children}</ul>;
}
