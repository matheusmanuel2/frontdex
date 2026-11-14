import { MenuIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

import { Link } from './LocaleLink';
import { sectionHref, type NavSection } from './nav';

type MobileNavProps = {
  label: string;
  openLabel: string;
  addLabel: string;
  links: { section: NavSection; label: string }[];
  current?: NavSection;
};

const navLink = 't-hover text-small font-medium text-secondary hover:text-primary aria-[current=page]:text-primary';

/** Menu compacto do mobile (< lg) em <details>: funciona sem JS (spec 003: sem ilha extra). */
export function MobileNav({ label, openLabel, addLabel, links, current }: MobileNavProps) {
  return (
    <details className="group relative lg:hidden">
      <summary
        aria-label={openLabel}
        className="t-hover t-icon-host flex size-10 cursor-pointer list-none items-center justify-center rounded-pill border border-border-button text-secondary hover:text-primary [&::-webkit-details-marker]:hidden"
      >
        <MenuIcon size={18} />
      </summary>
      <nav
        aria-label={label}
        className="absolute top-12 right-0 z-40 w-64 rounded-panel border border-border-strong bg-carbon p-2"
      >
        <ul className="flex flex-col">
          {links.map(({ section, label: text }) => (
            <li key={section}>
              <Link
                href={sectionHref(section)}
                aria-current={current === section ? 'page' : undefined}
                className={cn(navLink, 'block rounded-sm px-3 py-2 hover:bg-graphite')}
              >
                {text}
              </Link>
            </li>
          ))}
          <li className="mt-1 border-t border-border pt-1 md:hidden">
            <Link href="/add" className={cn(navLink, 'block rounded-sm px-3 py-2 text-link hover:bg-graphite')}>
              {addLabel}
            </Link>
          </li>
        </ul>
      </nav>
    </details>
  );
}
