import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const AREAS = ['discover', 'learn', 'build', 'grow'];

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
  await expect(categories.getByRole('link', { name: /Animação/ })).toHaveAttribute('href', '/pt/c/animation');
  // Ícones, Fontes, Cores e Ferramentas de IA não têm recursos active no seed.
  await expect(categories.getByRole('link', { name: /Ícones|Fontes|Cores|Ferramentas de IA/ })).toHaveCount(0);
  await expect(page.getByRole('banner').getByRole('link', { name: 'Construir', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('área sem recursos mostra o estado vazio', async ({ page }) => {
  await page.goto('/pt/learn');
  await expect(page.getByText('Ainda não há recursos nesta área.')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Categorias' })).toHaveCount(0);
});
