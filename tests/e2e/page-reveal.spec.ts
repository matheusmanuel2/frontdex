import { expect, test, type Page } from '@playwright/test';

import { settleAnimations } from './animations';

/** Atrasos (ms) das animações de entrada a correr agora, por ordem do DOM. */
async function revealDelays(page: Page) {
  return page.evaluate(() =>
    document
      .getAnimations()
      .filter((animation) => (animation as CSSAnimation).animationName === 't-reveal-in')
      .map((animation) => Number(animation.effect?.getTiming().delay ?? 0)),
  );
}

test('as páginas entram em sequência, de cima para baixo (recipe 18)', async ({ page }) => {
  await page.goto('/pt/c/ui-inspiration');
  const delays = await revealDelays(page);
  expect(delays.length).toBeGreaterThan(3);
  // Cada bloco espera mais do que o anterior: o breadcrumb antes do título.
  const breadcrumb = await page
    .locator('main nav[aria-label]')
    .first()
    .evaluate((el) => getComputedStyle(el.parentElement!).animationDelay);
  const title = await page.getByRole('heading', { level: 1 }).evaluate((el) => getComputedStyle(el).animationDelay);
  expect(parseFloat(title)).toBeGreaterThan(parseFloat(breadcrumb));
});

/** Animações de entrada a correr dentro de `selector`. */
async function revealsIn(page: Page, selector: string) {
  return page
    .locator(selector)
    .evaluate(
      (root) =>
        root
          .getAnimations({ subtree: true })
          .filter((animation) => (animation as CSSAnimation).animationName === 't-reveal-in').length,
    );
}

const SIDEBAR = 'aside[aria-labelledby="category-siblings"]';
const CONTENT = 'section[aria-labelledby="category-title"]';

test('trocar de categoria pela barra lateral só anima o conteúdo', async ({ page }) => {
  await page.goto('/pt/c/ui-inspiration', { waitUntil: 'networkidle' });
  await settleAnimations(page);
  const sidebar = page.getByRole('navigation', { name: /^Categorias de/ });
  await sidebar.getByRole('link').nth(1).click();
  await expect(page).not.toHaveURL(/ui-inspiration/);
  await expect(page.locator(CONTENT)).toBeVisible();
  expect(await revealsIn(page, CONTENT)).toBeGreaterThan(3);
  expect(await revealsIn(page, SIDEBAR)).toBe(0);
});

test('chegar à categoria vindo da área anima também a barra lateral', async ({ page }) => {
  await page.goto('/pt/discover', { waitUntil: 'networkidle' });
  await settleAnimations(page);
  await page
    .getByRole('link', { name: /^Inspiração de UI/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/c\/ui-inspiration/);
  await expect(page.locator(SIDEBAR)).toBeVisible();
  expect(await revealsIn(page, SIDEBAR)).toBeGreaterThan(0);
});

test('com movimento reduzido não há animação de entrada', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/pt/c/ui-inspiration');
  expect(await revealDelays(page)).toEqual([]);
  await context.close();
});

test('filtrar (só muda a query) não repete a entrada da página', async ({ page }) => {
  await page.goto('/pt/c/ui-inspiration', { waitUntil: 'networkidle' });
  await settleAnimations(page);
  await page.getByRole('button', { name: 'Freemium' }).click();
  await expect(page).toHaveURL(/pricing=freemium/);
  expect(await revealDelays(page)).toEqual([]);
});
