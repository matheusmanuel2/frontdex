import { describe, expect, it } from 'vitest';

import { checkJsonLd, checkPage, checkSitemap } from './check-seo';

const ld = (data: unknown) => `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
const head =
  '<link rel="canonical" href="https://frontdex.dev/pt/x"/>' +
  ['pt', 'en', 'x-default']
    .map((lang) => `<link rel="alternate" hrefLang="${lang}" href="https://frontdex.dev/x"/>`)
    .join('');

describe('check-seo', () => {
  it('aceita uma página indexável completa', () => {
    const html = `${head}${ld({ '@context': 'https://schema.org', '@graph': [{ '@type': 'WebPage' }] })}<h1>X</h1>`;
    expect(checkPage('pt/x.html', html)).toEqual([]);
  });

  it('apanha JSON-LD inválido, sem @context e breadcrumbs partidos', () => {
    const broken = '<script type="application/ld+json">{nope</script>';
    const noContext = ld({ '@type': 'WebPage' });
    const crumbs = ld({
      '@context': 'https://schema.org',
      '@graph': [{ '@type': 'BreadcrumbList', itemListElement: [{ position: 2, name: 'A', item: '/pt' }] }],
    });
    const problems = checkJsonLd('p', broken + noContext + crumbs).map((p) => p.problem);
    expect(problems).toEqual([
      'JSON-LD não é JSON válido',
      'JSON-LD sem @context https://schema.org',
      'BreadcrumbList: item 1 inválido',
    ]);
  });

  it('exige um h1, canonical e hreflang só nas páginas indexáveis', () => {
    expect(checkPage('p', '<h1>a</h1><h1>b</h1>').map((p) => p.problem)).toContain('tem 2 <h1> (esperado 1)');
    expect(checkPage('p', '<h1>a</h1>').map((p) => p.problem)).toContain('sem canonical');
    expect(checkPage('p', '<meta name="robots" content="noindex, follow"/>')).toEqual([]);
  });

  it('apanha URLs do sitemap sem página ou com noindex', () => {
    const xml =
      '<loc>https://frontdex.dev/pt/a</loc><loc>https://frontdex.dev/pt/b</loc><loc>https://frontdex.dev/pt/c</loc>';
    const pages: Record<string, string> = { '/pt/a': '<h1>a</h1>', '/pt/c': '<meta name="robots" content="noindex"/>' };
    expect(checkSitemap(xml, (p) => pages[p]).map((p) => p.problem)).toEqual([
      'https://frontdex.dev/pt/b não tem página gerada',
      'https://frontdex.dev/pt/c é noindex',
    ]);
  });
});
