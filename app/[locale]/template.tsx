import { ViewTransition } from 'react';

import type { ReactNode } from 'react';

/**
 * Transição entre páginas (spec 003, recipe 08 · Page side-by-side).
 * O template volta a montar em cada navegação, por isso a página que sai faz `exit`
 * e a que entra faz `enter`. Mudanças só de query (filtros, busca) não remontam o
 * template e não animam. A animação está em `styles/motion.css` (`.t-page`).
 */
export default function LocaleTemplate({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="t-page" exit="t-page" default="none">
      {children}
    </ViewTransition>
  );
}
