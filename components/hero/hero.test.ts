import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('components/hero', () => {
  const source = readFileSync('components/hero/Hero.tsx', 'utf8');
  const video = readFileSync('components/hero/HeroVideo.tsx', 'utf8');

  it('mantém o aviso MIT da Watermelon (hero-37) no topo', () => {
    expect(source.startsWith('/**')).toBe(true);
    expect(source.slice(0, 400)).toContain('hero-37');
    expect(source).toContain('Copyright (c) 2025-present Watermelon Contributors');
  });

  it('não usa motion nem lucide-react', () => {
    for (const file of [source, video]) {
      expect(file).not.toMatch(/from ['"](motion|motion\/react|lucide-react)['"]/);
    }
  });

  it('o vídeo não toca com movimento reduzido nem Save-Data', () => {
    expect(video).toContain('prefers-reduced-motion: reduce');
    expect(video).toContain('saveData');
  });
});
