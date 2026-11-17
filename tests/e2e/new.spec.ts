import { expect, test } from '@playwright/test';

import { listResources } from '../../lib/content';
import { groupByWeek } from '../../lib/content/weeks';

const weeks = groupByWeek(listResources());
const weekLabel = (locale: string) =>
  new Date(`${weeks[0]!.start}T00:00:00Z`).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

test('/pt/new agrupa por semana e liga ao RSS', async ({ page }) => {
  await page.goto('/pt/new');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Novos.');
  const headings = page.getByRole('heading', { level: 2, name: /^Semana de/ });
  await expect(headings).toHaveCount(weeks.length);
  await expect(headings.first()).toContainText(weekLabel('pt-BR'));
  await expect(page.getByRole('link', { name: 'Feed RSS' })).toHaveAttribute('href', '/pt/feed.xml');
  await expect(
    page
      .getByRole('list', { name: /^Semana de/ })
      .first()
      .getByRole('listitem'),
  ).toHaveCount(weeks[0]!.resources.length);
});

test('/en/new', async ({ page }) => {
  await page.goto('/en/new');
  await expect(page.getByRole('heading', { level: 2, name: /^Week of/ }).first()).toContainText(weekLabel('en-US'));
});
