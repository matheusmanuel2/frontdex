import { expect, test } from '@playwright/test';

const paths = [
  '',
  '/discover',
  '/c/ui-inspiration',
  '/r/calligraph',
  '/collections',
  '/new',
  '/random',
  '/search',
  '/add',
  '/about',
];

for (const locale of ['pt', 'en'] as const) {
  test(`${locale}: todas as rotas têm metadata localizada e URLs alternadas`, async ({ page }) => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const path of paths) {
      const currentPath = `/${locale}${path}`;
      const response = await page.goto(currentPath);
      expect(response?.status(), currentPath).toBe(200);

      const title = (await page.title()).trim();
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(title, currentPath).not.toBe('');
      expect(description?.trim().length ?? 0, currentPath).toBeGreaterThan(0);
      expect(titles.has(title), `título duplicado: ${currentPath}`).toBe(false);
      expect(descriptions.has(description ?? ''), `descrição duplicada: ${currentPath}`).toBe(false);
      titles.add(title);
      descriptions.add(description ?? '');

      const metadataPaths = {
        canonical: currentPath,
        pt: `/pt${path}`,
        en: `/en${path}`,
        'x-default': `/pt${path}`,
      };

      for (const [rel, expectedPath] of Object.entries(metadataPaths)) {
        const locator =
          rel === 'canonical'
            ? page.locator('link[rel="canonical"]')
            : page.locator(`link[rel="alternate"][hreflang="${rel}"]`);
        const href = await locator.getAttribute('href');
        expect(href, `${rel} em ${currentPath}`).toBe(`https://frontdex.dev${expectedPath}`);
      }
    }
  });
}

test('404 tem descrição e não é indexada', async ({ page }) => {
  const response = await page.goto('/pt/not-a-real-page');
  expect(response?.status()).toBe(404);
  const description = await page.locator('meta[name="description"]').getAttribute('content');
  expect(description?.trim().length ?? 0).toBeGreaterThan(0);
  const robots = await page
    .locator('meta[name="robots"]')
    .evaluateAll((elements) => elements.map((element) => element.getAttribute('content')));
  expect(robots.length).toBeGreaterThan(0);
  expect(robots.every((content) => content?.includes('noindex'))).toBe(true);
});
