import type { Resource } from './schema';

/** Segunda-feira (UTC) da semana de uma data `YYYY-MM-DD`. */
export function weekStart(date: string): string {
  const day = new Date(`${date}T00:00:00Z`);
  const offset = (day.getUTCDay() + 6) % 7; // segunda = 0
  day.setUTCDate(day.getUTCDate() - offset);
  return day.toISOString().slice(0, 10);
}

export type Week = { start: string; resources: Resource[] };

/** Agrupa por semana de `added`, da mais recente para a mais antiga. Semanas vazias não existem. */
export function groupByWeek(resources: Resource[]): Week[] {
  const weeks = new Map<string, Resource[]>();
  for (const resource of resources) {
    const start = weekStart(resource.added);
    weeks.set(start, [...(weeks.get(start) ?? []), resource]);
  }
  return [...weeks.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([start, items]) => ({
      start,
      resources: [...items].sort((a, b) =>
        a.added === b.added ? a.name.localeCompare(b.name, 'en') : a.added < b.added ? 1 : -1,
      ),
    }));
}
