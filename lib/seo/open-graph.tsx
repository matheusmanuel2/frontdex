import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

import type { AppLocale } from '@/lib/i18n/routing';

export const OPEN_GRAPH_SIZE = { width: 1200, height: 630 };

type OpenGraphInput = {
  locale: AppLocale;
  eyebrow: string;
  title: string;
  description: string;
  id?: number;
};

type OpenGraphAssets = {
  fonts: { name: string; data: Buffer; weight: 400; style: 'normal' }[];
  colors: { background: string; primary: string; secondary: string; accent: string };
  sizes: { padding: number; gap: number; inset: number; title: number; description: number; label: number };
  titleLineHeight: number;
  bodyLineHeight: number;
  titleTracking: string;
};

let assetsPromise: Promise<OpenGraphAssets> | undefined;

function loadAssets(): Promise<OpenGraphAssets> {
  assetsPromise ??= Promise.all([
    readFile(join(process.cwd(), 'node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf')),
    readFile(join(process.cwd(), 'node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf')),
    readFile(join(process.cwd(), 'styles/tokens.css'), 'utf8'),
  ]).then(([geist, mono, css]) => {
    const token = (name: string) => {
      const value = new RegExp(`--${name}:\\s*([^;]+);`).exec(css)?.[1]?.trim();
      if (!value) throw new Error(`Token de design --${name} não encontrado em styles/tokens.css`);
      return value;
    };
    const pixels = (name: string) => {
      const value = token(name);
      const unit = value.match(/([\d.]+)(rem|px)/g)?.at(-1);
      if (!unit) throw new Error(`Token --${name} não tem um tamanho em px/rem: ${value}`);
      const amount = Number.parseFloat(unit);
      return unit.endsWith('rem') ? amount * 16 : amount;
    };

    return {
      fonts: [
        { name: 'Geist', data: geist, weight: 400, style: 'normal' },
        { name: 'Geist Mono', data: mono, weight: 400, style: 'normal' },
      ],
      colors: {
        background: token('color-ink-hero'),
        primary: token('color-paper'),
        secondary: token('color-text-secondary'),
        accent: token('color-index-blue-light'),
      },
      sizes: {
        padding: pixels('space-16'),
        gap: pixels('space-6'),
        inset: pixels('space-3'),
        title: pixels('text-h1'),
        description: pixels('text-h3'),
        label: pixels('text-small'),
      },
      titleLineHeight: Number(token('leading-title')),
      bodyLineHeight: Number(token('leading-body')),
      titleTracking: token('tracking-title'),
    };
  });

  return assetsPromise;
}

export async function createOpenGraphImage({ locale, eyebrow, title, description, id }: OpenGraphInput) {
  const assets = await loadAssets();
  const label = id === undefined ? eyebrow : `#${String(id).padStart(4, '0')}`;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: assets.sizes.padding,
        backgroundColor: assets.colors.background,
        color: assets.colors.primary,
        fontFamily: 'Geist',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Geist Mono', fontSize: assets.sizes.label }}>FRONTDEX</span>
        <span style={{ color: assets.colors.secondary, fontFamily: 'Geist Mono', fontSize: assets.sizes.label }}>
          {locale === 'pt' ? 'PT-BR / INDEX' : 'EN / INDEX'}
        </span>
      </header>
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: assets.sizes.gap,
          flex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: assets.sizes.inset }}>
          <span
            style={{
              width: assets.sizes.inset,
              height: assets.sizes.inset,
              borderRadius: assets.sizes.inset,
              backgroundColor: assets.colors.accent,
            }}
          />
          <span style={{ color: assets.colors.accent, fontFamily: 'Geist Mono', fontSize: assets.sizes.label }}>
            {label}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: assets.sizes.inset }}>
          <h1
            style={{
              margin: 0,
              fontSize: assets.sizes.title,
              fontWeight: 400,
              lineHeight: assets.titleLineHeight,
              letterSpacing: assets.titleTracking,
            }}
          >
            {title}
          </h1>
          {description ? (
            <p
              style={{
                maxWidth: 960,
                margin: 0,
                color: assets.colors.secondary,
                fontSize: assets.sizes.description,
                lineHeight: assets.bodyLineHeight,
              }}
            >
              {description}
            </p>
          ) : null}
        </div>
      </main>
      <footer
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: assets.colors.secondary,
          fontFamily: 'Geist Mono',
          fontSize: assets.sizes.label,
        }}
      >
        <span>FrontDex</span>
        <span>{locale === 'pt' ? 'FEITO EM ANGOLA' : 'MADE IN ANGOLA'}</span>
      </footer>
    </div>,
    {
      ...OPEN_GRAPH_SIZE,
      fonts: assets.fonts,
    },
  );
}
