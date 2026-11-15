import { describe, expect, it } from 'vitest';

import { outboundUrl } from './outbound';

describe('outboundUrl', () => {
  it('acrescenta ref e UTM da FrontDex', () => {
    expect(outboundUrl('https://mobbin.com')).toBe(
      'https://mobbin.com/?ref=frontdex&utm_source=frontdex&utm_medium=referral',
    );
  });

  it('mantém a query e o hash existentes sem substituir parâmetros', () => {
    expect(outboundUrl('https://example.com/docs?ref=partner&lang=pt#intro')).toBe(
      'https://example.com/docs?ref=partner&lang=pt&utm_source=frontdex&utm_medium=referral#intro',
    );
  });

  it('devolve URLs inválidos ou não-http iguais', () => {
    expect(outboundUrl('não é url')).toBe('não é url');
    expect(outboundUrl('mailto:oi@example.com')).toBe('mailto:oi@example.com');
  });
});
