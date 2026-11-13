import type { AreaSlug } from '@/lib/content/schema';

/** Secções do cabeçalho, pela ordem da spec 003. */
export const NAV_SECTIONS = ['discover', 'learn', 'build', 'grow', 'collections'] as const satisfies readonly (
  AreaSlug | 'collections'
)[];

export type NavSection = (typeof NAV_SECTIONS)[number];

export function sectionHref(section: NavSection): string {
  return `/${section}`;
}

export const GITHUB_URL = 'https://github.com/matheusmanuel2/frontdex';
