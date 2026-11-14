import { describe, expect, it, vi } from 'vitest';

import { checkResourceLinks, parseChangedResourceFiles, readResourceLinks } from './check-resource-urls';

function response(status: number) {
  return new Response(null, { status });
}

const resolvePublicHost = async () => [{ address: '93.184.216.34', family: 4 }];

describe('verificação de URLs nos YAML alterados', () => {
  it('seleciona apenas ficheiros YAML de recursos alterados', () => {
    expect(
      parseChangedResourceFiles(
        'README.md\0data/resources/example.yaml\0data/resources/deleted.yml\0data/areas.yaml\0data/resources/example.yaml\0',
      ),
    ).toEqual(['data/resources/example.yaml']);
  });

  it('lê URL principal e repositório sem alterar os valores', () => {
    expect(
      readResourceLinks(
        'data/resources/example.yaml',
        'name: Example\nurl: https://example.test\nrepo: http://git.example.test/project\n',
      ),
    ).toEqual([
      { file: 'data/resources/example.yaml', field: 'url', url: 'https://example.test' },
      { file: 'data/resources/example.yaml', field: 'repo', url: 'http://git.example.test/project' },
    ]);
  });

  it('exige HTTPS para a URL principal e aceita respostas 2xx/3xx', async () => {
    const fetchImpl = vi.fn(async () => response(302));
    const links = [
      { file: 'data/resources/http.yaml', field: 'url' as const, url: 'http://example.test' },
      { file: 'data/resources/https.yaml', field: 'url' as const, url: 'https://example.test' },
    ];

    const errors = await checkResourceLinks(links, {
      fetchImpl,
      resolveHost: resolvePublicHost,
      retryDelay: async () => undefined,
    });

    expect(errors).toEqual([{ ...links[0], reason: 'a URL principal tem de usar https://' }]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('repete erros transitórios e aceita um sucesso dentro do limite', async () => {
    const fetchImpl = vi
      .fn<() => Promise<Response>>()
      .mockResolvedValueOnce(response(503))
      .mockResolvedValueOnce(response(200));
    const link = { file: 'data/resources/example.yaml', field: 'url' as const, url: 'https://example.test' };

    const errors = await checkResourceLinks([link], {
      fetchImpl,
      resolveHost: resolvePublicHost,
      retryDelay: async () => undefined,
    });

    expect(errors).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('usa GET com Range quando o host não suporta HEAD e falha claramente em 4xx', async () => {
    const methods: string[] = [];
    const fetchImpl = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      methods.push(init?.method ?? 'GET');
      return response(methods.length === 1 ? 405 : 404);
    });
    const link = { file: 'data/resources/example.yaml', field: 'url' as const, url: 'https://example.test' };

    const errors = await checkResourceLinks([link], {
      fetchImpl,
      resolveHost: resolvePublicHost,
      retryDelay: async () => undefined,
    });

    expect(methods).toEqual(['HEAD', 'GET']);
    expect(errors).toEqual([{ ...link, reason: 'resposta HTTP 404' }]);
  });

  it('bloqueia destinos privados, inclusive após redirecionamento', async () => {
    const privateLink = {
      file: 'data/resources/private.yaml',
      field: 'url' as const,
      url: 'https://127.0.0.1/admin',
    };
    const fetchImpl = vi.fn(
      async () =>
        new Response(null, {
          status: 302,
          headers: { location: 'https://127.0.0.1/admin' },
        }),
    );
    const publicLink = {
      file: 'data/resources/redirect.yaml',
      field: 'url' as const,
      url: 'https://example.test',
    };

    const errors = await checkResourceLinks([privateLink, publicLink], {
      fetchImpl,
      resolveHost: resolvePublicHost,
      attempts: 1,
      retryDelay: async () => undefined,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(errors).toEqual([
      { ...privateLink, reason: 'host resolve para um endereço IP não público' },
      { ...publicLink, reason: 'host resolve para um endereço IP não público' },
    ]);
  });
});
