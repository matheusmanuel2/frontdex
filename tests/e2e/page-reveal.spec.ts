import { expect, test, type Page } from '@playwright/test';

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

test('escolher outra categoria na barra lateral volta a animar a entrada', async ({ page }) => {
  await page.goto('/pt/c/ui-inspiration', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await Promise.all(document.getAnimations().map((animation) => animation.finished));
  });
  expect(await revealDelays(page)).toEqual([]);
  const sidebar = page.getByRole('navigation', { name: /^Categorias de/ });
  await sidebar.getByRole('link').nth(1).click();
  await expect(page).not.toHaveURL(/ui-inspiration/);
  expect((await revealDelays(page)).length).toBeGreaterThan(3);
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
  await page.evaluate(async () => {
    await Promise.all(document.getAnimations().map((animation) => animation.finished));
  });
  await page.getByRole('button', { name: 'Freemium' }).click();
  await expect(page).toHaveURL(/pricing=freemium/);
  expect(await revealDelays(page)).toEqual([]);
});
