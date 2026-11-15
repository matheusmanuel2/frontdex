import { expect, test } from '@playwright/test';

test.describe('secções da home (dados do loader)', () => {
  test('explorar por área: quatro cards com contagem e categorias', async ({ page }) => {
    await page.goto('/pt');
    const areas = page.getByRole('region', { name: 'Explorar por área' });
    await expect(areas.locator('ul').first().locator(':scope > li')).toHaveCount(4);
    await expect(areas.getByRole('link', { name: 'Construir', exact: true })).toHaveAttribute('href', '/pt/build');
    await expect(areas.getByText('5 recursos')).toBeVisible();
    await expect(areas.locator('canvas[aria-hidden="true"]')).toHaveCount(4);
    await expect(areas).not.toContainText(' · ');
    await expect(areas).not.toContainText('01');
  });

  test('área vazia mostra "Em construção" e sugere o primeiro recurso já com a área', async ({ page }) => {
    await page.goto('/pt');
    const areas = page.getByRole('region', { name: 'Explorar por área' });
    await expect(areas.getByText('0 recursos')).toHaveCount(0);
    await expect(areas.getByText('Em construção').first()).toBeVisible();
    await expect(areas.getByRole('link', { name: 'Sugerir o primeiro recurso de Aprender' })).toHaveAttribute(
      'href',
      /issues\/new\?template=add-resource\.yml&area=learn$/,
    );
  });

  test('sem rótulos em cima dos títulos nem segunda linha a cinza (exceto "Feito em público")', async ({ page }) => {
    await page.goto('/pt');
    const titles = await page.locator('main h2').allTextContents();
    expect(titles).toEqual(
      expect.arrayContaining([
        'Explorar por área',
        'Adicionados recentemente',
        'Feito em público.Indexado pela comunidade.',
      ]),
    );
    await expect(page.locator('main .label-mono')).toHaveCount(0);
  });

  test('adicionados recentemente: 6 linhas, sem seta, com o "por que está aqui"', async ({ page }) => {
    await page.goto('/pt');
    const list = page.getByRole('list', { name: 'Recursos adicionados recentemente' });
    await expect(list.getByRole('listitem')).toHaveCount(6);
    const kugiri = list.getByRole('link', { name: /kugiri/ });
    await expect(kugiri).toHaveAttribute('href', '/pt/r/kugiri');
    await expect(list.locator('svg')).toHaveCount(0);
  });

  test('"Pouco conhecidos" não aparece com menos de 3 destaques fora dos recentes', async ({ page }) => {
    await page.goto('/pt');
    await expect(page.getByRole('region', { name: 'Pouco conhecidos, muito úteis' })).toHaveCount(0);
  });

  test('sem coleções publicadas, a secção não aparece', async ({ page }) => {
    await page.goto('/pt');
    await expect(page.getByRole('region', { name: 'Coleções' })).toHaveCount(0);
  });

  test('contribua: botões dizem a ação, sem setas', async ({ page }) => {
    await page.goto('/pt');
    const contribute = page.getByRole('region', { name: /Feito em público/ });
    await expect(contribute.getByRole('link', { name: 'Adicionar recurso', exact: true })).toHaveAttribute(
      'href',
      '/pt/add',
    );
    await expect(contribute.getByRole('link', { name: 'Ler diretrizes', exact: true })).toBeVisible();
    await expect(contribute).not.toContainText('→');
  });

  test('o exemplo de YAML é um recurso real e não mostra notas internas', async ({ page }) => {
    await page.goto('/pt');
    const figure = page.locator('figure').filter({ hasText: 'data/resources/' });
    await expect(figure).toContainText('name: kugiri');
    await expect(figure).not.toContainText('notes:');
  });

  test('em inglês', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('region', { name: 'Browse by area' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Recently added' })).toBeVisible();
  });
});
