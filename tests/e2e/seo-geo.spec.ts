import { expect, test } from '@playwright/test';

const ICONS: [string, RegExp][] = [
  ['/favicon.ico', /image\/(x-icon|vnd\.microsoft\.icon)/],
  ['/icon.svg', /image\/svg\+xml/],
  ['/apple-touch-icon.png', /image\/png/],
  ['/icon-192.png', /image\/png/],
  ['/icon-512.png', /image\/png/],
  ['/site.webmanifest', /application\/manifest\+json|application\/json/],
];

for (const [path, type] of ICONS) {
  test(`${path} responde 200 com o Content-Type certo`, async ({ request }) => {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(type);
  });
}

test('todas as páginas declaram favicon, ícone SVG, apple-touch-icon e manifest', async ({ page }) => {
  for (const path of ['/pt', '/en/r/kugiri', '/pt/qualquer-coisa']) {
    await page.goto(path);
    const head = page.locator('head');
    await expect(head.locator('link[rel="icon"][href="/favicon.ico"][sizes="48x48"]')).toHaveCount(1);
    await expect(head.locator('link[rel="icon"][href="/icon.svg"][type="image/svg+xml"]')).toHaveCount(1);
    await expect(head.locator('link[rel="apple-touch-icon"][href="/apple-touch-icon.png"]')).toHaveCount(1);
    await expect(head.locator('link[rel="manifest"][href="/site.webmanifest"]')).toHaveCount(1);
  }
});

test('llms.txt, llms-full.txt e resources.json são gerados a partir dos dados', async ({ request }) => {
  const llms = await (await request.get('/llms.txt')).text();
  expect(llms).toMatch(/^# FrontDex/);
  expect(llms).toContain('/api/resources.json');
  const full = await (await request.get('/llms-full.txt')).text();
  expect(full).toContain('#### kugiri');
  expect(full).toContain('Why it is here:');
  const data = await (await request.get('/api/resources.json')).json();
  expect(data.license.name).toBe('CC BY 4.0');
  expect(data.resources.find((r: { slug: string }) => r.slug === 'kugiri').pages.en).toMatch(/\/en\/r\/kugiri$/);
});

test('recurso tem JSON-LD WebPage + BreadcrumbList e factos com <time>', async ({ page }) => {
  await page.goto('/pt/r/kugiri');
  const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
  const types = JSON.parse(raw ?? '{}')['@graph'].map((node: { '@type': string }) => node['@type']);
  expect(types).toEqual(['WebPage', 'BreadcrumbList']);
  await expect(page.locator('time[datetime="2026-11-12"]').first()).toBeVisible();
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://frontdex.dev/pt/r/kugiri');
});

test('home tem Organization e WebSite; /random é noindex', async ({ page }) => {
  await page.goto('/pt');
  const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
  const types = JSON.parse(raw ?? '{}')['@graph'].map((node: { '@type': string }) => node['@type']);
  expect(types).toEqual(['Organization', 'WebSite']);
  await page.goto('/pt/random');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('robots.txt deixa entrar os crawlers de busca e de IA', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  for (const agent of ['Googlebot', 'OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot', 'GPTBot', 'ClaudeBot']) {
    expect(robots).toContain(`User-Agent: ${agent}`);
  }
  expect(robots).not.toMatch(/Disallow: \/\s*$/m);
});
