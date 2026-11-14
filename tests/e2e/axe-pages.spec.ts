import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of ['/pt/new', '/en/new', '/pt/random', '/pt/collections', '/pt/about', '/en/about']) {
  test(`${path} sem violações axe`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('na home, "Pular para o conteúdo" salta a navegação do hero', async ({ page }) => {
  await page.goto('/pt');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText(/Buscar no índice/);
});
