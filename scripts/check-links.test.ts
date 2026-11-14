import { createHash } from 'node:crypto';

import { describe, expect, it, vi } from 'vitest';
import { parseDocument } from 'yaml';

import { checkWeeklyLinks, parseBrokenLinkMarker } from './check-links';

const resourceFile = 'data/resources/example.yaml';
const resourceSource = [
  'name: Example',
  'url: https://example.test',
  'status: active',
  'last_checked: 2026-11-01',
  '',
].join('\n');

function apiResponse(body: unknown, status = 200) {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

function issueMarker(since: string) {
  const hash = createHash('sha256').update('https://example.test').digest('hex');
  const file = Buffer.from(resourceFile).toString('base64url');
  return `<!-- frontdex-broken-link:${file}:url:${since}:${hash} -->`;
}

describe('verificação semanal de links', () => {
  it('abre um issue marcado para cada link partido e atualiza last_checked', async () => {
    const requests: { url: string; method: string; body: Record<string, unknown> }[] = [];
    const fetchImpl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      const body = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};
      requests.push({ url, method, body });

      if (url.includes('/issues?state=all&labels=broken-link')) return apiResponse([]);
      if (method === 'POST' && url.endsWith('/issues')) {
        return apiResponse({ number: 42, state: 'open', body: body.body });
      }
      return apiResponse({});
    });

    const result = await checkWeeklyLinks([{ file: resourceFile, source: resourceSource }], {
      repository: 'owner/repo',
      token: 'test-token',
      today: '2026-11-13',
      fetchImpl,
      checkLinks: async (links) => {
        const link = links.at(0);
        if (!link) throw new Error('Esperava uma URL para verificar.');
        return [{ ...link, reason: 'resposta HTTP 404' }];
      },
    });

    const createIssue = requests.find(({ method, url }) => method === 'POST' && url.endsWith('/issues'));
    expect(createIssue?.body.title).toBe('Link partido: example › url');
    expect(createIssue?.body.labels).toEqual(['broken-link']);
    expect(parseBrokenLinkMarker(String(createIssue?.body.body))).toMatchObject({
      file: resourceFile,
      field: 'url',
      since: '2026-11-13',
    });
    expect(requests.some(({ method, url }) => method === 'POST' && url.endsWith('/issues'))).toBe(true);
    expect(result.archiveResources).toEqual([]);
    expect(parseDocument(result.updatedResources[0]?.source ?? '').get('last_checked')).toBe('2026-11-13');
  });

  it('sugere arquivar o recurso quando a URL principal continua partida há 14 dias', async () => {
    const existing = {
      number: 17,
      state: 'open',
      body: `${issueMarker('2026-10-30')}\nLink indisponível.`,
    };
    const methods: string[] = [];
    const fetchImpl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      if (init?.method) methods.push(init.method);
      if (url.includes('/issues?state=all&labels=broken-link')) return apiResponse([existing]);
      return apiResponse({});
    });

    const result = await checkWeeklyLinks([{ file: resourceFile, source: resourceSource }], {
      repository: 'owner/repo',
      token: 'test-token',
      today: '2026-11-13',
      fetchImpl,
      checkLinks: async (links) => {
        const link = links.at(0);
        if (!link) throw new Error('Esperava uma URL para verificar.');
        return [{ ...link, reason: 'resposta HTTP 404' }];
      },
    });

    expect(result.archiveResources).toEqual([resourceFile]);
    expect(parseDocument(result.updatedResources[0]?.source ?? '').get('status')).toBe('archived');
    expect(methods).not.toContain('POST');
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining('/issues/17'),
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('fecha o issue quando o link volta a responder', async () => {
    const existing = {
      number: 9,
      state: 'open',
      body: `${issueMarker('2026-11-01')}\nLink indisponível.`,
    };
    const requests: { url: string; method: string; body: string }[] = [];
    const fetchImpl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      requests.push({ url, method, body: String(init?.body ?? '') });
      if (url.includes('/issues?state=all&labels=broken-link')) return apiResponse([existing]);
      return apiResponse({});
    });

    await checkWeeklyLinks([{ file: resourceFile, source: resourceSource }], {
      repository: 'owner/repo',
      token: 'test-token',
      today: '2026-11-13',
      fetchImpl,
      checkLinks: async () => [],
    });

    const closeIssue = requests.find(({ url, method }) => url.endsWith('/issues/9') && method === 'PATCH');
    expect(JSON.parse(closeIssue?.body ?? '{}')).toMatchObject({ state: 'closed', state_reason: 'completed' });
  });

  it('rejeita marcadores malformados para não criar issues duplicados', () => {
    expect(() => parseBrokenLinkMarker('<!-- frontdex-broken-link:invalid -->')).toThrow('Marcador de link partido');
  });
});
