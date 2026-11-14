import { SITE_URL } from '@/lib/seo/metadata';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

/**
 * O <html> vive em app/[locale]/layout.tsx (precisa do idioma para o `lang`).
 * Este layout só existe porque o Next exige um na raiz.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
