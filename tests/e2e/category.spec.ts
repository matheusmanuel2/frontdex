import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const rows = (page: Page) => page.getByRole('list', { name: 'Recursos da categoria' }).getByRole('listitem');

test('lista densa com todos os recursos da categoria e sem violações axe', async ({ page }) => {
  await page.goto('/pt/c/ui-inspiration');
  await expect(rows(page)).toHaveCount(3);
  await expect(page.getByText('Mostrando 3 de 3')).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('filtros vão para a URL e funcionam com voltar/avançar', async ({ page }) => {
  await page.goto('/pt/c/animation');
  await expect(rows(page)).toHaveCount(2);

  await page.getByRole('button', { name: 'Pago' }).click();
  await expect(page).toHaveURL(/\/pt\/c\/animation\?pricing=paid$/);
  await expect(page.getByText('Nenhum recurso com estes filtros.')).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/pt\/c\/animation$/);
  await expect(rows(page)).toHaveCount(2);

  await page.goForward();
  await expect(page).toHaveURL(/pricing=paid/);
  await expect(page.getByText('Nenhum recurso com estes filtros.')).toBeVisible();

  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await expect(page).toHaveURL(/\/pt\/c\/animation$/);
});

test('um link com filtros é partilhável', async ({ page }) => {
  await page.goto('/pt/c/ui-inspiration?sort=name&pricing=freemium');
  await expect(page.getByRole('button', { name: 'Freemium' })).toHaveAttribute('aria-pressed', 'true');
  await expect(rows(page).first()).toContainText('Mobbin');
});

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('a lista completa aparece', async ({ page }) => {
    await page.goto('/pt/c/ui-inspiration?pricing=paid');
    await expect(rows(page)).toHaveCount(3);
  });
});

test('categoria sem recursos mostra o estado vazio', async ({ page }) => {
  const response = await page.goto('/pt/c/icons');
  expect(response?.status()).toBe(200);
  await expect(page.getByText('Ainda não há recursos nesta categoria.')).toBeVisible();
});
