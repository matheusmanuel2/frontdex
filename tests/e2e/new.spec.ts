import { expect, test } from '@playwright/test';

test('/pt/new agrupa por semana e liga ao RSS', async ({ page }) => {
  await page.goto('/pt/new');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Novos.');
  const weeks = page.getByRole('heading', { level: 2, name: /^Semana de/ });
  await expect(weeks).toHaveCount(1);
  await expect(weeks.first()).toContainText('9 de novembro de 2026');
  await expect(page.getByRole('link', { name: 'Feed RSS' })).toHaveAttribute('href', '/pt/feed.xml');
  await expect(page.getByRole('list', { name: /^Semana de/ }).getByRole('listitem')).toHaveCount(8);
});

test('/en/new', async ({ page }) => {
  await page.goto('/en/new');
  await expect(page.getByRole('heading', { level: 2, name: /^Week of/ }).first()).toContainText('November 9, 2026');
});
