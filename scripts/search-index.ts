import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const nextAppDirectory = '.next/server/app';
const vercelFunctionsDirectory = '.vercel/output/functions';
const vercelStaticDirectory = '.vercel/output/static';
const stagingDirectory = path.resolve('.next/pagefind-source');

function findHtmlFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findHtmlFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.html') ? [entryPath] : [];
  });
}

function findPagefindHtml(directory: string): string[] {
  return findHtmlFiles(directory).filter((file) => readFileSync(file, 'utf8').includes('data-pagefind-body'));
}

function stageVercelPages(): string | undefined {
  const pages = findPagefindHtml(vercelFunctionsDirectory).flatMap((source) => {
    const relative = path.relative(vercelFunctionsDirectory, source).split(path.sep).join('/');
    if (!/^(pt|en)\/(c|r)\/[^/]+\.prerender-fallback\.html$/.test(relative)) return [];

    return [{ source, relative: relative.replace(/\.prerender-fallback\.html$/, '.html') }];
  });

  if (pages.length === 0) return undefined;
  const locales = new Set(pages.map(({ relative }) => relative.split('/')[0]));
  if (!locales.has('pt') || !locales.has('en')) {
    throw new Error('Os HTML prerenderizados da Vercel não contêm as duas línguas para o índice Pagefind.');
  }

  rmSync(stagingDirectory, { recursive: true, force: true });
  for (const page of pages) {
    const destination = path.join(stagingDirectory, page.relative);
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(page.source, destination);
  }

  return stagingDirectory;
}

function resolvePagefindSite(): string {
  if (process.env.VERCEL === '1') {
    if (findPagefindHtml(vercelStaticDirectory).length > 0) return vercelStaticDirectory;

    const stagedPages = stageVercelPages();
    if (stagedPages) return stagedPages;
  }

  if (findPagefindHtml(nextAppDirectory).length > 0) return nextAppDirectory;
  if (findPagefindHtml(vercelStaticDirectory).length > 0) return vercelStaticDirectory;

  const stagedPages = stageVercelPages();
  if (stagedPages) return stagedPages;

  const htmlLocations = [nextAppDirectory, vercelStaticDirectory, vercelFunctionsDirectory].map((directory) => {
    const files = findHtmlFiles(directory);
    return `${directory}: ${files.length} HTML${files.length ? ` (${files.slice(0, 3).join(', ')})` : ''}`;
  });
  throw new Error(`Não foram encontrados HTMLs com data-pagefind-body. Saídas: ${htmlLocations.join('; ')}.`);
}

const site = resolvePagefindSite();
console.log(`Gerando o índice Pagefind a partir de ${site}.`);
execFileSync('pagefind', ['--site', site, '--glob', '**/*.html', '--output-path', '.next/static/pagefind'], {
  stdio: 'inherit',
});
