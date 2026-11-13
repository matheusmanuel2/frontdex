import NextLink from 'next/link';
import { getLocale } from 'next-intl/server';

import type { ComponentProps } from 'react';

type LocaleLinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & {
  /** Caminho sem idioma (`/c/icons`); o idioma da página atual é acrescentado no servidor. */
  href: string;
};

/**
 * Link interno com o prefixo do idioma, montado no servidor. Usa o `next/link`
 * diretamente, sem o provider do next-intl no browser (spec 003: só 3 ilhas).
 */
export async function Link({ href, ...props }: LocaleLinkProps) {
  const locale = await getLocale();
  return <NextLink href={`/${locale}${href === '/' ? '' : href}`} {...props} />;
}
