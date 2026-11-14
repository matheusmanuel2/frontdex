import { describe, expect, it } from 'vitest';

import { parseValidationErrors, upsertValidationFeedback, VALIDATION_COMMENT_MARKER } from './report-validation-errors';

function fakeResponse(body: unknown, status = 200) {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

describe('comentário de erros de conteúdo no PR', () => {
  it('extrai as linhas de erro e rejeita logs sem erros formatados', () => {
    expect(parseValidationErrors('! aviso\n✗ data/resources/item.yaml › url › URL inválida\n✗ erro geral')).toEqual([
      '✗ data/resources/item.yaml › url › URL inválida',
    ]);
    expect(() => parseValidationErrors('✓ Conteúdo válido')).toThrow('formato esperado');
  });

  it('atualiza o comentário marcado existente em vez de criar outro', async () => {
    const requests: { url: string; method: string; body: string }[] = [];
    const fetchImpl = async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      requests.push({ url, method, body: String(init?.body ?? '') });
      if (url.endsWith('/comments?per_page=100&page=1')) {
        return fakeResponse([{ id: 17, body: `${VALIDATION_COMMENT_MARKER}\nold error` }]);
      }
      return fakeResponse({});
    };

    await upsertValidationFeedback({
      token: 'test-token',
      repository: 'owner/repo',
      pullRequestNumber: 23,
      errors: ['✗ data/resources/item.yaml › url › URL <inválida>'],
      fetchImpl,
    });

    expect(requests.filter(({ method, url }) => method === 'POST' && url.endsWith('/comments'))).toHaveLength(0);
    expect(requests.some(({ method, url }) => method === 'PATCH' && url.endsWith('/issues/comments/17'))).toBe(true);
    expect(requests.find(({ url }) => url.endsWith('/issues/comments/17'))?.body).toContain('&lt;inválida&gt;');
    expect(requests.some(({ method, url }) => method === 'POST' && url.endsWith('/labels'))).toBe(true);
  });

  it('cria um único comentário quando ainda não existe', async () => {
    const requests: { url: string; method: string }[] = [];
    const fetchImpl = async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      requests.push({ url, method });
      if (url.endsWith('/comments?per_page=100&page=1')) return fakeResponse([]);
      return fakeResponse({});
    };

    await upsertValidationFeedback({
      token: 'test-token',
      repository: 'owner/repo',
      pullRequestNumber: 24,
      errors: ['✗ data/resources/item.yaml › url › URL inválida'],
      fetchImpl,
    });

    expect(requests.filter(({ method, url }) => method === 'POST' && url.endsWith('/comments'))).toHaveLength(1);
  });
});
