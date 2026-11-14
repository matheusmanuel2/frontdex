import { NextResponse, type NextRequest } from 'next/server';

import { detectLocale } from '@/lib/i18n/detect';
import { LOCALE_COOKIE } from '@/lib/i18n/routing';

/**
 * Escolha de idioma em `/` (spec 007). É a única coisa que corre em runtime
 * (constitution §3). Nenhuma outra rota redireciona por idioma ou IP.
 */
export function proxy(request: NextRequest) {
  const locale = detectLocale({
    cookie: request.cookies.get(LOCALE_COOKIE)?.value,
    acceptLanguage: request.headers.get('accept-language'),
    country: request.headers.get('x-vercel-ip-country'),
  });
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}`;
  const response = NextResponse.redirect(url, 307);
  response.headers.set('Vary', 'Cookie, Accept-Language, X-Vercel-IP-Country');
  return response;
}

export const config = {
  matcher: '/',
};
