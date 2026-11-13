import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const [locale, lang] of [
  ['pt', 'pt-BR'],
  ['en', 'en'],
] as const) {
  test(`/${locale} é HTML estático com lang="${lang}" e sem violações axe`, async ({ page }) => {
    const response = await page.goto(`/${locale}`);
    expect(response?.status()).toBe(200);
    // Gerado no build (SSG): o Next serve-o da cache estática.
    expect(response?.headers()['x-nextjs-cache'] ?? 'HIT').toMatch(/HIT|STALE/);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
  });
}
