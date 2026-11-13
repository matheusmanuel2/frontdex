import type { NextConfig } from 'next';

/**
 * Páginas `*.dev.tsx` (por exemplo /_design, T-308) só existem em `next dev`.
 * No build de produção não são rotas e não são geradas.
 */
const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: isDev ? ['dev.tsx', 'tsx', 'ts'] : ['tsx', 'ts'],
};

export default nextConfig;
