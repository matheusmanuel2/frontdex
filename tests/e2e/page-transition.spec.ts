import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    pageTransitions: number;
  }
}

/** Conta as view transitions que o browser começa (spec 003, recipe 08). */
async function countTransitions(page: Page) {
  await page.addInitScript(() => {
    window.pageTransitions = 0;
    const start = document.startViewTransition?.bind(document);
    if (!start) return;
    document.startViewTransition = ((...args: Parameters<typeof start>) => {
      window.pageTransitions += 1;
      return start(...args);
    }) as typeof document.startViewTransition;
  });
}

test('navegar entre páginas anima com view transition e mantém o header', async ({ page }) => {
  await countTransitions(page);
  await page.goto('/pt/new', { waitUntil: 'networkidle' });
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Coleções' }).click();
  await expect(page).toHaveURL(/\/pt\/collections$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => window.pageTransitions)).toBeGreaterThan(0);
  await expect(page.locator('header.t-page-anchor')).toHaveCount(1);
});

test('com movimento reduzido a navegação continua a funcionar', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/pt/new', { waitUntil: 'networkidle' });
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Coleções' }).click();
  await expect(page).toHaveURL(/\/pt\/collections$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await context.close();
});

test('filtros da categoria (só query) não fazem a página deslizar', async ({ page }) => {
  await countTransitions(page);
  await page.goto('/pt/c/ui-inspiration', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Freemium' }).click();
  await expect(page).toHaveURL(/pricing=freemium/);
  await expect(page.getByRole('button', { name: 'Freemium' })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => window.pageTransitions)).toBe(0);
});
