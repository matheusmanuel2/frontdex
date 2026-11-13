import { getTranslations } from 'next-intl/server';

import { SectionTitle } from '@/components/index';
import { Link } from '@/components/site/LocaleLink';
import { HTML_LANG, type AppLocale } from '@/lib/i18n/routing';

const secondary =
  't-hover inline-flex h-10 items-center rounded-pill border border-border-strong px-4 text-small font-semibold text-primary hover:bg-graphite';
const inline = 'link-inline';

type NotFoundContentProps = {
  locale: AppLocale;
  /** O bloco principal leva o #404 e o <h1>; o segundo idioma vai num <h2>. */
  primary?: boolean;
};

/** Um bloco da 404 (mockup NotFound.dc.html) num idioma. A 404 junta os dois (D-09). */
export async function NotFoundContent({ locale, primary = true }: NotFoundContentProps) {
  const t = await getTranslations({ locale, namespace: 'notFound' });
  const nav = await getTranslations({ locale, namespace: 'nav' });

  return (
    <section
      lang={HTML_LANG[locale]}
      aria-labelledby={`nf-${locale}`}
      className="mx-auto w-full max-w-(--container-max) px-(--gutter) py-16 text-center sm:py-20"
    >
      {primary ? <p className="font-mono text-display text-title-muted">{t('code')}</p> : null}
      <SectionTitle
        id={`nf-${locale}`}
        as={primary ? 'h1' : 'h2'}
        size={primary ? 'h1' : 'h2'}
        title={t('title')}
        muted={t('titleMuted')}
        className="mx-auto mt-6 max-w-3xl"
      />
      <p className="mx-auto mt-5 max-w-lg text-body text-secondary">{t('body')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          locale={locale}
          href="/search"
          className="t-hover t-icon-host inline-flex h-10 items-center gap-3 rounded-pill bg-button-primary px-4 text-small font-semibold text-button-primary-text hover:opacity-90"
        >
          {t('search')}
          <kbd className="rounded-pill bg-graphite px-2 py-1 font-mono text-mono text-secondary">
            {nav('searchShortcut')}
          </kbd>
        </Link>
        <Link locale={locale} href="/" className={secondary}>
          {t('home')}
        </Link>
      </div>
      <p className="mt-10 font-mono text-mono text-muted">
        {t('try')}{' '}
        <Link locale={locale} href="/new" className={inline}>
          {t('new')}
        </Link>{' '}
        ·{' '}
        <Link locale={locale} href="/random" className={inline}>
          {t('random')}
        </Link>{' '}
        ·{' '}
        <Link locale={locale} href="/collections" className={inline}>
          {t('collections')}
        </Link>
      </p>
    </section>
  );
}
