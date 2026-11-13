import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { parseDocument } from 'yaml';

import { checkResourceLinks, readResourceLinks, type ResourceLink, type UrlCheckError } from './check-resource-urls';

const BROKEN_LINK_LABEL = 'broken-link';
const DAY_MS = 24 * 60 * 60 * 1_000;
const MARKER_PREFIX = '<!-- frontdex-broken-link:';

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type ResourceSource = { file: string; source: string };
type ResourceRecord = ResourceSource & {
  document: ReturnType<typeof parseDocument>;
  status: 'active' | 'draft' | 'archived';
};
type IssueMarker = {
  file: string;
  field: ResourceLink['field'];
  since: string;
  fingerprint: string;
};
type GitHubIssue = {
  number: number;
  state: 'open' | 'closed';
  body: string;
  marker: IssueMarker;
};
type LinkCheckOptions = {
  repository: string;
  token: string;
  today?: string;
  fetchImpl?: FetchLike;
  checkLinks?: (links: ResourceLink[]) => Promise<UrlCheckError[]>;
};
export type LinkCheckResult = {
  updatedResources: ResourceSource[];
  archiveResources: string[];
  brokenLinks: UrlCheckError[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function fingerprint(url: string): string {
  return createHash('sha256').update(url).digest('hex');
}

function markerFor({ file, field, since, fingerprint: urlFingerprint }: IssueMarker): string {
  const encodedFile = Buffer.from(file).toString('base64url');
  return `${MARKER_PREFIX}${encodedFile}:${field}:${since}:${urlFingerprint} -->`;
}

export function parseBrokenLinkMarker(body: string): IssueMarker | undefined {
  const line = body.split(/\r?\n/).find((candidate) => candidate.startsWith(MARKER_PREFIX));
  if (!line) return undefined;
  const match = /^<!-- frontdex-broken-link:([A-Za-z0-9_-]+):(url|repo):(\d{4}-\d{2}-\d{2}):([a-f0-9]{64}) -->$/.exec(
    line,
  );
  if (!match) throw new Error('Marcador de link partido inválido num issue existente.');

  const [, encodedFile, field, since, urlFingerprint] = match;
  if (!encodedFile || !field || !since || !urlFingerprint) {
    throw new Error('Marcador de link partido inválido num issue existente.');
  }
  const file = Buffer.from(encodedFile, 'base64url').toString('utf8');
  if (!file.startsWith('data/resources/') || !file.endsWith('.yaml') || !isDate(since)) {
    throw new Error('Marcador de link partido inválido num issue existente.');
  }
  if (field !== 'url' && field !== 'repo') throw new Error('Campo inválido no marcador de link partido.');
  return { file, field, since, fingerprint: urlFingerprint };
}

function displayUrl(value: string): string {
  try {
    const url = new URL(value);
    url.username = '';
    url.password = '';
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return 'URL inválida';
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character] ?? character;
  });
}

function issueBody(link: ResourceLink, reason: string, marker: IssueMarker): string {
  return [
    markerFor(marker),
    '## Link partido',
    '',
    `Ficheiro: \`${link.file}\``,
    `Campo: \`${link.field}\``,
    `URL verificada: ${displayUrl(link.url)}`,
    `Motivo: <code>${escapeHtml(reason.replace(/[\r\n]/g, ' '))}</code>`,
    `Detetado desde: ${marker.since}`,
    '',
    'Corrija o campo indicado no YAML. Se o link continuar indisponível por 14 dias, o bot propõe arquivar o recurso.',
  ].join('\n');
}

function parseResource(file: string, source: string): ResourceRecord {
  const document = parseDocument(source, { prettyErrors: false });
  if (document.errors.length > 0) {
    throw new Error(
      `${file} › (ficheiro) › YAML inválido: ${document.errors.map((error) => error.message).join('; ')}`,
    );
  }
  const resource: unknown = document.toJS();
  if (!isRecord(resource)) throw new Error(`${file} › (ficheiro) › esperado um objeto YAML de recurso.`);
  const status = resource.status;
  if (status !== 'active' && status !== 'draft' && status !== 'archived') {
    throw new Error(`${file} › status › estado de recurso inválido.`);
  }
  return { file, source, document, status };
}

function parseGitHubIssue(value: unknown): GitHubIssue | undefined {
  if (!isRecord(value) || 'pull_request' in value) return undefined;
  if (
    typeof value.number !== 'number' ||
    !Number.isInteger(value.number) ||
    (value.state !== 'open' && value.state !== 'closed')
  ) {
    throw new Error('A GitHub API devolveu um issue inválido.');
  }
  const body = typeof value.body === 'string' ? value.body : '';
  const marker = parseBrokenLinkMarker(body);
  return marker ? { number: value.number, state: value.state, body, marker } : undefined;
}

async function requestJson(
  fetchImpl: FetchLike,
  url: string,
  token: string,
  method = 'GET',
  body?: unknown,
): Promise<unknown> {
  const response = await fetchImpl(url, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(15_000),
  });
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`GitHub API ${method} ${url} respondeu ${response.status}: ${responseText.slice(0, 500)}`);
  }
  return responseText ? JSON.parse(responseText) : undefined;
}

async function listBrokenIssues(fetchImpl: FetchLike, repositoryUrl: string, token: string): Promise<GitHubIssue[]> {
  const issues: GitHubIssue[] = [];
  for (let page = 1; ; page += 1) {
    const result = await requestJson(
      fetchImpl,
      `${repositoryUrl}/issues?state=all&labels=${BROKEN_LINK_LABEL}&per_page=100&page=${page}`,
      token,
    );
    if (!Array.isArray(result)) throw new Error('A GitHub API devolveu uma lista de issues inválida.');
    const parsed = result.map(parseGitHubIssue).filter((issue): issue is GitHubIssue => issue !== undefined);
    issues.push(...parsed);
    if (result.length < 100) break;
  }
  const keys = new Set<string>();
  for (const issue of issues) {
    const key = `${issue.marker.file}:${issue.marker.field}`;
    if (keys.has(key))
      throw new Error(`Há mais de um issue broken-link para ${key}; resolve a duplicação manualmente.`);
    keys.add(key);
  }
  return issues;
}

function daysSince(date: string, today: string): number {
  return (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / DAY_MS;
}

function validateOptions({ repository, token, today }: LinkCheckOptions): { repositoryUrl: string; today: string } {
  const [owner, repo, extra] = repository.split('/');
  if (!owner || !repo || extra) throw new Error('GITHUB_REPOSITORY tem de estar no formato owner/repo.');
  if (!token) throw new Error('GITHUB_TOKEN é obrigatório para sincronizar issues.');
  const date = today ?? new Date().toISOString().slice(0, 10);
  if (!isDate(date)) throw new Error('A data de verificação tem de estar no formato YYYY-MM-DD.');
  return {
    repositoryUrl: `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    today: date,
  };
}

async function syncBrokenIssue(
  fetchImpl: FetchLike,
  repositoryUrl: string,
  token: string,
  link: UrlCheckError,
  existing: GitHubIssue | undefined,
  today: string,
): Promise<{ issue: GitHubIssue; shouldArchive: boolean }> {
  const urlFingerprint = fingerprint(link.url);
  const sameBrokenUrl = existing?.marker.fingerprint === urlFingerprint;
  const since = existing?.state === 'open' && sameBrokenUrl ? existing.marker.since : today;
  const marker = { file: link.file, field: link.field, since, fingerprint: urlFingerprint };
  const body = issueBody(link, link.reason, marker);
  const title = `Link partido: ${path.basename(link.file, '.yaml')} › ${link.field}`;
  let issueNumber: number;
  let state: GitHubIssue['state'] = 'open';

  if (!existing) {
    const created = await requestJson(fetchImpl, `${repositoryUrl}/issues`, token, 'POST', {
      title,
      body,
      labels: [BROKEN_LINK_LABEL],
    });
    const parsed = parseGitHubIssue(created);
    if (!parsed) throw new Error(`A GitHub API não devolveu o issue criado para ${link.file} › ${link.field}.`);
    issueNumber = parsed.number;
  } else {
    issueNumber = existing.number;
    if (existing.state === 'closed') {
      await requestJson(fetchImpl, `${repositoryUrl}/issues/${issueNumber}`, token, 'PATCH', {
        state: 'open',
        state_reason: 'reopened',
        title,
        body,
      });
    } else if (existing.body !== body) {
      await requestJson(fetchImpl, `${repositoryUrl}/issues/${issueNumber}`, token, 'PATCH', { title, body });
    }
    state = existing.state === 'closed' ? 'open' : existing.state;
  }

  const issue: GitHubIssue = { number: issueNumber, state, body, marker };
  return { issue, shouldArchive: daysSince(since, today) >= 14 };
}

async function closeIssue(
  fetchImpl: FetchLike,
  repositoryUrl: string,
  token: string,
  issue: GitHubIssue,
  today: string,
): Promise<void> {
  await requestJson(fetchImpl, `${repositoryUrl}/issues/${issue.number}`, token, 'PATCH', {
    state: 'closed',
    state_reason: 'completed',
    body: `${issue.body}\n\nLink verificado como disponível em ${today}.`,
  });
}

export async function checkWeeklyLinks(
  resources: ResourceSource[],
  options: LinkCheckOptions,
): Promise<LinkCheckResult> {
  const { repositoryUrl, today } = validateOptions(options);
  const fetchImpl = options.fetchImpl ?? fetch;
  const parsedResources = resources.map(({ file, source }) => parseResource(file, source));
  const links = parsedResources
    .filter((resource) => resource.status !== 'archived')
    .flatMap((resource) => readResourceLinks(resource.file, resource.source));
  const checkLinks = options.checkLinks ?? ((candidateLinks) => checkResourceLinks(candidateLinks));
  const brokenLinks = await checkLinks(links);
  const issues = await listBrokenIssues(fetchImpl, repositoryUrl, options.token);
  const issuesByKey = new Map(issues.map((issue) => [`${issue.marker.file}:${issue.marker.field}`, issue]));
  const activeIssues = new Set<string>();
  const resourceFiles = new Set(parsedResources.map((resource) => resource.file));
  const checkedResources = new Set(
    parsedResources.filter((resource) => resource.status !== 'archived').map((resource) => resource.file),
  );
  const archiveResources = new Set<string>();

  for (const link of brokenLinks) {
    const key = `${link.file}:${link.field}`;
    activeIssues.add(key);
    const { issue, shouldArchive } = await syncBrokenIssue(
      fetchImpl,
      repositoryUrl,
      options.token,
      link,
      issuesByKey.get(key),
      today,
    );
    if (shouldArchive) {
      const resource = parsedResources.find((candidate) => candidate.file === link.file);
      if (resource?.status === 'active') archiveResources.add(link.file);
    }
    issuesByKey.set(key, issue);
  }

  for (const [key, issue] of issuesByKey) {
    if (issue.state === 'open' && !activeIssues.has(key)) {
      if (checkedResources.has(issue.marker.file) || !resourceFiles.has(issue.marker.file)) {
        await closeIssue(fetchImpl, repositoryUrl, options.token, issue, today);
      }
    }
  }

  const updatedResources: ResourceSource[] = [];
  for (const resource of parsedResources) {
    if (resource.status === 'archived') continue;
    const raw = resource.document.toJS();
    if (!isRecord(raw)) continue;
    let changed = false;
    if (raw.last_checked !== today) {
      resource.document.set('last_checked', today);
      changed = true;
    }
    if (archiveResources.has(resource.file) && raw.status !== 'archived') {
      resource.document.set('status', 'archived');
      changed = true;
    }
    if (changed) updatedResources.push({ file: resource.file, source: resource.document.toString() });
  }

  return { updatedResources, archiveResources: [...archiveResources].sort(), brokenLinks };
}

function readResourceFiles(resourcesDir: string): ResourceSource[] {
  return readdirSync(resourcesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.yaml'))
    .map((entry) => path.join(resourcesDir, entry.name))
    .sort()
    .map((file) => ({
      file: path.relative(process.cwd(), file).split(path.sep).join('/'),
      source: readFileSync(file, 'utf8'),
    }));
}

async function main() {
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  if (!repository || !token) throw new Error('Define GITHUB_REPOSITORY e GITHUB_TOKEN.');

  const resourcesDir = path.resolve(process.argv[2] ?? 'data/resources');
  const result = await checkWeeklyLinks(readResourceFiles(resourcesDir), { repository, token });
  for (const error of result.brokenLinks) {
    console.error(`${error.file} › ${error.field} › ${error.reason}`);
  }
  for (const resource of result.updatedResources) writeFileSync(resource.file, resource.source);
  console.log(
    `Verificação concluída: ${result.brokenLinks.length} links partidos, ${result.updatedResources.length} YAML atualizado(s), ${result.archiveResources.length} recurso(s) para arquivar.`,
  );
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (isMain) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
