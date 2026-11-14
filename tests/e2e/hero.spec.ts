import { expect, test } from '@playwright/test';

test.describe('hero da home', () => {
  test('mostra o título, a contagem real e os dois botões', async ({ page }) => {
    await page.goto('/pt');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Menos busca\.\s*Mais construção\./);
    // 8 recursos active no seed (lib/content).
    await expect(page.getByText('8 recursos curados pela comunidade')).toBeVisible();
    await expect(page.getByRole('link', { name: /Buscar no índice/ })).toHaveAttribute('href', '/pt/search');
    await expect(page.getByRole('link', { name: /Como funciona/ })).toHaveAttribute('href', '/pt/add');
  });

  test('a imagem do hero tem prioridade (LCP) e tamanhos responsivos', async ({ page }) => {
    await page.goto('/pt');
    const image = page.locator('section[aria-labelledby="hero-title"] img').first();
    await expect(image).toHaveAttribute('fetchpriority', 'high');
    await expect(image).toHaveAttribute('sizes', '100vw');
    expect(await image.getAttribute('srcset')).toMatch(/\d+w/);
  });

  test('em inglês', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Less searching\.\s*More building\./);
    await expect(page.getByText('8 resources curated by the community')).toBeVisible();
  });
});
