import { expect, test } from '@playwright/test';

test.describe('secções da home (dados do loader)', () => {
  test('4 áreas com contagem e link', async ({ page }) => {
    await page.goto('/pt');
    const areas = page.getByRole('region', { name: /Escolha uma direção/ });
    await expect(areas.getByRole('listitem')).toHaveCount(4);
    await expect(areas.getByRole('link', { name: /Construir/ })).toHaveAttribute('href', '/pt/build');
    await expect(areas.getByText('5 recursos')).toBeVisible();
  });

  test('Recém-indexados lista os 6 mais recentes, com link para o recurso', async ({ page }) => {
    await page.goto('/pt');
    const list = page.getByRole('list', { name: 'Recursos recém-indexados' });
    await expect(list.getByRole('listitem')).toHaveCount(6);
    await expect(list.getByRole('link', { name: /kugiri/ })).toHaveAttribute('href', '/pt/r/kugiri');
  });

  test('Joias escondidas só mostra recursos com "por que está aqui"', async ({ page }) => {
    await page.goto('/pt');
    const gems = page.getByRole('region', { name: /Útil antes de popular/ });
    await expect(gems.getByText('Por que está aqui')).toHaveCount(1);
  });

  test('sem coleções publicadas, a secção não aparece', async ({ page }) => {
    await page.goto('/pt');
    await expect(page.getByRole('region', { name: /Curadas, em ordem/ })).toHaveCount(0);
  });

  test('o exemplo de YAML é um recurso real e não mostra notas internas', async ({ page }) => {
    await page.goto('/pt');
    const figure = page.locator('figure').filter({ hasText: 'data/resources/' });
    await expect(figure).toContainText('name: kugiri');
    await expect(figure).not.toContainText('notes:');
  });
});
