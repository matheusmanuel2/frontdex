/**
 * Contraste WCAG entre os tokens de cor (spec 004, T-301).
 * Lê styles/tokens.css, resolve cada tema e calcula a razão de contraste
 * das combinações texto × fundo que a interface usa.
 */
// eslint-disable-next-line no-restricted-imports -- lê styles/tokens.css (não data/)
import { readFileSync } from 'node:fs';
import path from 'node:path';

export type Theme = 'dark' | 'light';
export type Pair = { text: string; background: string; min: number; use: string };

/** Combinações usadas. `min` 4.5 = texto normal (AA); 3 = texto grande, ícones e foco (AA 1.4.11). */
export const PAIRS: Pair[] = [
  { text: 'text-primary', background: 'ink', min: 4.5, use: 'Texto principal na página' },
  { text: 'text-primary', background: 'carbon', min: 4.5, use: 'Texto principal em cards e painéis' },
  { text: 'text-primary', background: 'graphite', min: 4.5, use: 'Texto em chips e superfícies elevadas' },
  { text: 'text-secondary', background: 'ink', min: 4.5, use: 'Descrições na página' },
  { text: 'text-secondary', background: 'carbon', min: 4.5, use: 'Descrições em listas' },
  { text: 'text-secondary', background: 'graphite', min: 4.5, use: 'Descrições em superfícies elevadas' },
  { text: 'text-muted', background: 'ink', min: 4.5, use: 'Labels e metadados na página' },
  { text: 'text-muted', background: 'carbon', min: 4.5, use: 'IDs e metadados em listas' },
  { text: 'text-muted', background: 'graphite', min: 4.5, use: 'Metadados em chips' },
  { text: 'title-muted', background: 'ink', min: 3, use: 'Segunda linha dos títulos (texto grande ≥ 24px)' },
  { text: 'link', background: 'ink', min: 4.5, use: 'Links na página' },
  { text: 'link', background: 'carbon', min: 4.5, use: 'Links em cards' },
  { text: 'focus', background: 'ink', min: 3, use: 'Anel de foco na página' },
  { text: 'focus', background: 'carbon', min: 3, use: 'Anel de foco em cards' },
  { text: 'button-primary-text', background: 'button-primary-bg', min: 4.5, use: 'Botão primário' },
  { text: 'button-secondary-text', background: 'button-secondary-bg', min: 4.5, use: 'Botão secundário' },
  { text: 'button-brand-text', background: 'index-blue', min: 4.5, use: 'Botão de marca (Index Blue)' },
  { text: 'button-primary-bg', background: 'ink', min: 3, use: 'Contorno do botão primário na página' },
  { text: 'signal-orange', background: 'ink-hero', min: 3, use: 'Ponto de status no hero (não-texto)' },
  { text: 'paper', background: 'ink-hero', min: 4.5, use: 'Texto do hero (o hero é sempre escuro)' },
];

const TOKENS_PATH = path.join(process.cwd(), 'styles/tokens.css');

function block(css: string, selectorPattern: RegExp): Record<string, string> {
  const match = css.match(selectorPattern);
  if (!match?.[1]) return {};
  const vars: Record<string, string> = {};
  for (const [, name, value] of match[1].matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    if (name && value) vars[name] = value.trim();
  }
  return vars;
}

export function readThemes(css = readFileSync(TOKENS_PATH, 'utf8')): Record<Theme, Record<string, string>> {
  const dark = block(css, /:root,\s*\[data-theme="dark"\]\s*\{([^}]*)\}/);
  const light = { ...dark, ...block(css, /\[data-theme="light"\]\s*\{([^}]*)\}/) };
  return { dark, light };
}

/** Resolve `var(--x)` e converte hex para RGB. */
export function resolveColor(vars: Record<string, string>, token: string, depth = 0): [number, number, number] {
  const raw = vars[`color-${token}`] ?? vars[token];
  if (!raw) throw new Error(`token --color-${token} não existe`);
  const ref = raw.match(/^var\(--([\w-]+)\)$/);
  if (ref?.[1] && depth < 5) return resolveColor(vars, ref[1].replace(/^color-/, ''), depth + 1);
  const hex = raw.match(/^#([0-9a-f]{6})$/i)?.[1];
  if (!hex) throw new Error(`--color-${token}: só cores hex opacas entram no cálculo (valor: ${raw})`);
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

function luminance([r, g, b]: [number, number, number]): number {
  const [R, G, B] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

export type Row = Pair & { theme: Theme; ratio: number; pass: boolean };

export function contrastTable(themes = readThemes()): Row[] {
  return (['dark', 'light'] as const).flatMap((theme) =>
    PAIRS.map((pair) => {
      const vars = themes[theme];
      const ratio = contrast(resolveColor(vars, pair.text), resolveColor(vars, pair.background));
      return { ...pair, theme, ratio, pass: ratio >= pair.min };
    }),
  );
}
