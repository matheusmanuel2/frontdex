import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('components/hero', () => {
  const source = readFileSync('components/hero/Hero.tsx', 'utf8');

  it('mantém o aviso MIT da Watermelon (hero-13) no topo', () => {
    expect(source.startsWith('/**')).toBe(true);
    expect(source.slice(0, 400)).toContain('hero-13');
    expect(source).toContain('Copyright (c) 2025-present Watermelon Contributors');
  });

  it('não usa motion nem lucide-react', () => {
    expect(source).not.toMatch(/from ['"](motion|motion\/react|lucide-react)['"]/);
  });
});
