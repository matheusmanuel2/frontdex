import { getLocale, getTranslations } from 'next-intl/server';

import { ArrowRightIcon } from '@/components/icons';
import { CollectionCard, IndexId, ResourceList, ResourceRow, TagChip } from '@/components/index';
import { Link } from '@/components/site/LocaleLink';
import { GITHUB_URL } from '@/components/site/nav';
import {
  getCategory,
  listAreas,
  listCategories,
  listCollections,
  getCollectionResources,
  listNew,
  listResources,
  resourceToYaml,
  AREA_NUMBER,
  type Resource,
} from '@/lib/content';
import type { AppLocale } from '@/lib/i18n/routing';

import { SectionHeader } from './SectionHeader';

const ghostLink =
  't-hover inline-flex h-10 items-center rounded-pill border border-border-button px-4 text-small text-primary hover:border-border-strong hover:bg-graphite';
const section = 'mx-auto w-full max-w-(--container-max) px-(--gutter) pt-16 pb-8 sm:pt-20';

/** Áreas com contagem real e as categorias que têm recursos (T-502). */
export async function AreasSection() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('home.areas');
  const nav = await getTranslations('nav');

  return (
    <section aria-labelledby="home-areas" className={section}>
      <SectionHeader id="home-areas" eyebrow={t('eyebrow')} title={t('title')} muted={t('titleMuted')} />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {listAreas().map((area) => {
          const resources = listResources({ area: area.slug });
          const categories = listCategories(area.slug).filter(
            (category) => listResources({ category: category.slug }).length > 0,
          );
          return (
            <li key={area.slug}>
              <Link
                href={`/${area.slug}`}
                className="t-hover flex h-full flex-col gap-4 rounded-card border border-border bg-carbon p-7 text-primary hover:border-border-strong hover:bg-graphite"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="label-mono rounded-pill bg-graphite px-3 py-1 text-secondary">
                    {AREA_NUMBER[area.slug]} / {nav(area.slug)}
                  </span>
                  <span className="font-mono text-mono text-muted">{t('count', { count: resources.length })}</span>
                </span>
                <span>
                  <span className="title-h3 block">{area.name[locale]}</span>
                  <span className="mt-2 block text-body text-secondary">{area.description[locale]}</span>
                </span>
                {categories.length > 0 ? (
                  <span className="mt-auto border-t border-border pt-4 font-mono text-mono text-secondary">
                    {categories.map((category) => category.name[locale]).join(' · ')}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function priceLabel(resource: Resource, t: (key: 'free' | 'freemium' | 'paid') => string) {
  return resource.pricing === 'TODO' ? null : t(resource.pricing);
}

/** Recém-indexados: os 6 recursos mais recentes. */
export async function FreshSection() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('home.fresh');
  const pricing = await getTranslations('pricing');
  const fresh = listNew().slice(0, 6);
  if (fresh.length === 0) return null;

  return (
    <section aria-labelledby="home-fresh" className={section}>
      <SectionHeader
        id="home-fresh"
        eyebrow={t('eyebrow')}
        title={t('title')}
        muted={t('titleMuted')}
        action={
          <Link href="/new" className={ghostLink}>
            {t('all')}
          </Link>
        }
      />
      <ResourceList label={t('list')}>
        {fresh.map((resource) => (
          <ResourceRow
            key={resource.slug}
            href={`/${locale}/r/${resource.slug}`}
            id={resource.id}
            name={resource.name}
            description={resource.description[locale]}
            compact
            aside={
              <span className="flex items-center gap-4">
                <TagChip>{getCategory(resource.category)?.name[locale]}</TagChip>
                <span className="w-20 font-mono text-mono text-secondary">{priceLabel(resource, pricing)}</span>
              </span>
            }
          />
        ))}
      </ResourceList>
    </section>
  );
}

/** Joias escondidas: recursos com "por que está aqui" no idioma. Sem curadoria escrita, a secção não aparece. */
export async function GemsSection() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('home.gems');
  const gems = listResources()
    .filter((resource) => resource.why?.[locale])
    .slice(0, 3);
  if (gems.length === 0) return null;

  return (
    <section aria-labelledby="home-gems" className={section}>
      <SectionHeader id="home-gems" eyebrow={t('eyebrow')} title={t('title')} muted={t('titleMuted')} />
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {gems.map((resource) => (
          <li key={resource.slug}>
            <Link
              href={`/r/${resource.slug}`}
              className="t-hover flex h-full flex-col gap-5 rounded-card border border-border bg-carbon p-3 pb-6 text-primary hover:border-border-strong hover:bg-graphite"
            >
              <span className="px-3 pt-3">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="title-h3">{resource.name}</span>
                  <IndexId id={resource.id} />
                </span>
                <span className="mt-2 block text-small text-secondary">{resource.description[locale]}</span>
              </span>
              <span className="mx-3 mt-auto rounded-panel bg-list px-4 py-4">
                <span className="label-mono mb-2 block text-link">{t('why')}</span>
                <span className="block text-small text-primary">{resource.why?.[locale]}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Coleções publicadas. Sem coleções `active`, a secção não aparece. */
export async function CollectionsSection() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('home.collections');
  const collections = listCollections().slice(0, 3);
  if (collections.length === 0) return null;

  return (
    <section aria-labelledby="home-collections" className={section}>
      <SectionHeader
        id="home-collections"
        eyebrow={t('eyebrow')}
        title={t('title')}
        muted={t('titleMuted')}
        action={
          <Link href="/collections" className={ghostLink}>
            {t('all')}
          </Link>
        }
      />
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {collections.map((collection) => {
          const items = getCollectionResources(collection.slug);
          return (
            <li key={collection.slug}>
              <CollectionCard
                href={`/${locale}/collections/${collection.slug}`}
                title={collection.title[locale]}
                count={t('count', { count: items.length })}
                description={collection.text[locale]}
                items={items
                  .slice(0, 3)
                  .map((resource) => resource.name)
                  .join(' · ')}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Contribua: como entra um recurso, com o YAML de um recurso real do índice. */
export async function ContributeSection() {
  const t = await getTranslations('home.contribute');
  const example = listResources().find((resource) => resource.why) ?? listResources()[0];

  return (
    <section
      aria-labelledby="home-contribute"
      className="mx-auto w-full max-w-(--container-max) px-(--gutter) py-16 sm:py-24"
    >
      <div className="grid items-center gap-12 rounded-card border border-border bg-carbon p-6 sm:p-12 lg:grid-cols-2">
        <div>
          <p className="label-mono mb-4 text-link">{t('eyebrow')}</p>
          <h2 id="home-contribute" className="title-h2 text-primary">
            {t('title')}
            <br />
            <span className="text-title-muted">{t('titleMuted')}</span>
          </h2>
          <p className="mt-5 mb-7 max-w-md text-body text-secondary">{t('body')}</p>
          <ol className="mb-8 flex flex-col gap-3">
            {(['step1', 'step2', 'step3'] as const).map((step, index) => (
              <li key={step} className="flex gap-4 text-body text-primary">
                <span className="pt-1 font-mono text-mono text-muted">{String(index + 1).padStart(2, '0')}</span>
                {t(step)}
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/add"
              data-umami-event="add_click"
              className="t-hover t-icon-host inline-flex h-12 items-center gap-4 rounded-pill bg-button-primary pr-2 pl-6 text-body font-medium text-button-primary-text hover:opacity-90"
            >
              {t('add')}
              <span
                aria-hidden="true"
                className="inline-flex size-9 items-center justify-center rounded-pill bg-index-blue text-button-brand-text"
              >
                <ArrowRightIcon size={16} />
              </span>
            </Link>
            <a
              href={`${GITHUB_URL}/blob/main/CONTRIBUTING.md`}
              rel="noopener"
              className="t-hover inline-flex h-12 items-center rounded-pill border border-border-strong px-6 text-body text-primary hover:bg-graphite"
            >
              {t('guidelines')}
            </a>
          </div>
        </div>
        {example ? (
          <figure className="min-w-0 overflow-hidden rounded-panel border border-border bg-ink">
            <figcaption className="flex justify-between gap-4 border-b border-border px-5 py-3 font-mono text-mono text-muted">
              <span className="truncate">data/resources/{example.slug}.yaml</span>
              <span className="shrink-0">{t('example')}</span>
            </figcaption>
            <pre
              tabIndex={0}
              role="region"
              aria-label={`data/resources/${example.slug}.yaml`}
              className="overflow-x-auto rounded-sm p-5 font-mono text-mono text-secondary"
            >
              <code>{resourceToYaml(example)}</code>
            </pre>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
