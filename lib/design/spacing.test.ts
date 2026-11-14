import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.tsx$/.test(entry.name) && !entry.name.includes('.test.') ? [full] : [];
  });
}

// Spec 004: espaço em múltiplos de 4px. Com --spacing: 4px, os passos `.5` dão 2/6/10/14px.
const HALF_STEP = /\b(?:-?(?:m|p|gap|inset|top|right|bottom|left|space)[xytrblse]?-\d+\.5)\b/;

describe('espaço em múltiplos de 4px', () => {
  it('nenhum componente usa passos de meio (p-1.5, gap-2.5…)', () => {
    const offending = ['components', 'app'].flatMap(walk).flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .map((line, index) => ({ file, line: index + 1, text: line }))
        .filter(({ text }) => HALF_STEP.test(text))
        .map(({ file, line }) => `${file}:${line}`),
    );
    expect(offending).toEqual([]);
  });
});
