import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { listAreas, listCategories, listCollections, listResources } from '../../lib/content';

const LOCALES = ['pt', 'en'] as const;
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];
const ROUTES = [
  '',
  '/about',
  '/add',
  '/collections',
  '/new',
  '/random',
  '/search',
  ...listAreas().map((area) => `/${area.slug}`),
  ...listCategories().map((category) => `/c/${category.slug}`),
  ...listResources().map((resource) => `/r/${resource.slug}`),
  ...listCollections().map((collection) => `/collections/${collection.slug}`),
].map((path) => ({ path, status: 200 }));
ROUTES.push({ path: '/not-a-real-route', status: 404 });

// Um teste por rota e idioma: correm em paralelo (fullyParallel) e o tempo não cresce
// em série com o número de recursos. Um único teste com todas as rotas passava dos 15 min do CI.
for (const locale of LOCALES) {
  for (const route of ROUTES) {
    const url = `/${locale}${route.path}`;

    test(`axe nos dois temas: ${url}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const response = await page.goto(url);
      expect(response?.status(), url).toBe(route.status);

      for (const theme of ['dark', 'light'] as const) {
        await page.evaluate((value) => {
          document.documentElement.dataset.theme = value;
        }, theme);
        await page.evaluate(async () => {
          await Promise.all(document.getAnimations().map((animation) => animation.finished));
        });
        const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
        expect(results.violations, `${url} (${theme})`).toEqual([]);
      }
    });

    test(`navegável pelo teclado a partir do skip link: ${url}`, async ({ page }) => {
      await page.goto(url);
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus'), url).toHaveAttribute('href', '#conteudo');
      await page.keyboard.press('Enter');
      expect(new URL(page.url()).hash, url).toBe('#conteudo');
      await page.keyboard.press('Tab');

      const focusIsInteractive = await page.evaluate(() => {
        const active = document.activeElement;
        return (
          active instanceof HTMLElement &&
          active.matches('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]')
        );
      });
      expect(focusIsInteractive, url).toBe(true);
    });
  }
}
