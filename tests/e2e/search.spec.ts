import { expect, test, type Page } from '@playwright/test';

const pagefindRequests = (page: Page) => {
  const urls: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/pagefind/')) urls.push(request.url());
  });
  return urls;
};

test.describe('⌘K', () => {
  test('o índice só carrega na primeira abertura', async ({ page }) => {
    const requests = pagefindRequests(page);
    await page.goto('/pt', { waitUntil: 'networkidle' });
    expect(requests).toEqual([]);
    await page.keyboard.press('ControlOrMeta+k');
    await expect(page.getByRole('combobox', { name: 'Buscar' })).toBeFocused();
    await expect.poll(() => requests.length).toBeGreaterThan(0);
  });

  for (const [name, open] of [
    ['⌘K', (page: Page) => page.keyboard.press('Meta+k')],
    ['Ctrl+K', (page: Page) => page.keyboard.press('Control+k')],
    ['/', (page: Page) => page.keyboard.press('/')],
    ['botão do hero', (page: Page) => page.getByRole('link', { name: /Buscar no índice/ }).click()],
  ] as const) {
    test(`abre com ${name}`, async ({ page }) => {
      await page.goto('/pt', { waitUntil: 'networkidle' });
      await open(page);
      await expect(page.getByRole('dialog')).toBeVisible();
    });
  }

  test('resultados em menos de 100 ms depois do índice carregado', async ({ page }) => {
    await page.goto('/pt', { waitUntil: 'networkidle' });
    await page.keyboard.press('ControlOrMeta+k');
    const input = page.getByRole('combobox', { name: 'Buscar' });
    await input.fill('texto');
    await expect(page.getByRole('option').first()).toBeVisible();
    await input.fill('');
    const elapsed = await page.evaluate(async () => {
      const input = document.querySelector<HTMLInputElement>('[role="combobox"]');
      if (!input) return Infinity;
      input.focus();
      const start = performance.now();
      document.execCommand('insertText', false, 'terminal');
      await new Promise<void>((resolve) => {
        const check = () =>
          [...document.querySelectorAll('[role="option"]')].some((option) => option.textContent?.includes('cmux'))
            ? resolve()
            : requestAnimationFrame(check);
        check();
      });
      return performance.now() - start;
    });
    expect(elapsed).toBeLessThan(100);
  });

  test('teclado: setas, Enter abre o recurso; foco preso; Esc fecha e devolve o foco', async ({ page }) => {
    await page.goto('/pt/c/animation', { waitUntil: 'networkidle' });
    const trigger = page.getByRole('banner').getByRole('link', { name: /Buscar/ });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();

    await page.keyboard.press('ControlOrMeta+k');
    await page.getByRole('combobox', { name: 'Buscar' }).fill('kugiri');
    await expect(page.getByRole('option', { name: /kugiri/ })).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/pt\/r\/kugiri$/);
  });

  test('menu vazio mostra os atalhos', async ({ page }) => {
    await page.goto('/pt', { waitUntil: 'networkidle' });
    await page.keyboard.press('ControlOrMeta+k');
    for (const label of ['Preciso de ícones', 'Quero aprender React', 'Bibliotecas de animação', 'Cursos gratuitos']) {
      await expect(page.getByRole('option', { name: label })).toBeVisible();
    }
  });
});

test('busca em pt não devolve páginas en e vice-versa', async ({ page }) => {
  for (const locale of ['pt', 'en']) {
    await page.goto(`/${locale}`, { waitUntil: 'networkidle' });
    await page.keyboard.press('ControlOrMeta+k');
    await page.getByRole('combobox').fill('text');
    await expect(page.getByRole('option').first()).toBeVisible();
    const hrefs = await page
      .getByRole('option')
      .evaluateAll((options) => options.map((option) => option.getAttribute('href')));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href).toMatch(new RegExp(`^/${locale}/`));
  }
});

test.describe('/search', () => {
  test('com JS mostra os resultados de ?q= com o termo realçado e chips de área', async ({ page }) => {
    await page.goto('/pt/search?q=terminal');
    await expect(page.getByRole('heading', { name: 'Resultados para “terminal”' })).toBeVisible();
    await expect(page.locator('#search-results ~ * mark, ul mark').first()).toBeVisible();
    await page.getByRole('button', { name: 'Descobrir' }).click();
    await expect(page).toHaveURL(/area=Descobrir/);
  });

  test.describe('sem JS', () => {
    test.use({ javaScriptEnabled: false });
    test('o botão de busca leva a /search e a página mostra o índice completo', async ({ page }) => {
      await page.goto('/pt/c/animation');
      await page
        .getByRole('banner')
        .getByRole('link', { name: /Buscar/ })
        .click();
      await expect(page).toHaveURL(/\/pt\/search$/);
      await page.getByRole('searchbox').fill('terminal');
      await page.getByRole('button', { name: 'Buscar', exact: true }).click();
      await expect(page).toHaveURL(/\/pt\/search\?q=terminal$/);
      await expect(page.getByRole('list', { name: 'Índice completo' }).getByRole('listitem')).toHaveCount(8);
    });
  });
});
