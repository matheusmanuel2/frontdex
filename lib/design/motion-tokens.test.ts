import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { MOTION_MS } from './motion-tokens';

describe('MOTION_MS', () => {
  it('é igual aos tokens de styles/motion.css', () => {
    const css = readFileSync('styles/motion.css', 'utf8');
    for (const [name, ms] of Object.entries(MOTION_MS)) {
      expect(css).toMatch(new RegExp(`--duration-${name}:\\s*${ms}ms;`));
    }
  });
});
