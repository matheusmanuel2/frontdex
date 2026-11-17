import { expect, test } from '@playwright/test';

import { listAreas, listCategories, listResources } from '../../lib/content';

test('/pt/about mostra números reais do índice', async ({ page }) => {
  await page.goto('/pt/about');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Sobre.');
  const stats = page.getByRole('region', { name: 'O índice em números' });
  // Os números vêm dos dados: recursos active, categorias e áreas.
  for (const count of [listResources().length, listCategories().length, listAreas().length]) {
    await expect(stats.getByText(String(count), { exact: true }).first()).toBeVisible();
  }
});

test('/en/about', async ({ page }) => {
  await page.goto('/en/about');
  await expect(page.getByRole('heading', { name: 'Principles' })).toBeVisible();
});
