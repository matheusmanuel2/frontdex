import { describe, expect, it } from 'vitest';

import { getUmamiWebsiteId } from './umami';

describe('configuração do Umami', () => {
  it('não expõe o ID fora de uma build de produção na Vercel', () => {
    expect(
      getUmamiWebsiteId({
        NODE_ENV: 'development',
        VERCEL_ENV: 'development',
        UMAMI_WEBSITE_ID: 'website-id',
      }),
    ).toBeUndefined();
    expect(
      getUmamiWebsiteId({
        NODE_ENV: 'production',
        VERCEL_ENV: 'preview',
        UMAMI_WEBSITE_ID: 'website-id',
      }),
    ).toBeUndefined();
  });

  it('usa o website ID apenas em produção e falha se estiver ausente', () => {
    expect(
      getUmamiWebsiteId({
        NODE_ENV: 'production',
        VERCEL_ENV: 'production',
        UMAMI_WEBSITE_ID: ' website-id ',
      }),
    ).toBe('website-id');
    expect(() => getUmamiWebsiteId({ NODE_ENV: 'production', VERCEL_ENV: 'production' })).toThrow('UMAMI_WEBSITE_ID');
  });
});
