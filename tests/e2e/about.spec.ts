import { expect, test } from '@playwright/test';

test('/pt/about mostra números reais do índice', async ({ page }) => {
  await page.goto('/pt/about');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Sobre.');
  const stats = page.getByRole('region', { name: 'O índice em números' });
  // 8 recursos active, 17 categorias e 4 áreas no seed.
  await expect(stats.getByText('8', { exact: true })).toBeVisible();
  await expect(stats.getByText('17', { exact: true })).toBeVisible();
  await expect(stats.getByText('4', { exact: true })).toBeVisible();
});

test('/en/about', async ({ page }) => {
  await page.goto('/en/about');
  await expect(page.getByRole('heading', { name: 'Principles' })).toBeVisible();
});
