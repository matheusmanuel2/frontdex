import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

const buildDirectory = path.resolve('.next');
const budgetBytes = 90 * 1024;
const homePages = [
  { locale: 'pt', file: path.join(buildDirectory, 'server/app/pt.html') },
  { locale: 'en', file: path.join(buildDirectory, 'server/app/en.html') },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readFileList(manifest: Record<string, unknown>, key: string): string[] {
  const value = manifest[key];
  if (!Array.isArray(value) || !value.every((file: unknown): file is string => typeof file === 'string')) {
    throw new Error(`O build-manifest.json não contém uma lista válida em "${key}".`);
  }

  return value;
}

export function getOwnScriptPaths(html: string, sharedFiles: ReadonlySet<string>): string[] {
  const allChunkPaths = getChunkPaths(html);
  return allChunkPaths.filter((file) => !sharedFiles.has(file));
}

export function assertHomeJavaScriptBudget(locale: string, gzipBytes: number): void {
  if (gzipBytes >= budgetBytes) {
    throw new Error(`A home em ${locale} excede o orçamento estrito de 90 KB gzip.`);
  }
}

function getChunkPaths(html: string): string[] {
  const paths = new Set<string>();

  for (const match of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g)) {
    const source = match[1];
    if (!source) continue;

    const url = new URL(source, 'https://frontdex.invalid');
    if (!url.pathname.startsWith('/_next/static/chunks/')) continue;

    const file = decodeURIComponent(url.pathname.slice('/_next/'.length));
    paths.add(file);
  }

  return [...paths];
}

function measurePage(locale: string, htmlFile: string, sharedFiles: ReadonlySet<string>): void {
  const html = readFileSync(htmlFile, 'utf8');
  const allChunkPaths = getChunkPaths(html);
  if (allChunkPaths.length === 0) {
    throw new Error(`A home em ${locale} não contém scripts para medir (${htmlFile}).`);
  }
  if (!allChunkPaths.some((file) => sharedFiles.has(file))) {
    throw new Error(`Não foi possível identificar o runtime compartilhado da home em ${locale}.`);
  }
  const scriptPaths = getOwnScriptPaths(html, sharedFiles);

  const gzipBytes = scriptPaths.reduce((total, file) => {
    const absolutePath = path.resolve(buildDirectory, file);
    if (!absolutePath.startsWith(`${buildDirectory}${path.sep}`)) {
      throw new Error(`Caminho de chunk fora do build: ${file}`);
    }
    if (!existsSync(absolutePath)) {
      throw new Error(`Chunk do build não encontrado: ${absolutePath}`);
    }

    return total + gzipSync(readFileSync(absolutePath)).byteLength;
  }, 0);

  console.log(
    `JS próprio da home (${locale}): ${(gzipBytes / 1024).toFixed(1)} KB gzip / 90 KB (${scriptPaths.length} chunks).`,
  );
  assertHomeJavaScriptBudget(locale, gzipBytes);
}

export function checkHomeJavaScriptBudget(): void {
  const manifestPath = path.join(buildDirectory, 'build-manifest.json');
  const parsedManifest: unknown = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (!isRecord(parsedManifest)) {
    throw new Error(`O manifesto de build não é um objeto: ${manifestPath}`);
  }

  // O manifesto do Next separa os bootstraps do framework dos chunks específicos da rota.
  const sharedFiles = new Set([
    ...readFileList(parsedManifest, 'rootMainFiles'),
    ...readFileList(parsedManifest, 'polyfillFiles'),
  ]);
  if (sharedFiles.size === 0) {
    throw new Error(`O manifesto de build não identifica os chunks compartilhados: ${manifestPath}`);
  }

  for (const page of homePages) {
    measurePage(page.locale, page.file, sharedFiles);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  checkHomeJavaScriptBudget();
}
