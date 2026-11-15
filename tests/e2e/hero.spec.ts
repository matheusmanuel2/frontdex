import { expect, test } from '@playwright/test';

test.describe('hero da home', () => {
  test('mostra o título e as duas ações; esconde os números com menos de 25 recursos', async ({ page }) => {
    await page.goto('/pt');
    const hero = page.locator('section[aria-labelledby="hero-title"]');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Menos busca\.\s*Mais construção\./);
    // 8 recursos active no seed (lib/content): abaixo de HERO_STATS_MIN.
    await expect(hero.getByRole('definition')).toHaveCount(0);
    await expect(hero.getByRole('link', { name: /Buscar no índice/ })).toHaveAttribute('href', '/pt/search');
    await expect(hero.getByRole('link', { name: /ou adicione um recurso/ })).toHaveAttribute('href', '/pt/add');
  });

  test('o poster do hero tem prioridade (LCP) e tamanhos responsivos', async ({ page }) => {
    await page.goto('/pt');
    const image = page.locator('section[aria-labelledby="hero-title"] img').first();
    await expect(image).toHaveAttribute('fetchpriority', 'high');
    await expect(image).toHaveAttribute('sizes', '100vw');
    expect(await image.getAttribute('srcset')).toMatch(/\d+w/);
  });

  test('o loop de vídeo entra depois do carregamento', async ({ page }) => {
    await page.goto('/pt');
    const video = page.locator('section[aria-labelledby="hero-title"] video');
    await expect(video).toHaveCount(1);
    await expect(video).toHaveJSProperty('muted', true);
  });

  test.describe('com movimento reduzido', () => {
    test.use({ reducedMotion: 'reduce' });

    test('não há vídeo, só o poster', async ({ page }) => {
      await page.goto('/pt');
      await page.waitForLoadState('load');
      await expect(page.locator('section[aria-labelledby="hero-title"] video')).toHaveCount(0);
    });
  });

  test('em inglês', async ({ page }) => {
    await page.goto('/en');
    const hero = page.locator('section[aria-labelledby="hero-title"]');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Less searching\.\s*More building\./);
    await expect(hero.getByRole('link', { name: /or add a resource/ })).toHaveAttribute('href', '/en/add');
  });
});
