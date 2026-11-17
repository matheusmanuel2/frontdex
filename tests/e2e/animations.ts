import type { Page } from '@playwright/test';

/**
 * Espera que as animações em curso terminem (entrada das páginas, recipe 18; hero).
 * O axe mede o contraste com a opacidade do momento: a meio do fade dava falsos erros.
 */
export async function settleAnimations(page: Page) {
  await page.evaluate(async () => {
    await Promise.all(document.getAnimations().map((animation) => animation.finished));
  });
}
