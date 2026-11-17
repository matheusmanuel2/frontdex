import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('recurso com "por que está aqui", detalhes e links externos com noopener e nova aba', async ({ page }) => {
  await page.goto('/pt/r/kugiri');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('kugiri');
  await expect(page.getByRole('heading', { name: 'Por que está aqui' })).toBeVisible();
  await expect(page.getByText('MIT')).toBeVisible();
  const visit = page.getByRole('link', { name: /Visitar edoardolunardi\.github\.io \(abre em nova aba\)/ });
  await expect(visit).toHaveAttribute(
    'href',
    'https://edoardolunardi.github.io/kugiri?ref=frontdex&utm_source=frontdex&utm_medium=referral',
  );
  // Links de saída do recurso abrem numa nova aba (spec 003).
  await expect(visit).toHaveAttribute('target', '_blank');
  for (const link of await page.locator('a[href^="http"]').all()) {
    await expect(link).toHaveAttribute('rel', /noopener/);
  }
  await expect(page.getByRole('link', { name: 'Sugira uma edição no GitHub' })).toHaveAttribute(
    'href',
    /\/edit\/main\/data\/resources\/kugiri\.yaml$/,
  );
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('recurso sem "por que" não mostra a secção vazia', async ({ page }) => {
  await page.goto('/pt/r/cmux');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('cmux');
  await expect(page.getByRole('heading', { name: 'Por que está aqui' })).toHaveCount(0);
});

test('em inglês', async ({ page }) => {
  await page.goto('/en/r/kugiri');
  await expect(page.getByRole('heading', { name: "Why it's here" })).toBeVisible();
});

test('recursos em draft não são publicados', async ({ request }) => {
  expect((await request.get('/pt/r/glass')).status()).toBe(404);
});
