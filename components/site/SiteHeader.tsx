import { getLocale, getTranslations } from 'next-intl/server';

import { SearchIcon } from '@/components/icons';
import { Link } from '@/components/site/LocaleLink';
import { HTML_LANG, routing } from '@/lib/i18n/routing';
import { cn } from '@/lib/utils';

import { LocaleSwitch } from './LocaleSwitch';
import { Logo } from './Logo';
import { MobileNav } from './MobileNav';
import { NAV_SECTIONS, sectionHref, type NavSection } from './nav';

type SiteHeaderProps = {
  /** Secção atual, para o `aria-current="page"` (sem JS: cada página diz onde está). */
  current?: NavSection;
};

const navLink =
  't-hover rounded-pill text-small font-medium text-secondary hover:text-primary aria-[current=page]:text-primary';

/**
 * Cabeçalho (spec 003, mockup Area.dc.html): logo, áreas + Coleções, Buscar ⌘K,
 * idioma e "Adicionar recurso". No mobile, as áreas vão para um menu <details> (sem JS).
 */
export async function SiteHeader({ current }: SiteHeaderProps) {
  const t = await getTranslations('nav');
  const a11y = await getTranslations('a11y');
  const localeT = await getTranslations('locale');
  const locale = await getLocale();
  const other = routing.locales.find((candidate) => candidate !== locale) ?? routing.defaultLocale;

  const links = NAV_SECTIONS.map((section) => ({ section, label: t(section) }));

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-(--container-max) items-center gap-4 px-(--gutter) py-4 lg:gap-7">
        <Link href="/" aria-label={a11y('homeLink')} className="shrink-0 rounded-sm">
          <Logo />
        </Link>

        <nav aria-label={a11y('mainNav')} className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-6">
            {links.map(({ section, label }) => (
              <li key={section}>
                <Link
                  href={sectionHref(section)}
                  aria-current={current === section ? 'page' : undefined}
                  className={cn(navLink, 'px-1 py-1')}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link
            href="/search"
            data-search-trigger
            className="t-hover t-icon-host inline-flex h-10 items-center gap-2 rounded-pill border border-border-button bg-carbon pr-2 pl-3 text-small text-secondary hover:border-border-strong hover:bg-graphite hover:text-primary sm:pl-4"
          >
            <SearchIcon size={16} />
            <span className="sr-only sm:not-sr-only">{t('search')}</span>
            <kbd className="hidden rounded-pill bg-graphite px-2 py-1 font-mono text-mono text-muted sm:inline">
              {t('searchShortcut')}
            </kbd>
          </Link>
          <LocaleSwitch to={other} hrefLang={HTML_LANG[other]} label={localeT('label')} short={localeT('short')} />
          <Link
            href="/add"
            data-umami-event="add_click"
            className="t-hover hidden h-10 items-center rounded-pill bg-index-blue px-4 text-small font-medium text-button-brand-text hover:bg-index-blue-light md:inline-flex"
          >
            {t('addResource')}
          </Link>

          <MobileNav
            label={a11y('mainNav')}
            openLabel={a11y('openMenu')}
            addLabel={t('addResource')}
            links={links}
            current={current}
          />
        </div>
      </div>
    </header>
  );
}
