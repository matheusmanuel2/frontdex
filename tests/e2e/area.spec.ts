import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { listAreas, listCategories, listResources } from '../../lib/content';

const AREAS = ['discover', 'learn', 'build', 'grow'];
/** O nome acessível do link inclui a contagem: casamos pelo início do nome. */
const startsWith = (name: string) => new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|\\d|$)`);

for (const locale of ['pt', 'en']) {
  for (const area of AREAS) {
    test(`/${locale}/${area} é gerada`, async ({ request }) => {
      const response = await request.get(`/${locale}/${area}`);
      expect(response.status()).toBe(200);
    });
  }
}

test('Construir: categorias com recursos, sem categorias vazias, e nav ativa', async ({ page }) => {
  await page.goto('/pt/build');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Construir.');
  const categories = page.getByRole('region', { name: 'Categorias' });
  const build = listCategories('build');
  const withResources = build.filter((category) => listResources({ category: category.slug }).length > 0);
  const empty = build.filter((category) => listResources({ category: category.slug }).length === 0);
  for (const category of withResources) {
    await expect(categories.getByRole('link', { name: startsWith(category.name.pt) })).toHaveAttribute(
      'href',
      `/pt/c/${category.slug}`,
    );
  }
  for (const category of empty) {
    await expect(categories.getByRole('link', { name: startsWith(category.name.pt) })).toHaveCount(0);
  }
  await expect(page.getByRole('banner').getByRole('link', { name: 'Construir', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
});

const emptyArea = listAreas().find((area) => listResources({ area: area.slug }).length === 0);

test('área sem recursos mostra o estado vazio', async ({ page }) => {
  test.skip(!emptyArea, 'todas as áreas têm recursos');
  await page.goto(`/pt/${emptyArea!.slug}`);
  await expect(page.getByText('Ainda não há recursos nesta área.')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Categorias' })).toHaveCount(0);
});
