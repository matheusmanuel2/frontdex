import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { runValidate } from './validate';

const fixtures = path.join(process.cwd(), 'tests/fixtures/content');
const failing = readdirSync(fixtures, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== 'valid')
  .map((entry) => entry.name);

describe('pnpm validate', () => {
  it('passa com data/ e com o fixture válido', () => {
    expect(runValidate(path.join(process.cwd(), 'data')).ok).toBe(true);
    expect(runValidate(path.join(fixtures, 'valid/data')).ok).toBe(true);
  });

  it.each(failing)('falha com o fixture %s', (fixture) => {
    const report = runValidate(path.join(fixtures, fixture, 'data'));
    expect(report.ok).toBe(false);
    expect(report.lines.some((line) => /^✗ data\/.+ › .+ › .+/.test(line))).toBe(true);
  });

  it('termina com código 1 quando há erros', () => {
    const run = () =>
      execFileSync('pnpm', ['exec', 'tsx', 'scripts/validate.ts', path.join(fixtures, 'unknown-tag/data')], {
        stdio: 'pipe',
      });
    expect(run).toThrow();
  });
});
