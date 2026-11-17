import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { settleAnimations } from './animations';

for (const [locale, form, guide] of [
  ['pt', 'Abrir formulário no GitHub', 'Ver CONTRIBUTING.md'],
  ['en', 'Open the form on GitHub', 'See CONTRIBUTING.md'],
] as const) {
  test(`/${locale}/add liga ao Issue Form e ao CONTRIBUTING.md`, async ({ page }) => {
    await page.goto(`/${locale}/add`);
    await expect(page.getByRole('link', { name: form })).toHaveAttribute(
      'href',
      'https://github.com/matheusmanuel2/frontdex/issues/new?template=add-resource.yml',
    );
    await expect(page.getByRole('link', { name: guide })).toHaveAttribute(
      'href',
      'https://github.com/matheusmanuel2/frontdex/blob/main/CONTRIBUTING.md',
    );
    await settleAnimations(page);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
  });
}
