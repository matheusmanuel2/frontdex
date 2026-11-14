import { expect, test } from '@playwright/test';

for (const locale of ['pt', 'en'] as const) {
  test(`/${locale}/feed.xml é um RSS localizado válido`, async ({ page }) => {
    const response = await page.goto(`/${locale}/feed.xml`);
    expect(response?.status()).toBe(200);
    expect(response?.headers()['content-type']).toContain('application/rss+xml');

    const xml = await response?.text();
    const feed = await page.evaluate((source) => {
      const parsed = new DOMParser().parseFromString(source, 'application/xml');
      return {
        root: parsed.documentElement.localName,
        error: parsed.querySelector('parsererror')?.textContent,
        title: parsed.querySelector('channel > title')?.textContent,
        language: parsed.querySelector('channel > language')?.textContent,
        itemLinks: Array.from(parsed.querySelectorAll('channel > item > link')).map((link) => link.textContent),
      };
    }, xml ?? '');

    expect(feed.error).toBeUndefined();
    expect(feed.root).toBe('rss');
    expect(feed.title).toContain('FrontDex');
    expect(feed.language).toBe(locale === 'pt' ? 'pt-BR' : 'en');
    expect(feed.itemLinks.length).toBeGreaterThan(0);
    expect(feed.itemLinks.every((link) => link?.startsWith(`https://frontdex.dev/${locale}/r/`))).toBe(true);
  });
}
