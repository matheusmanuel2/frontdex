import { expect, test } from '@playwright/test';

test('as fontes vêm do próprio site, sem Google Fonts', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (request) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(request.url())) external.push(request.url());
  });
  await page.goto('/pt');
  await page.evaluate(() => document.fonts.ready);
  expect(external).toEqual([]);

  const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(family).toMatch(/Geist/i);
});
