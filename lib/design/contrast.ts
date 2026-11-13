/**
 * Contraste WCAG entre os tokens de cor (spec 004, T-301).
 * Lê styles/tokens.css, resolve cada tema e calcula a razão de contraste
 * das combinações texto × fundo que a interface usa.
 */
// eslint-disable-next-line no-restricted-imports -- lê styles/tokens.css (não data/)
import { readFileSync } from 'node:fs';
import path from 'node:path';

export type Theme = 'dark' | 'light';
/** `over`: fundo opaco por baixo de um `background` translúcido (para compor a cor). */
export type Pair = { text: string; background: string; min: number; use: string; over?: string };

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
  { text: 'button-brand-text', background: 'index-blue-hover', min: 4.5, use: 'Botão de marca em hover' },
  { text: 'button-primary-bg', background: 'ink', min: 3, use: 'Contorno do botão primário na página' },
  { text: 'signal-orange', background: 'ink-hero', min: 3, use: 'Ponto de status no hero (não-texto)' },
  { text: 'paper', background: 'ink-hero', min: 4.5, use: 'Texto do hero (o hero é sempre escuro)' },
  { text: 'text-primary', background: 'list', min: 4.5, use: 'Nome do recurso nas listas' },
  { text: 'text-secondary', background: 'list', min: 4.5, use: 'Descrição nas listas' },
  { text: 'text-muted', background: 'list', min: 4.5, use: 'ID e tags nas listas' },
  { text: 'text-secondary', background: 'row-hover', min: 4.5, use: 'Descrição numa linha em hover' },
  { text: 'text-muted', background: 'row-hover', min: 4.5, use: 'ID numa linha em hover' },
  { text: 'link-hover', background: 'ink', min: 4.5, use: 'Link em hover' },
  { text: 'brand-tint-text', background: 'brand-tint', over: 'list', min: 4.5, use: 'Chip de marca (OSS) nas listas' },
  { text: 'brand-tint-text', background: 'brand-tint', over: 'carbon', min: 4.5, use: 'Chip de marca (OSS) em cards' },
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

/** Lê `rgb(r g b / a)` ou hex; devolve cor e alfa. */
export function resolveRgba(
  vars: Record<string, string>,
  token: string,
): { rgb: [number, number, number]; alpha: number } {
  const raw = vars[`color-${token}`] ?? '';
  const match = raw.match(/^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\s*\)$/);
  if (match) {
    const [, r, g, b, a] = match;
    return { rgb: [Number(r), Number(g), Number(b)], alpha: Number(a) };
  }
  return { rgb: resolveColor(vars, token), alpha: 1 };
}

/** Compõe uma cor translúcida sobre um fundo opaco. */
export function composite(top: { rgb: [number, number, number]; alpha: number }, base: [number, number, number]) {
  return top.rgb.map((channel, i) => Math.round(channel * top.alpha + (base[i] ?? 0) * (1 - top.alpha))) as [
    number,
    number,
    number,
  ];
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
      const background = pair.over
        ? composite(resolveRgba(vars, pair.background), resolveColor(vars, pair.over))
        : resolveColor(vars, pair.background);
      const ratio = contrast(resolveColor(vars, pair.text), background);
      return { ...pair, theme, ratio, pass: ratio >= pair.min };
    }),
  );
}
