/**
 * Avisa o IndexNow (Bing, Yandex, Seznam, Naver…) das páginas mudadas num deploy (spec 009 §7).
 * Uso: tsx scripts/indexnow.ts <sha-base> <sha-head>
 * Precisa de INDEXNOW_KEY (a mesma do build) e SITE_URL. Sem chave, não faz nada.
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';

import { loadContent } from '../lib/content';
import { getResourcePage } from '../lib/content/queries';
import { routing } from '../lib/i18n/routing';

const ENDPOINT = 'https://api.indexnow.org/indexnow';

export function changedPaths(files: string[], content = loadContent()): string[] {
  const paths = new Set<string>();
  for (const file of files) {
    const match = /^data\/resources\/([^/]+)\.ya?ml$/.exec(file);
    if (match?.[1]) {
      const resource = getResourcePage(content, match[1]);
      if (!resource) continue;
      paths.add(`/r/${resource.slug}`);
      paths.add(`/c/${resource.category}`);
      paths.add(`/${resource.area}`);
      paths.add('/new');
      paths.add('');
    } else if (/^data\/(areas|categories)\.ya?ml$/.test(file) || file.startsWith('data/collections/')) {
      paths.add('');
    }
  }
  return routing.locales.flatMap((locale) => [...paths].map((p) => `/${locale}${p}`));
}

async function main() {
  const [base, head] = process.argv.slice(2);
  const key = process.env.INDEXNOW_KEY;
  const site = new URL(process.env.SITE_URL ?? 'https://frontdex.dev');
  if (!key) {
    console.log('INDEXNOW_KEY não definida: nada a enviar.');
    return;
  }
  if (!base || !head) throw new Error('Uso: tsx scripts/indexnow.ts <sha-base> <sha-head>');

  const files = execFileSync('git', ['diff', '--name-only', base, head], { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
    .map((file) => file.split(path.sep).join('/'));
  const urls = changedPaths(files).map((p) => new URL(p, site).toString());
  if (urls.length === 0) {
    console.log('Nenhuma página do índice mudou.');
    return;
  }

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: site.host,
      key,
      keyLocation: new URL('/indexnow.txt', site).toString(),
      urlList: urls,
    }),
  });
  console.log(`IndexNow: ${response.status} para ${urls.length} URLs`);
  if (!response.ok && response.status !== 202) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
