import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { pageCount } from '../../components/category/paging';
import { listAreas, listCategories, listCollections, listResources, type Resource } from '../../lib/content';

const LOCALES = ['pt', 'en'] as const;
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];
/**
 * Páginas de recurso por amostra: todas usam o mesmo template, e testar as 1.300+ levava o CI
 * a mais de uma hora. Entra o primeiro recurso de cada categoria e o primeiro com cada campo
 * opcional que muda o layout (por que está aqui, alternativas, repositório, detalhes, arquivado).
 */
export function resourceSample(resources: Resource[], archived: Resource[]): string[] {
  const bySlug = [...resources].sort((a, b) => a.slug.localeCompare(b.slug));
  const picks = new Set<string>();
  const first = (test: (resource: Resource) => boolean) => {
    const found = bySlug.find(test);
    if (found) picks.add(found.slug);
  };
  for (const category of new Set(bySlug.map((resource) => resource.category))) {
    first((resource) => resource.category === category);
  }
  first((resource) => Boolean(resource.why));
  first((resource) => (resource.alternatives?.length ?? 0) > 0);
  first((resource) => Boolean(resource.repo && resource.repo !== resource.url));
  first((resource) => Boolean(resource.license && resource.author && resource.level));
  first((resource) => resource.featured === true);
  if (archived[0]) picks.add(archived[0].slug);
  return [...picks];
}

const pagedCategory = listCategories().find(
  (category) => pageCount(listResources({ category: category.slug }).length) > 1,
);

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
  ...(pagedCategory ? [`/c/${pagedCategory.slug}/p/2`] : []),
  ...resourceSample(listResources(), listResources({ status: 'archived' })).map((slug) => `/r/${slug}`),
  ...listCollections().map((collection) => `/collections/${collection.slug}`),
].map((path) => ({ path, status: 200 }));
ROUTES.push({ path: '/not-a-real-route', status: 404 });

// Um teste por rota e idioma: correm em paralelo (fullyParallel).
for (const locale of LOCALES) {
  for (const route of ROUTES) {
    const url = `/${locale}${route.path}`;

    test(`axe nos dois temas: ${url}`, async ({ page }) => {
      // /new e /search mostram centenas de recursos; o axe precisa de mais do que os 30 s padrão.
      test.setTimeout(90_000);
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
