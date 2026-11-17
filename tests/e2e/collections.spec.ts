import { expect, test } from '@playwright/test';

import { listCollections } from '../../lib/content';

const collections = listCollections();

test('/collections lista as coleções publicadas, ou o estado vazio', async ({ page }) => {
  await page.goto('/pt/collections');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Coleções.');
  if (collections.length === 0) {
    await expect(page.getByText('Ainda não há coleções publicadas.')).toBeVisible();
  }
  for (const collection of collections) {
    await expect(page.locator(`main a[href="/pt/collections/${collection.slug}"]`).first()).toBeVisible();
  }
  await expect(page.getByRole('banner').getByRole('link', { name: 'Coleções', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('coleções em draft não são publicadas', async ({ request }) => {
  expect((await request.get('/pt/collections/angola-tech')).status()).toBe(404);
});
