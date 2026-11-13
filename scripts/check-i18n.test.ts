import { execFileSync } from 'node:child_process';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { checkMessages } from './check-i18n';

const fixtures = path.join(process.cwd(), 'tests/fixtures/i18n');

describe('pnpm check:i18n', () => {
  it('passa com messages/ e com o fixture válido', () => {
    expect(checkMessages(path.join(process.cwd(), 'messages'))).toEqual([]);
    expect(checkMessages(path.join(fixtures, 'valid'))).toEqual([]);
  });

  it('falha quando falta uma chave num idioma', () => {
    expect(checkMessages(path.join(fixtures, 'missing-key'))).toEqual(['messages/en.json › nav.add › chave em falta']);
  });

  it('termina com código 1 (faz o CI falhar)', () => {
    const run = () =>
      execFileSync('pnpm', ['exec', 'tsx', 'scripts/check-i18n.ts', path.join(fixtures, 'missing-key')], {
        stdio: 'pipe',
      });
    expect(run).toThrow();
  });
});
