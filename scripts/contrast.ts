/**
 * `pnpm contrast` — escreve docs/design/contrast.md com a tabela de contraste AA
 * dos tokens nos dois temas (spec 004, T-301). `--check` falha se o ficheiro
 * estiver desatualizado ou se alguma combinação não passar.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { contrastTable, type Row } from '../lib/design/contrast';

const OUT = path.join(process.cwd(), 'docs/design/contrast.md');

function table(rows: Row[]): string {
  const lines = ['| Texto | Fundo | Razão | Mínimo | Resultado | Uso |', '| --- | --- | --- | --- | --- | --- |'];
  for (const row of rows) {
    lines.push(
      `| \`--color-${row.text}\` | \`--color-${row.background}\`${row.over ? ` sobre \`--color-${row.over}\`` : ''} | ${row.ratio.toFixed(2)}:1 | ${row.min}:1 | ${row.pass ? 'passa' : '**falha**'} | ${row.use} |`,
    );
  }
  return lines.join('\n');
}

export function buildContrastDoc(): string {
  const rows = contrastTable();
  return `# Contraste AA dos tokens

Gerado por \`pnpm contrast\` a partir de \`styles/tokens.css\`. Não editar à mão.

Critério: WCAG 2.2 AA. Texto normal precisa de 4,5:1. Texto grande (≥ 24px, ou ≥ 18,66px em 600) e elementos que não são texto (foco, contornos, pontos de estado) precisam de 3:1.

## Tema dark (padrão)

${table(rows.filter((row) => row.theme === 'dark'))}

## Tema light (proposta, decisão D-07)

${table(rows.filter((row) => row.theme === 'light'))}

### O que mudou face ao rascunho do kit

- \`--color-title-muted\`: #8B93A1 → **#6B7280**. O valor do rascunho dava 2,91:1 sobre Paper, abaixo dos 3:1 para texto grande.
- \`--color-text-muted\`: #666E7C → **#5F6673**. O rascunho ficava exatamente em 4,50:1 sobre Graphite, sem margem.
- Botão primário: no dark é a pílula branca da spec. No light a pílula branca some no fundo Paper, por isso proponho pílula Ink (#0A0B0D) com texto Paper.
- Links e foco no light: Index Blue (#1463FF), como já dizia o rascunho.
`;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (isMain) {
  const next = buildContrastDoc();
  const failing = contrastTable().filter((row) => !row.pass);
  for (const row of failing)
    console.error(
      `✗ ${row.theme} › --color-${row.text} sobre --color-${row.background} › ${row.ratio.toFixed(2)}:1 < ${row.min}:1`,
    );
  if (process.argv.includes('--check')) {
    const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
    if (current !== next) console.error('✗ docs/design/contrast.md está desatualizado. Corre pnpm contrast.');
    process.exitCode = failing.length > 0 || current !== next ? 1 : 0;
    if (process.exitCode === 0)
      console.log('✓ Contraste AA: todas as combinações passam e o relatório está atualizado.');
  } else {
    writeFileSync(OUT, next);
    console.log(`✓ docs/design/contrast.md gerado (${failing.length} falhas).`);
    process.exitCode = failing.length > 0 ? 1 : 0;
  }
}
