import { describe, expect, it } from 'vitest';

import { groupByWeek, weekStart } from './weeks';

import type { Resource } from './schema';

const r = (slug: string, added: string) => ({ slug, name: slug, added }) as Resource;

describe('semanas', () => {
  it('a semana começa à segunda-feira', () => {
    expect(weekStart('2026-11-12')).toBe('2026-11-09'); // quinta
    expect(weekStart('2026-11-09')).toBe('2026-11-09'); // segunda
    expect(weekStart('2026-11-15')).toBe('2026-11-09'); // domingo
  });

  it('agrupa do mais recente para o mais antigo, sem semanas vazias', () => {
    const weeks = groupByWeek([r('a', '2026-10-01'), r('b', '2026-11-12'), r('c', '2026-11-10')]);
    expect(weeks.map((week) => week.start)).toEqual(['2026-11-09', '2026-09-28']);
    expect(weeks[0]?.resources.map((item) => item.slug)).toEqual(['b', 'c']);
  });
});
