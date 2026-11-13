import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('/pt/_design', () => {
  test('mostra os dois temas sem violações axe', async ({ page }) => {
    await page.goto('/pt/_design');
    await expect(page.locator('[data-theme="dark"]').first()).toBeVisible();
    await expect(page.locator('[data-theme="light"]').first()).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map((violation) => `${violation.id}: ${violation.nodes.length}`)).toEqual([]);
  });

  test('o foco é visível (2px, cor de foco) nos interativos', async ({ page }) => {
    await page.goto('/pt/_design');
    const button = page.getByRole('button', { name: 'Primário' }).first();
    await button.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    const outline = await button.evaluate((element) => {
      const style = getComputedStyle(element);
      return { width: style.outlineWidth, style: style.outlineStyle, color: style.outlineColor };
    });
    expect(outline).toEqual({ width: '2px', style: 'solid', color: 'rgb(91, 151, 255)' });
  });

  test('os ícones animam no hover e ficam estáticos com movimento reduzido', async ({ page }) => {
    await page.goto('/pt/_design');
    const host = page.getByRole('button', { name: 'arrow-up-right' }).first();
    const glyph = host.locator('.t-icon-anim');

    await host.hover();
    await expect.poll(() => glyph.evaluate((element) => getComputedStyle(element).transform)).not.toBe('none');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.mouse.move(0, 0);
    await host.hover();
    expect(await glyph.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
    expect(await glyph.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
  });

  test('diálogo prende o foco, fecha com Esc e devolve o foco', async ({ page }) => {
    await page.goto('/pt/_design');
    const trigger = page.getByRole('button', { name: 'Abrir diálogo' }).first();
    await trigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('itens do menu têm anel de foco ao navegar por teclado', async ({ page }) => {
    await page.goto('/pt/_design');
    const trigger = page.getByRole('button', { name: 'Ordenar' }).first();
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('ArrowDown');
    const item = page.locator('[role="menuitemradio"]:focus, [role="menuitem"]:focus');
    await expect(item).toHaveCount(1);
    const outline = await item.evaluate((element) => getComputedStyle(element).outlineStyle);
    expect(outline).toBe('solid');
  });
});
