import { getTranslations } from 'next-intl/server';

/** Primeiro elemento focável da página (T-403). Aponta para o <main id="conteudo">. */
export async function SkipLink() {
  const t = await getTranslations('a11y');
  return (
    <a
      href="#conteudo"
      className="sr-only rounded-pill bg-button-primary px-4 py-2 text-small font-semibold text-button-primary-text focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
    >
      {t('skipToContent')}
    </a>
  );
}
