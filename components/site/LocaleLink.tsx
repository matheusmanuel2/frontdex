import NextLink from 'next/link';
import { getLocale } from 'next-intl/server';

import type { ComponentProps } from 'react';

type LocaleLinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & {
  /** Caminho sem idioma (`/c/icons`); o idioma da página atual é acrescentado no servidor. */
  href: string;
  /** Força o idioma (por omissão, o da página atual). */
  locale?: string;
};

/**
 * Link interno com o prefixo do idioma, montado no servidor. Usa o `next/link`
 * diretamente, sem o provider do next-intl no browser (spec 003: só 3 ilhas).
 */
export async function Link({ href, locale: forced, ...props }: LocaleLinkProps) {
  const locale = forced ?? (await getLocale());
  return <NextLink href={`/${locale}${href === '/' ? '' : href}`} {...props} />;
}
