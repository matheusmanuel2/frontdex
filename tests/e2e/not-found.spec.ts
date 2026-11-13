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

// Bloqueado pela decisão D-09: com tudo estático, o Next só gera a 404 da raiz (pt-BR).
test.fixme('/en/anything mostra a 404 em inglês', async ({ page }) => {
  await page.goto('/en/anything');
  await expect(page.getByRole('heading', { level: 1 })).toContainText("This page isn't in the index.");
});
