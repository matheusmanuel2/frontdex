import { getTranslations } from 'next-intl/server';

import { Link } from '@/lib/i18n/navigation';

import { GITHUB_URL } from './nav';

const footerLink = 't-hover rounded-sm text-small text-secondary hover:text-primary';

/** Rodapé (spec 003): assinatura e links. O seletor de tema entra com a T-405 (decisão D-03). */
export async function SiteFooter() {
  const t = await getTranslations('footer');
  const a11y = await getTranslations('a11y');

  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-(--container-max) flex-wrap items-center justify-between gap-4 px-(--gutter) py-6">
        <p className="text-small text-secondary">{t('tagline')}</p>
        <nav aria-label={a11y('footerNav')}>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <Link href="/new" className={footerLink}>
                {t('new')}
              </Link>
            </li>
            <li>
              <Link href="/random" className={footerLink}>
                {t('random')}
              </Link>
            </li>
            <li>
              <Link href="/add" className={footerLink}>
                {t('add')}
              </Link>
            </li>
            <li>
              <Link href="/about" className={footerLink}>
                {t('about')}
              </Link>
            </li>
            <li>
              <a href={GITHUB_URL} className={footerLink} rel="noopener">
                {t('github')}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
