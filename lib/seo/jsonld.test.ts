import { describe, expect, it } from 'vitest';

import { breadcrumbNode, resourceType, serializeJsonLd, graph } from './jsonld';

describe('JSON-LD', () => {
  it('escolhe o tipo schema.org pela categoria', () => {
    expect(resourceType('animation')).toBe('SoftwareApplication');
    expect(resourceType('courses')).toBe('Course');
    expect(resourceType('books')).toBe('Book');
    expect(resourceType('ui-inspiration')).toBe('CreativeWork');
  });

  it('numera o breadcrumb com URLs absolutos', () => {
    const node = breadcrumbNode('/pt/build', [
      { name: 'Índice', path: '/pt' },
      { name: 'Construir', path: '/pt/build' },
    ]);
    expect(node.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Índice', item: 'https://frontdex.dev/pt' },
      { '@type': 'ListItem', position: 2, name: 'Construir', item: 'https://frontdex.dev/pt/build' },
    ]);
  });

  it('não deixa fechar o <script> a partir do conteúdo', () => {
    expect(serializeJsonLd(graph({ '@type': 'Thing', name: '</script><b>' }))).not.toContain('</script>');
  });
});
