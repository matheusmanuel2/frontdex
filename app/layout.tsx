import type { ReactNode } from 'react';

/**
 * O <html> vive em app/[locale]/layout.tsx (precisa do idioma para o `lang`).
 * Este layout só existe porque o Next exige um na raiz.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
