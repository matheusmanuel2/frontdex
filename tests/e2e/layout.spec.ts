import { expect, test } from '@playwright/test';

test.describe('cabeçalho e rodapé', () => {
  test('o primeiro elemento focável é "Pular para o conteúdo"', async ({ page }) => {
    await page.goto('/pt');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toHaveText('Pular para o conteúdo');
    await expect(focused).toHaveAttribute('href', '#conteudo');
    await expect(page.locator('#conteudo')).toHaveCount(1);
  });

  test('em inglês o link diz "Skip to content"', async ({ page }) => {
    await page.goto('/en');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveText('Skip to content');
  });

  test('tem as 4 áreas + Coleções, busca e "Adicionar recurso"', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    // A home usa o cabeçalho do hero; as outras páginas usam o SiteHeader (aqui, a 404).
    await page.goto('/pt/qualquer-coisa');
    const banner = page.getByRole('banner');
    const nav = banner.getByRole('navigation', { name: 'Principal' });
    for (const label of ['Descobrir', 'Aprender', 'Construir', 'Crescer', 'Coleções']) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible();
    }
    await expect(banner.getByRole('link', { name: /Buscar/ })).toHaveAttribute('href', '/pt/search');
    await expect(banner.getByRole('link', { name: 'Adicionar recurso' })).toHaveAttribute('href', '/pt/add');
    await expect(page.getByText('Feito em Angola. Aberto ao mundo.')).toBeVisible();
  });

  for (const width of [360, 390, 768, 1024, 1440]) {
    test(`sem scroll horizontal a ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/pt');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('no mobile, as áreas ficam num menu compacto', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/pt/qualquer-coisa');
    const banner = page.getByRole('banner');
    await expect(banner.getByRole('link', { name: 'Construir', exact: true })).toBeHidden();
    await banner.getByLabel('Abrir menu').click();
    await expect(banner.getByRole('link', { name: 'Construir', exact: true })).toBeVisible();
  });
});
