import { readFileSync } from 'node:fs';
import path from 'node:path';

export const VALIDATION_COMMENT_MARKER = '<!-- frontdex-validation-errors -->';

type Comment = { id: number; body: string };
type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type FeedbackOptions = {
  token: string;
  repository: string;
  pullRequestNumber: number;
  errors: string[];
  fetchImpl?: FetchLike;
};

function isComment(value: unknown): value is Comment {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    'body' in value &&
    typeof value.body === 'string'
  );
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => {
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

export function parseValidationErrors(output: string): string[] {
  const errors = output.split(/\r?\n/).filter((line) => line.startsWith('✗') && line.includes(' › '));
  if (errors.length === 0) throw new Error('O log não contém erros de conteúdo no formato esperado.');
  return errors;
}

function validationComment(errors: string[]): string {
  return [
    VALIDATION_COMMENT_MARKER,
    '## O conteúdo precisa de ajustes',
    '',
    'A validação encontrou estes erros em `data/`:',
    '',
    `<pre>${escapeHtml(errors.join('\n'))}</pre>`,
    '',
    'Corrija os campos no YAML e envie uma nova atualização para este PR.',
  ].join('\n');
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

export async function upsertValidationFeedback({
  token,
  repository,
  pullRequestNumber,
  errors,
  fetchImpl = fetch,
}: FeedbackOptions): Promise<void> {
  const [owner, repo, extra] = repository.split('/');
  if (!owner || !repo || extra) throw new Error('GITHUB_REPOSITORY tem de estar no formato owner/repo.');
  if (!Number.isInteger(pullRequestNumber) || pullRequestNumber < 1) {
    throw new Error('O número do pull request é inválido.');
  }
  if (errors.length === 0) throw new Error('Não é possível comentar sem erros de validação.');

  const baseUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${pullRequestNumber}`;
  let page = 1;
  let existing: Comment | undefined;

  while (!existing) {
    const result = await requestJson(fetchImpl, `${baseUrl}/comments?per_page=100&page=${page}`, token);
    if (!Array.isArray(result) || !result.every(isComment)) {
      throw new Error('A GitHub API devolveu uma lista de comentários inválida.');
    }
    existing = result.find((comment) => comment.body.includes(VALIDATION_COMMENT_MARKER));
    if (result.length < 100) break;
    page += 1;
  }

  await requestJson(fetchImpl, `${baseUrl}/labels`, token, 'POST', { labels: ['needs-changes'] });
  const body = validationComment(errors);
  if (existing) {
    await requestJson(
      fetchImpl,
      `https://api.github.com/repos/${owner}/${repo}/issues/comments/${existing.id}`,
      token,
      'PATCH',
      { body },
    );
    return;
  }
  await requestJson(fetchImpl, `${baseUrl}/comments`, token, 'POST', { body });
}

function main() {
  const logPath = process.argv[2] ?? process.env.VALIDATION_LOG;
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  const pullRequestNumber = Number(process.env.PR_NUMBER);
  if (!logPath || !repository || !token) {
    throw new Error('Define o log de validação, GITHUB_REPOSITORY e GITHUB_TOKEN.');
  }

  const errors = parseValidationErrors(readFileSync(logPath, 'utf8'));
  return upsertValidationFeedback({ token, repository, pullRequestNumber, errors });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (isMain) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
