import { expect, test } from '@playwright/test';

test('sem coleções publicadas, /collections mostra o estado vazio', async ({ page }) => {
  await page.goto('/pt/collections');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Coleções.');
  await expect(page.getByText('Ainda não há coleções publicadas.')).toBeVisible();
  await expect(page.getByRole('banner').getByRole('link', { name: 'Coleções', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('coleções em draft não são publicadas', async ({ request }) => {
  expect((await request.get('/pt/collections/angola-tech')).status()).toBe(404);
});
