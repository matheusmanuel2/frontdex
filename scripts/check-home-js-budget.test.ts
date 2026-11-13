import { describe, expect, it } from 'vitest';
import { assertHomeJavaScriptBudget, getOwnScriptPaths } from './check-home-js-budget';

describe('getOwnScriptPaths', () => {
  it('returns unique page chunks while excluding shared runtime and non-chunk scripts', () => {
    const html = `
      <script src="/_next/static/chunks/runtime.js"></script>
      <script src="/_next/static/chunks/home.js"></script>
      <script src="/_next/static/chunks/home.js?v=1"></script>
      <script src="https://analytics.example/script.js"></script>
    `;

    expect(getOwnScriptPaths(html, new Set(['static/chunks/runtime.js']))).toEqual(['static/chunks/home.js']);
  });
});

describe('assertHomeJavaScriptBudget', () => {
  it('rejects the strict 90 KB gzip limit and accepts a value below it', () => {
    expect(() => assertHomeJavaScriptBudget('pt', 90 * 1024)).toThrow(
      'A home em pt excede o orçamento estrito de 90 KB gzip.',
    );
    expect(() => assertHomeJavaScriptBudget('pt', 90 * 1024 - 1)).not.toThrow();
  });
});
