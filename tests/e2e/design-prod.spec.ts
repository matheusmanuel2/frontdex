import { expect, test } from '@playwright/test';

test('/_design não existe no build de produção', async ({ request }) => {
  const response = await request.get('/_design');
  expect(response.status()).toBe(404);
});
