import { expect, test } from '@playwright/test';

const pages = [
  { route: '/pt', imagePath: '/pt/opengraph-image' },
  { route: '/en', imagePath: '/en/opengraph-image' },
  { route: '/pt/c/ui-inspiration', imagePath: '/pt/c/ui-inspiration/opengraph-image' },
  { route: '/en/r/calligraph', imagePath: '/en/r/calligraph/opengraph-image' },
];

for (const { route, imagePath } of pages) {
  test(`${route} tem imagem Open Graph estática 1200×630`, async ({ page }) => {
    await page.goto(route);
    const imageUrl = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(imageUrl).toBeTruthy();

    const imagePathWithQuery = `${new URL(imageUrl ?? 'https://frontdex.dev').pathname}${
      new URL(imageUrl ?? 'https://frontdex.dev').search
    }`;
    expect(imagePathWithQuery).toContain(imagePath);
    const response = await page.goto(imagePathWithQuery);
    expect(response?.status()).toBe(200);
    expect(response?.headers()['content-type']).toContain('image/png');

    const image = Buffer.from((await response?.body()) ?? []);
    expect(image.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    expect(image.readUInt32BE(16)).toBe(1200);
    expect(image.readUInt32BE(20)).toBe(630);
  });
}
