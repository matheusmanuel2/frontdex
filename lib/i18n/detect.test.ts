import { describe, expect, it } from 'vitest';

import { detectLocale } from './detect';

describe('detectLocale', () => {
  it('1. o cookie vence tudo', () => {
    expect(detectLocale({ cookie: 'en', acceptLanguage: 'pt-BR', country: 'AO' })).toBe('en');
    expect(detectLocale({ cookie: 'pt', acceptLanguage: 'en-US', country: 'US' })).toBe('pt');
  });

  it('ignora cookies inválidos', () => {
    expect(detectLocale({ cookie: 'fr', acceptLanguage: 'pt-PT' })).toBe('pt');
  });

  it('2. Accept-Language: português → pt, outro → en', () => {
    expect(detectLocale({ acceptLanguage: 'pt-BR,pt;q=0.9,en;q=0.8' })).toBe('pt');
    expect(detectLocale({ acceptLanguage: 'pt' })).toBe('pt');
    expect(detectLocale({ acceptLanguage: 'fr-FR,fr;q=0.9' })).toBe('en');
    expect(detectLocale({ acceptLanguage: 'en;q=0.5,pt-AO;q=0.9' })).toBe('pt');
  });

  it('2. o idioma do browser vence o país', () => {
    expect(detectLocale({ acceptLanguage: 'en-US', country: 'BR' })).toBe('en');
  });

  it('3. sem idioma, o país: lusófonos → pt, outros → en', () => {
    for (const country of ['AO', 'BR', 'PT', 'MZ', 'CV', 'GW', 'ST', 'TL']) {
      expect(detectLocale({ country })).toBe('pt');
    }
    expect(detectLocale({ country: 'US' })).toBe('en');
    expect(detectLocale({ acceptLanguage: '*', country: 'ao' })).toBe('pt');
  });

  it('4. sem sinal → pt', () => {
    expect(detectLocale({})).toBe('pt');
    expect(detectLocale({ acceptLanguage: '' })).toBe('pt');
  });
});
