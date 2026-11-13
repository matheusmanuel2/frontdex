import { expect, test } from '@playwright/test';

test('/pt/_design não existe no build de produção', async ({ request }) => {
  const response = await request.get('/pt/_design');
  expect(response.status()).toBe(404);
});
