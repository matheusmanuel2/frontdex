/**
 * `pnpm validate [pasta-data]` — valida todo o conteúdo de data/ (spec 001).
 * Erros saem como `ficheiro › campo › motivo` e terminam com código 1.
 * Avisos não fazem falhar.
 */
import path from 'node:path';

import { readRawContent } from '../lib/content/read';
import { formatError, validateContent, type ValidationResult } from '../lib/content/validate';

export type ValidateReport = { ok: boolean; lines: string[]; result: ValidationResult };

export function runValidate(dataDir: string): ValidateReport {
  const result = validateContent(readRawContent(dataDir));
  const { errors, warnings, content } = result;
  const lines: string[] = [];

  for (const error of errors) lines.push(`✗ ${formatError(error)}`);
  for (const warning of warnings) lines.push(`! ${formatError(warning)}`);

  const active = content.resources.filter((resource) => resource.status === 'active').length;
  const draft = content.resources.filter((resource) => resource.status === 'draft').length;
  lines.push(
    errors.length === 0
      ? `✓ Conteúdo válido: ${active} recursos active, ${draft} draft, ${content.collections.length} coleções, ${warnings.length} avisos.`
      : `✗ ${errors.length} ${errors.length === 1 ? 'erro' : 'erros'} em data/. Corrige e corre pnpm validate de novo.`,
  );

  return { ok: errors.length === 0, lines, result };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (isMain) {
  const dataDir = path.resolve(process.argv[2] ?? 'data');
  const report = runValidate(dataDir);
  for (const line of report.lines) (line.startsWith('✗') ? console.error : console.log)(line);
  process.exitCode = report.ok ? 0 : 1;
}
