import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    umamiEvents: string[];
  }
}

test('Umami não carrega nem grava cookies fora de produção', async ({ page, context }) => {
  await page.goto('/pt');
  await expect(page.locator('script[src="https://cloud.umami.is/script.js"]')).toHaveCount(0);
  expect(await context.cookies()).toEqual([]);
});

test('⌘K e Surpresa enviam os eventos esperados', async ({ page }) => {
  await page.addInitScript(() => {
    window.umamiEvents = [];
    window.umami = { track: (eventName) => window.umamiEvents.push(eventName) };
  });

  await page.goto('/pt');
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(() => window.umamiEvents)).toContain('search_open');

  await page.goto('/pt/random');
  await page.getByRole('button', { name: 'Outro ao acaso' }).click();
  expect(await page.evaluate(() => window.umamiEvents)).toContain('random');
});

test('links de contribuição e de saída carregam eventos Umami', async ({ page }) => {
  await page.goto('/pt/r/calligraph');
  await expect(page.locator('a[data-umami-event-target="website"]')).toHaveAttribute(
    'data-umami-event-slug',
    'calligraph',
  );

  await page.goto('/pt/add');
  await expect(
    page.locator('a[href*="issues/new?template=add-resource.yml"][data-umami-event="add_click"]'),
  ).toHaveCount(1);
});
