import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('mantém tamanho e cor de texto da escala FrontDex', () => {
    expect(cn('text-h1 text-primary')).toBe('text-h1 text-primary');
  });

  it('resolve conflitos dentro do mesmo grupo', () => {
    expect(cn('bg-carbon', 'bg-graphite')).toBe('bg-graphite');
    expect(cn('rounded-sm', 'rounded-pill')).toBe('rounded-pill');
    expect(cn('text-secondary', 'text-muted')).toBe('text-muted');
  });
});
