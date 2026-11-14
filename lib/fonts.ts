/**
 * Geist + Geist Mono (decisions/0005, spec 004, T-303).
 * Servidas pelo próprio site via next/font (sem pedidos ao Google Fonts),
 * só com os pesos que a interface usa: 400 (títulos e corpo), 500 (navegação), 600 (botões).
 */
import localFont from 'next/font/local';

export const geistSans = localFont({
  src: [
    { path: '../node_modules/geist/dist/fonts/geist-sans/Geist-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../node_modules/geist/dist/fonts/geist-sans/Geist-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-geist-sans',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export const geistMono = localFont({
  src: [
    { path: '../node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../node_modules/geist/dist/fonts/geist-mono/GeistMono-Medium.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-geist-mono',
  display: 'swap',
  preload: false,
  fallback: ['ui-monospace', 'monospace'],
});

/** Classes que expõem as variáveis --font-geist-* ao <html>. */
export const fontVariables = `${geistSans.variable} ${geistMono.variable}`;
