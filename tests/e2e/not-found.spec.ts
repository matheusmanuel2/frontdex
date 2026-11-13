import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('/pt/qualquer-coisa mostra a 404 em pt-BR com status 404', async ({ page }) => {
  const response = await page.goto('/pt/qualquer-coisa');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Esta página não está no índice.');
  await expect(page.getByRole('link', { name: 'Voltar ao início' })).toHaveAttribute('href', '/pt');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('/en/anything responde 404', async ({ page }) => {
  const response = await page.goto('/en/anything');
  expect(response?.status()).toBe(404);
});

test('/en/anything mostra também a 404 em inglês, com lang="en"', async ({ page }) => {
  await page.goto('/en/anything');
  const english = page.locator('section[lang="en"]');
  await expect(english.getByRole('heading', { level: 2 })).toContainText("This page isn't in the index.");
  await expect(english.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/en');
});
test('na 404, o primeiro elemento focável é "Pular para o conteúdo"', async ({ page }) => {
  await page.goto('/pt/qualquer-coisa');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText('Pular para o conteúdo');
});
