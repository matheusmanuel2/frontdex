import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { findMotionViolations } from './motion';

const ROOTS = ['app', 'components', 'lib', 'styles'];
const EXTENSIONS = /\.(css|tsx?|mdx?)$/;

function walk(dir: string): string[] {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return EXTENSIONS.test(entry.name) && !entry.name.includes('.test.') ? [full] : [];
  });
}

describe('movimento só pelos recipes', () => {
  it('nenhum ficheiro tem durações, easings ou @keyframes fora de styles/motion.css', () => {
    const violations = ROOTS.flatMap(walk).flatMap((file) =>
      findMotionViolations(file.split(path.sep).join('/'), readFileSync(file, 'utf8')),
    );
    expect(violations.map((violation) => `${violation.file}:${violation.line} › ${violation.rule}`)).toEqual([]);
  });

  it('apanha as violações típicas', () => {
    expect(findMotionViolations('x.css', '@keyframes fade { }')).toHaveLength(1);
    expect(findMotionViolations('x.css', 'a { transition: color 200ms ease; }')).toHaveLength(1);
    expect(findMotionViolations('x.css', 'a { transition: color var(--hover-dur) var(--hover-ease); }')).toEqual([]);
    expect(findMotionViolations('x.tsx', '<div className="duration-300 animate-spin" />')).toHaveLength(2);
    expect(findMotionViolations('x.tsx', 'transition={{ duration: 0.2 }}')).toHaveLength(1);
    expect(findMotionViolations('styles/motion.css', '@keyframes ok {}')).toEqual([]);
  });

  it('cada recipe tem guarda de prefers-reduced-motion', () => {
    const css = readFileSync('styles/motion.css', 'utf8');
    const recipes = [...new Set([...css.matchAll(/^\.(t-[\w-]+)\s*[{,]/gm)].map((match) => match[1]))];
    const guard = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(recipes.filter((recipe) => !guard.includes(`.${recipe}`))).toEqual([]);
  });
});
