import { expect, test } from '@playwright/test';

test('sitemap lista as rotas estáticas pt/en sem a busca noindex', async ({ page }) => {
  const response = await page.goto('/sitemap.xml');
  expect(response?.status()).toBe(200);
  const xml = await response?.text();
  expect(xml).toContain('<loc>https://frontdex.dev/pt</loc>');
  expect(xml).toContain('<loc>https://frontdex.dev/en</loc>');
  expect(xml).toContain('<loc>https://frontdex.dev/pt/c/ui-inspiration</loc>');
  expect(xml).toContain('<loc>https://frontdex.dev/en/r/calligraph</loc>');
  expect(xml).toContain('hreflang="x-default"');
  expect(xml).not.toContain('https://frontdex.dev/pt/search');
  expect(xml).not.toContain('https://frontdex.dev/en/search');
});

test('robots.txt aponta para o sitemap público', async ({ page }) => {
  const response = await page.goto('/robots.txt');
  expect(response?.status()).toBe(200);
  await expect(page.locator('body')).toContainText('Sitemap: https://frontdex.dev/sitemap.xml');
});
