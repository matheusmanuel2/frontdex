import { expect, test, type APIRequestContext } from '@playwright/test';

// T-402: os 4 casos da spec 007 para `/`.
async function redirectOf(request: APIRequestContext, headers: Record<string, string>) {
  const response = await request.get('/', { headers, maxRedirects: 0 });
  expect(response.status()).toBe(307);
  return new URL(response.headers()['location'] ?? '', 'http://x').pathname;
}

test('1. cookie NEXT_LOCALE vence o browser e o país', async ({ request }) => {
  expect(
    await redirectOf(request, { cookie: 'NEXT_LOCALE=en', 'accept-language': 'pt-BR', 'x-vercel-ip-country': 'AO' }),
  ).toBe('/en');
});

test('2. Accept-Language: português → /pt, outro → /en', async ({ request }) => {
  expect(await redirectOf(request, { 'accept-language': 'pt-BR,pt;q=0.9' })).toBe('/pt');
  expect(await redirectOf(request, { 'accept-language': 'de-DE,de;q=0.9', 'x-vercel-ip-country': 'BR' })).toBe('/en');
});

test('3. sem idioma do browser: país lusófono → /pt, outro → /en', async ({ request }) => {
  expect(await redirectOf(request, { 'accept-language': '', 'x-vercel-ip-country': 'AO' })).toBe('/pt');
  expect(await redirectOf(request, { 'accept-language': '', 'x-vercel-ip-country': 'US' })).toBe('/en');
});

test('4. sem sinal → /pt', async ({ request }) => {
  expect(await redirectOf(request, { 'accept-language': '' })).toBe('/pt');
});

test('nenhuma outra rota redireciona por idioma ou IP', async ({ request }) => {
  for (const path of ['/pt', '/en']) {
    const response = await request.get(path, {
      headers: { cookie: 'NEXT_LOCALE=en', 'accept-language': 'de', 'x-vercel-ip-country': 'US' },
      maxRedirects: 0,
    });
    expect(response.status(), path).toBe(200);
  }
});

test('o redirect de / mantém a query string', async ({ request }) => {
  const response = await request.get('/?utm_source=x', { headers: { 'accept-language': 'en' }, maxRedirects: 0 });
  expect(new URL(response.headers()['location'] ?? '', 'http://x').search).toBe('?utm_source=x');
});
