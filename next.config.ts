import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';

import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');
// Páginas longas (Contribuir, Sobre) em MDX por idioma, em content/pages (spec 007).
const withMDX = createMDX({});

/**
 * Páginas `*.dev.tsx` (por exemplo /[locale]/_design, T-308) só existem em `next dev`.
 * No build de produção não são rotas e não são geradas.
 */
const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: isDev ? ['dev.tsx', 'tsx', 'ts'] : ['tsx', 'ts'],
};

export default withNextIntl(withMDX(nextConfig));
