import { execFileSync } from 'node:child_process';
import { lookup } from 'node:dns/promises';
import { readFileSync } from 'node:fs';
import { BlockList, isIP } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseDocument } from 'yaml';

export type ResourceLink = { file: string; field: 'url' | 'repo'; url: string };
export type UrlCheckError = ResourceLink & { reason: string };
type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type ResolveHost = (
  hostname: string,
  options: { all: true; verbatim: true },
) => Promise<{ address: string; family: number }[]>;
type CheckOptions = {
  fetchImpl?: FetchLike;
  resolveHost?: ResolveHost;
  attempts?: number;
  timeoutMs?: number;
  retryDelay?: (attempt: number) => Promise<void>;
};

const NON_PUBLIC_IPV4 = new BlockList();
for (const [subnet, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const) {
  NON_PUBLIC_IPV4.addSubnet(subnet, prefix, 'ipv4');
}
const NON_PUBLIC_IPV6 = new BlockList();
for (const [subnet, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['::ffff:0:0', 96],
  ['64:ff9b::', 96],
  ['100::', 64],
  ['2001::', 23],
  ['2001:db8::', 32],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const) {
  NON_PUBLIC_IPV6.addSubnet(subnet, prefix, 'ipv6');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseChangedResourceFiles(output: string): string[] {
  return [
    ...new Set(
      output
        .split('\0')
        .filter((file) => file.startsWith('data/resources/') && file.endsWith('.yaml') && !file.includes('/../')),
    ),
  ];
}

export function readResourceLinks(file: string, source: string): ResourceLink[] {
  const document = parseDocument(source, { prettyErrors: false });
  if (document.errors.length > 0) {
    throw new Error(
      `${file} › (ficheiro) › YAML inválido: ${document.errors.map((error) => error.message).join('; ')}`,
    );
  }
  const resource: unknown = document.toJS();
  if (!isRecord(resource)) throw new Error(`${file} › (ficheiro) › esperado um objeto YAML de recurso.`);
  if (typeof resource.url !== 'string' || resource.url.trim() === '') {
    throw new Error(`${file} › url › URL principal em falta ou inválida.`);
  }

  const links: ResourceLink[] = [{ file, field: 'url', url: resource.url }];
  if (resource.repo !== undefined) {
    if (typeof resource.repo !== 'string' || resource.repo.trim() === '') {
      throw new Error(`${file} › repo › URL do repositório inválida.`);
    }
    links.push({ file, field: 'repo', url: resource.repo });
  }
  return links;
}

function protocolError(link: ResourceLink): string | undefined {
  let url: URL;
  try {
    url = new URL(link.url);
  } catch {
    return 'URL inválida';
  }
  if (url.username || url.password) return 'URLs com credenciais não são aceites';
  if (link.field === 'url' && url.protocol !== 'https:') return 'a URL principal tem de usar https://';
  if (link.field === 'repo' && !['https:', 'http:'].includes(url.protocol)) return 'o repositório tem de usar HTTP(S)';
  return undefined;
}

async function assertPublicTarget(url: URL, field: ResourceLink['field'], resolveHost: ResolveHost): Promise<void> {
  if (url.username || url.password) throw new Error('redirecionamento com credenciais não é permitido');
  if (field === 'url' && url.protocol !== 'https:') throw new Error('redirecionamento da URL principal sem HTTPS');
  if (field === 'repo' && !['https:', 'http:'].includes(url.protocol)) {
    throw new Error('redirecionamento do repositório para protocolo inválido');
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
    throw new Error('host local não é permitido');
  }

  const family = isIP(hostname);
  const addresses = family
    ? [{ address: hostname, family }]
    : await resolveHost(hostname, { all: true, verbatim: true });
  if (addresses.length === 0) throw new Error('host sem endereços DNS');
  if (
    addresses.some((address) =>
      (address.family === 4 ? NON_PUBLIC_IPV4 : NON_PUBLIC_IPV6).check(
        address.address,
        address.family === 4 ? 'ipv4' : 'ipv6',
      ),
    )
  ) {
    throw new Error('host resolve para um endereço IP não público');
  }
}

async function fetchWithPublicRedirects(
  initialUrl: string,
  field: ResourceLink['field'],
  method: 'HEAD' | 'GET',
  fetchImpl: FetchLike,
  resolveHost: ResolveHost,
  timeoutMs: number,
): Promise<Response> {
  let url = new URL(initialUrl);
  for (let redirects = 0; redirects <= 5; redirects += 1) {
    await assertPublicTarget(url, field, resolveHost);
    const response = await fetchImpl(url, {
      method,
      ...(method === 'GET' ? { headers: { Range: 'bytes=0-0' } } : {}),
      redirect: 'manual',
      signal: AbortSignal.timeout(timeoutMs),
    });
    const location = response.headers.get('location');
    if (![301, 302, 303, 307, 308].includes(response.status) || !location) return response;
    await response.body?.cancel();
    if (redirects === 5) throw new Error('demasiados redirecionamentos');
    url = new URL(location, url);
  }
  throw new Error('demasiados redirecionamentos');
}

async function checkLink(
  link: ResourceLink,
  {
    fetchImpl = fetch,
    resolveHost = lookup,
    attempts = 3,
    timeoutMs = 10_000,
    retryDelay = defaultRetryDelay,
  }: CheckOptions,
): Promise<UrlCheckError | undefined> {
  const invalidProtocol = protocolError(link);
  if (invalidProtocol) return { ...link, reason: invalidProtocol };

  let reason = 'sem resposta';
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      let response = await fetchWithPublicRedirects(link.url, link.field, 'HEAD', fetchImpl, resolveHost, timeoutMs);
      if (response.status === 405 || response.status === 501) {
        await response.body?.cancel();
        response = await fetchWithPublicRedirects(link.url, link.field, 'GET', fetchImpl, resolveHost, timeoutMs);
      }

      await response.body?.cancel();
      if (response.status >= 200 && response.status < 400) return undefined;
      reason = `resposta HTTP ${response.status}`;
      if (response.status < 500 && response.status !== 408 && response.status !== 429) break;
    } catch (error) {
      reason = error instanceof Error ? error.message : String(error);
    }
    if (attempt < attempts) await retryDelay(attempt);
  }
  return { ...link, reason };
}

function defaultRetryDelay(attempt: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.min(attempt * 250, 1_000)));
}

export async function checkResourceLinks(links: ResourceLink[], options: CheckOptions = {}): Promise<UrlCheckError[]> {
  const errors: UrlCheckError[] = [];
  for (const link of links) {
    const error = await checkLink(link, options);
    if (error) errors.push(error);
  }
  return errors;
}

function changedResourceFiles(baseRef: string, headRef: string): string[] {
  if (!baseRef || !headRef || baseRef.startsWith('-') || headRef.startsWith('-')) {
    throw new Error('Informa as referências base e head para comparar o pull request.');
  }
  const output = execFileSync(
    'git',
    ['diff', '--name-only', '--diff-filter=ACMR', '-z', `${baseRef}...${headRef}`, '--', 'data/resources/*.yaml'],
    { encoding: 'utf8' },
  );
  return parseChangedResourceFiles(output);
}

async function main() {
  const [baseRef, headRef] = process.argv.slice(2);
  const files = changedResourceFiles(baseRef ?? '', headRef ?? '');
  if (files.length === 0) {
    console.log('Nenhum YAML de recurso alterado; nenhuma URL para verificar.');
    return;
  }

  const links = files.flatMap((file) => readResourceLinks(file, readFileSync(file, 'utf8')));
  const errors = await checkResourceLinks(links);
  for (const error of errors) {
    console.error(`${error.file} › ${error.field} › ${error.reason}`);
  }
  if (errors.length > 0) {
    process.exitCode = 1;
    return;
  }
  console.log(`URLs válidas: ${links.length} em ${files.length} YAML alterado(s).`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
