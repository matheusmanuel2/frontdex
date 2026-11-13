import { getTranslations } from 'next-intl/server';

import { SectionTitle } from '@/components/index';
import { Link } from '@/lib/i18n/navigation';

const secondary =
  't-hover inline-flex h-10 items-center rounded-pill border border-border-strong px-4 text-small font-semibold text-primary hover:bg-graphite';

/** Conteúdo da 404 (mockup NotFound.dc.html), no idioma da rota. */
export async function NotFoundContent() {
  const t = await getTranslations('notFound');
  const nav = await getTranslations('nav');

  return (
    <main id="conteudo" className="mx-auto w-full max-w-(--container-max) px-(--gutter) py-24 text-center sm:py-32">
      <p className="font-mono text-display text-title-muted">{t('code')}</p>
      <SectionTitle as="h1" size="h1" title={t('title')} muted={t('titleMuted')} className="mx-auto mt-6 max-w-3xl" />
      <p className="mx-auto mt-5 max-w-lg text-body text-secondary">{t('body')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/search"
          className="t-hover t-icon-host inline-flex h-10 items-center gap-3 rounded-pill bg-button-primary px-4 text-small font-semibold text-button-primary-text hover:opacity-90"
        >
          {t('search')}
          <kbd className="rounded-pill bg-graphite px-2 py-1 font-mono text-mono text-secondary">
            {nav('searchShortcut')}
          </kbd>
        </Link>
        <Link href="/" className={secondary}>
          {t('home')}
        </Link>
      </div>
      <p className="mt-10 font-mono text-mono text-muted">
        {t('try')}{' '}
        <Link href="/new" className="t-hover text-link hover:text-link-hover">
          {t('new')}
        </Link>{' '}
        ·{' '}
        <Link href="/random" className="t-hover text-link hover:text-link-hover">
          {t('random')}
        </Link>{' '}
        ·{' '}
        <Link href="/collections" className="t-hover text-link hover:text-link-hover">
          {t('collections')}
        </Link>
      </p>
    </main>
  );
}
