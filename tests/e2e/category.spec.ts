import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { settleAnimations } from './animations';
import { PAGE_SIZE } from '../../components/category/paging';
import { listCategories, listResources } from '../../lib/content';

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, 'en');
const uiInspiration = listResources({ category: 'ui-inspiration' });
const animation = listResources({ category: 'animation' });
const firstPage = Math.min(uiInspiration.length, PAGE_SIZE);
const paged = listCategories().find((category) => listResources({ category: category.slug }).length > PAGE_SIZE);
const emptyCategory = listCategories().find((category) => listResources({ category: category.slug }).length === 0);

const rows = (page: Page) => page.getByRole('list', { name: 'Recursos da categoria' }).getByRole('listitem');

test('lista densa com a primeira página da categoria e sem violações axe', async ({ page }) => {
  await page.goto('/pt/c/ui-inspiration');
  const total = uiInspiration.length;
  await expect(rows(page)).toHaveCount(firstPage);
  await expect(page.getByText(`Mostrando ${firstPage} de ${total}`)).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Só open source' })).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'Nível' })).toHaveCount(0);
  await settleAnimations(page);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('filtros vão para a URL e funcionam com voltar/avançar', async ({ page }) => {
  test.skip(
    animation.some((resource) => resource.pricing === 'paid'),
    'o teste precisa de animation sem recursos pagos',
  );
  await page.goto('/pt/c/animation');
  await expect(rows(page)).toHaveCount(Math.min(animation.length, PAGE_SIZE));

  await page.getByRole('button', { name: 'Pago' }).click();
  await expect(page).toHaveURL(/\/pt\/c\/animation\?pricing=paid$/);
  await expect(page.getByText('Nenhum recurso com estes filtros.')).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/pt\/c\/animation$/);
  await expect(rows(page)).toHaveCount(Math.min(animation.length, PAGE_SIZE));

  await page.goForward();
  await expect(page).toHaveURL(/pricing=paid/);
  await expect(page.getByText('Nenhum recurso com estes filtros.')).toBeVisible();

  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await expect(page).toHaveURL(/\/pt\/c\/animation$/);
});

test('um link com filtros é partilhável', async ({ page }) => {
  await page.goto('/pt/c/ui-inspiration?sort=name&pricing=freemium');
  await expect(page.getByRole('button', { name: 'Freemium' })).toHaveAttribute('aria-pressed', 'true');
  const [first] = uiInspiration.filter((resource) => resource.pricing === 'freemium').sort(byName);
  await expect(rows(page).first()).toContainText(first!.name);
});

test('filtros cobrem a categoria inteira, não só a página', async ({ page }) => {
  test.skip(!paged, 'nenhuma categoria passa de uma página');
  const all = listResources({ category: paged!.slug });
  await page.goto(`/pt/c/${paged!.slug}?sort=name`);
  await expect(page.getByText(`Mostrando ${all.length} de ${all.length}`)).toBeVisible();
  await expect(rows(page)).toHaveCount(all.length);
  await expect(page.getByRole('navigation', { name: 'Paginação' })).toHaveCount(0);
});

test('a página 2 continua a lista e a navegação marca a página atual', async ({ page }) => {
  test.skip(!paged, 'nenhuma categoria passa de uma página');
  const all = listResources({ category: paged!.slug });
  await page.goto(`/pt/c/${paged!.slug}`);
  const nav = page.getByRole('navigation', { name: 'Paginação' });
  await nav.getByRole('link', { name: 'Próxima' }).click();
  await expect(page).toHaveURL(new RegExp(`/pt/c/${paged!.slug}/p/2$`));
  await expect(nav.getByRole('link', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page');
  await expect(rows(page)).toHaveCount(Math.min(all.length - PAGE_SIZE, PAGE_SIZE));
});

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('a página pedida aparece, com links para as outras', async ({ page }) => {
    await page.goto('/pt/c/ui-inspiration?pricing=paid');
    await expect(rows(page)).toHaveCount(firstPage);
    if (uiInspiration.length > PAGE_SIZE) {
      await page.getByRole('navigation', { name: 'Paginação' }).getByRole('link', { name: 'Página 2' }).click();
      await expect(page).toHaveURL(/\/pt\/c\/ui-inspiration\/p\/2$/);
      await expect(rows(page)).toHaveCount(Math.min(uiInspiration.length - PAGE_SIZE, PAGE_SIZE));
    }
  });
});

test('categoria sem recursos mostra o estado vazio', async ({ page }) => {
  test.skip(!emptyCategory, 'todas as categorias têm recursos');
  const response = await page.goto(`/pt/c/${emptyCategory!.slug}`);
  expect(response?.status()).toBe(200);
  await expect(page.getByText('Ainda não há recursos nesta categoria.')).toBeVisible();
});
