import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const dir = path.join(process.cwd(), 'components/ui');
const files = readdirSync(dir).filter((name) => name.endsWith('.tsx'));

// Classes de tema do shadcn/Watermelon que denunciam um componente por re-tematizar.
const SHADCN_DEFAULTS =
  /\b(bg|text|border|ring|fill|stroke|outline)-(background|foreground|primary-foreground|secondary-foreground|muted-foreground|accent(-foreground)?|destructive|ring|input|popover(-foreground)?|card(-foreground)?)\b|\brounded-(xs|md|lg|xl|2xl|3xl)\b|\bshadow-(xs|sm|md|lg|xl)\b/;

describe('components/ui (Watermelon re-tematizado)', () => {
  it('tem os componentes da T-305', () => {
    expect(files).toEqual(
      expect.arrayContaining(['button.tsx', 'input.tsx', 'dialog.tsx', 'dropdown-menu.tsx', 'tooltip.tsx', 'tabs.tsx']),
    );
  });

  it.each(files)('%s mantém o aviso MIT da Watermelon no topo', (file) => {
    const head = readFileSync(path.join(dir, file), 'utf8').slice(0, 600);
    expect(head.startsWith('/**')).toBe(true);
    expect(head).toContain('Watermelon UI');
    expect(head).toContain('MIT License');
    expect(head).toContain('Copyright (c) 2025-present Watermelon Contributors');
  });

  it.each(files)('%s não usa cores, raios nem sombras padrão do shadcn', (file) => {
    const source = readFileSync(path.join(dir, file), 'utf8');
    const offending = source.split('\n').filter((line) => SHADCN_DEFAULTS.test(line));
    expect(offending).toEqual([]);
  });

  it.each(files)('%s não importa lucide-react nem motion', (file) => {
    const source = readFileSync(path.join(dir, file), 'utf8');
    expect(source).not.toMatch(/from ['"](lucide-react|motion|motion\/react|framer-motion)['"]/);
  });
});
