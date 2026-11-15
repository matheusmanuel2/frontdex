import { SITE_URL } from '@/lib/seo/metadata';

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

/**
 * Metadados comuns a todas as páginas, incluindo a 404 (spec 009).
 * Os ícones vivem em public/ com URLs estáveis (requisito do Google para o favicon).
 * A verificação do Search Console e do Bing vem de variáveis de ambiente (spec 009 §7).
 */
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;
const bingVerification = process.env.BING_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'FrontDex',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(bingVerification ? { other: { 'msvalidate.01': bingVerification } } : {}),
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0b0d',
};

/**
 * O <html> vive em app/[locale]/layout.tsx (precisa do idioma para o `lang`).
 * Este layout só existe porque o Next exige um na raiz.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
