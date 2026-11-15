/**
 * Verificação de SEO do build (spec 009 §7). Corre depois de `pnpm build`:
 * - recursos publicados têm descrição em pt e en; quem tem "why" tem-no nos dois idiomas;
 * - todo o JSON-LD é JSON válido com @context schema.org e nós com @type;
 * - páginas indexáveis têm um só <h1>, canonical e hreflang pt/en/x-default;
 * - cada URL do sitemap corresponde a uma página gerada e indexável;
 * - robots.txt aponta para o sitemap; llms.txt e /api/resources.json existem.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { loadContent } from '../lib/content';
import { listResources } from '../lib/content/queries';

export type SeoProblem = { where: string; problem: string };

const APP_DIR = path.join('.next', 'server', 'app');

export function checkContent(content = loadContent()): SeoProblem[] {
  const problems: SeoProblem[] = [];
  for (const resource of listResources(content)) {
    const where = `data/resources/${resource.slug}.yaml`;
    for (const locale of ['pt', 'en'] as const) {
      if (!resource.description[locale]?.trim()) problems.push({ where, problem: `description.${locale} vazia` });
    }
    if (resource.why && Boolean(resource.why.pt) !== Boolean(resource.why.en)) {
      problems.push({ where, problem: 'why tem de existir nos dois idiomas (pt e en) ou em nenhum' });
    }
  }
  return problems;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function checkJsonLd(where: string, html: string): SeoProblem[] {
  const problems: SeoProblem[] = [];
  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  for (const [, raw = ''] of blocks) {
    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      problems.push({ where, problem: 'JSON-LD não é JSON válido' });
      continue;
    }
    if (!isRecord(data) || data['@context'] !== 'https://schema.org') {
      problems.push({ where, problem: 'JSON-LD sem @context https://schema.org' });
      continue;
    }
    const nodes = Array.isArray(data['@graph']) ? data['@graph'] : [data];
    for (const node of nodes) {
      if (!isRecord(node) || typeof node['@type'] !== 'string') {
        problems.push({ where, problem: 'nó de JSON-LD sem @type' });
        continue;
      }
      if (node['@type'] === 'BreadcrumbList') {
        const items = Array.isArray(node.itemListElement) ? node.itemListElement : [];
        items.forEach((item, index) => {
          if (!isRecord(item) || item.position !== index + 1 || typeof item.item !== 'string' || !item.name) {
            problems.push({ where, problem: `BreadcrumbList: item ${index + 1} inválido` });
          } else if (!/^https:\/\//.test(item.item)) {
            problems.push({ where, problem: `BreadcrumbList: item ${index + 1} sem URL absoluto` });
          }
        });
      }
    }
  }
  return problems;
}

export function isNoindex(html: string): boolean {
  return /<meta name="robots" content="[^"]*noindex/.test(html);
}

export function checkPage(where: string, html: string): SeoProblem[] {
  const problems = checkJsonLd(where, html);
  if (isNoindex(html)) return problems;
  const h1 = html.match(/<h1[\s>]/g)?.length ?? 0;
  if (h1 !== 1) problems.push({ where, problem: `tem ${h1} <h1> (esperado 1)` });
  if (!/<link rel="canonical" href="https:\/\/[^"]+"/.test(html)) problems.push({ where, problem: 'sem canonical' });
  for (const lang of ['pt', 'en', 'x-default']) {
    if (!html.includes(`hrefLang="${lang}"`)) problems.push({ where, problem: `sem hreflang ${lang}` });
  }
  return problems;
}

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(file);
    return entry.name.endsWith('.html') ? [file] : [];
  });
}

export function checkSitemap(xml: string, pageFor: (pathname: string) => string | undefined): SeoProblem[] {
  const problems: SeoProblem[] = [];
  for (const [, loc = ''] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const { pathname } = new URL(loc);
    const html = pageFor(pathname);
    if (html === undefined) problems.push({ where: 'sitemap.xml', problem: `${loc} não tem página gerada` });
    else if (isNoindex(html)) problems.push({ where: 'sitemap.xml', problem: `${loc} é noindex` });
  }
  return problems;
}

function read(file: string): string | undefined {
  return existsSync(file) ? readFileSync(file, 'utf8') : undefined;
}

function main() {
  if (!existsSync(APP_DIR)) {
    console.error('Sem build em .next/: corre `pnpm build` primeiro.');
    process.exit(1);
  }
  const problems: SeoProblem[] = [...checkContent()];

  for (const file of htmlFiles(APP_DIR)) {
    const where = path.relative(APP_DIR, file);
    if (where.startsWith('_global-error') || where.startsWith('[locale]')) continue;
    const html = readFileSync(file, 'utf8');
    if (where.startsWith('_not-found')) problems.push(...checkJsonLd(where, html));
    else problems.push(...checkPage(where, html));
  }

  const sitemap = read(path.join(APP_DIR, 'sitemap.xml.body'));
  if (!sitemap) problems.push({ where: 'sitemap.xml', problem: 'não foi gerado' });
  else problems.push(...checkSitemap(sitemap, (pathname) => read(path.join(APP_DIR, `${pathname}.html`))));

  const robots = read(path.join(APP_DIR, 'robots.txt.body'));
  if (!robots?.includes('Sitemap: ')) problems.push({ where: 'robots.txt', problem: 'sem linha Sitemap' });
  for (const file of ['llms.txt.body', 'llms-full.txt.body', path.join('api', 'resources.json.body')]) {
    if (!read(path.join(APP_DIR, file))) problems.push({ where: file.replace('.body', ''), problem: 'não foi gerado' });
  }

  if (problems.length > 0) {
    for (const { where, problem } of problems) console.error(`✗ ${where}: ${problem}`);
    console.error(`\n${problems.length} problema(s) de SEO.`);
    process.exit(1);
  }
  console.log('✓ SEO: JSON-LD, canonical, hreflang, h1, sitemap, robots e llms.txt em ordem.');
}

if (import.meta.url === `file://${process.argv[1]}`) main();
