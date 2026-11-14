import { expect, test } from '@playwright/test';

test('mostra um recurso ao acaso e "Outro ao acaso" troca', async ({ page }) => {
  await page.goto('/pt/random');
  const name = page.locator('article h2');
  await expect(name).toBeVisible();
  const seen = new Set([await name.textContent()]);
  for (let i = 0; i < 6; i += 1) {
    await page.getByRole('button', { name: 'Outro ao acaso' }).click();
    seen.add(await name.textContent());
  }
  expect(seen.size).toBeGreaterThan(1);
  await expect(page.getByRole('link', { name: 'Abrir recurso' })).toHaveAttribute('href', /^\/pt\/r\//);
  await expect(page.getByText('sorteado de 8 recursos')).toBeVisible();
});

test('a tecla R sorteia outro', async ({ page }) => {
  await page.goto('/pt/random');
  const name = page.locator('article h2');
  const seen = new Set([await name.textContent()]);
  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press('r');
    seen.add(await name.textContent());
  }
  expect(seen.size).toBeGreaterThan(1);
});

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('mostra um recurso estático do build', async ({ page }) => {
    await page.goto('/pt/random');
    await expect(page.locator('article h2')).toBeVisible();
  });
});
