import { expect, test } from '@playwright/test';

test('em /pt/c/icons, trocar de idioma leva a /en/c/icons e grava o cookie', async ({ page, context }) => {
  await page.goto('/pt/c/icons');
  const link = page.getByRole('link', { name: 'PT / EN: mudar o idioma para English' });
  await expect(link).toHaveAttribute('href', '/en/c/icons');
  await link.click();
  await expect(page).toHaveURL(/\/en\/c\/icons$/);
  const cookie = (await context.cookies()).find((entry) => entry.name === 'NEXT_LOCALE');
  expect(cookie?.value).toBe('en');
});

test('na home, troca /pt ↔ /en mantendo a rota', async ({ page }) => {
  await page.goto('/pt');
  await page.getByRole('link', { name: /mudar o idioma para English/ }).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('link', { name: /switch language to Português/ }).click();
  await expect(page).toHaveURL(/\/pt$/);
});

test('depois de escolher inglês, `/` leva a /en', async ({ page }) => {
  await page.goto('/pt');
  await page.getByRole('link', { name: /mudar o idioma para English/ }).click();
  await expect(page).toHaveURL(/\/en$/);
  await page.goto('/');
  await expect(page).toHaveURL(/\/en$/);
});

test('trocar de idioma grava o cookie NEXT_LOCALE', async ({ page, context }) => {
  await page.goto('/pt');
  await page.getByRole('link', { name: /mudar o idioma para English/ }).click();
  await expect(page).toHaveURL(/\/en$/);
  const cookie = (await context.cookies()).find((entry) => entry.name === 'NEXT_LOCALE');
  expect(cookie?.value).toBe('en');
});

test('na 404, o seletor leva à home do outro idioma', async ({ page }) => {
  await page.goto('/pt/qualquer-coisa');
  await expect(page.getByRole('link', { name: /mudar o idioma para English/ })).toHaveAttribute('href', '/en');
});
