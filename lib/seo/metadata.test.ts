import { describe, expect, it } from 'vitest';

import { localizedMetadata } from './metadata';

describe('metadata localizada', () => {
  it('define canonical e hreflang para a mesma rota nos dois idiomas', () => {
    const metadata = localizedMetadata('en', '/r/tool-name', 'Tool Name', 'A useful tool.');

    expect(metadata.alternates).toEqual({
      canonical: '/en/r/tool-name',
      languages: {
        pt: '/pt/r/tool-name',
        en: '/en/r/tool-name',
        'x-default': '/pt/r/tool-name',
      },
    });
  });

  it('preserva tipos de feed e regras de robots', () => {
    const metadata = localizedMetadata('pt', '/new', 'Novos', 'Novos recursos.', {
      robots: { index: false },
      alternates: { types: { 'application/rss+xml': '/pt/feed.xml' } },
    });

    expect(metadata.robots).toEqual({ index: false });
    expect(metadata.alternates).toEqual({
      canonical: '/pt/new',
      languages: { pt: '/pt/new', en: '/en/new', 'x-default': '/pt/new' },
      types: { 'application/rss+xml': '/pt/feed.xml' },
    });
  });
});
