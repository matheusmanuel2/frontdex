import path from 'node:path';

import tailwind from '@tailwindcss/postcss';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

// Compila o globals.css real com um conjunto fixo de classes candidatas.
async function compile(classes: string[]): Promise<string> {
  const from = path.join(process.cwd(), 'styles/__probe__.css');
  const input = `@import './globals.css';\n@source inline("${classes.join(' ')}");\n@source not "../**/*";`;
  const result = await postcss([tailwind({ base: path.join(process.cwd(), 'styles') })]).process(input, { from });
  return result.css;
}

const has = (css: string, className: string) => new RegExp(`\\.${className.replace(/[-/]/g, '\\$&')}\\s*\\{`).test(css);

describe('Tailwind sobre os tokens', () => {
  it('não gera a paleta, os raios nem as sombras padrão', async () => {
    const forbidden = [
      'bg-indigo-500',
      'text-purple-600',
      'from-violet-500',
      'bg-white',
      'rounded-lg',
      'rounded-md',
      'shadow-lg',
      'font-serif',
      'text-xl',
      'backdrop-blur-md',
    ];
    const css = await compile(forbidden);
    expect(forbidden.filter((className) => has(css, className))).toEqual([]);
  });

  it('gera os utilitários dos tokens', async () => {
    const allowed = [
      'bg-carbon',
      'bg-ink',
      'text-secondary',
      'text-muted',
      'text-primary',
      'rounded-pill',
      'rounded-card',
      'font-mono',
      'text-h1',
      'border-border',
    ];
    const css = await compile(allowed);
    expect(allowed.filter((className) => !has(css, className))).toEqual([]);
    expect(css).toMatch(/\.bg-carbon\s*\{\s*background-color:\s*var\(--color-carbon\)/);
    expect(css).toMatch(/\.text-secondary\s*\{\s*color:\s*var\(--color-text-secondary\)/);
  });

  it('o espaço segue a base de 4px', async () => {
    const css = await compile(['p-4']);
    expect(css).toMatch(/\.p-4\s*\{\s*padding:\s*calc\(4px \* 4\)/);
  });
});
