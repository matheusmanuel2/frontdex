import { getLocale, getTranslations } from 'next-intl/server';

import { AreaInk } from '@/components/home/AreaInk';
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
  type Resource,
} from '@/lib/content';
import type { Pricing } from '@/lib/content/schema';
import type { AppLocale } from '@/lib/i18n/routing';

import { SectionHeader } from './SectionHeader';

const ghostLink =
  't-hover inline-flex h-10 items-center rounded-pill border border-border-button px-4 text-small text-primary hover:border-border-strong hover:bg-graphite';
const section = 'mx-auto w-full max-w-(--container-max) px-(--gutter) pt-16 pb-8 sm:pt-20';

/** Mínimo de destaques fora dos recentes para a secção "Pouco conhecidos" aparecer. */
const GEMS_MIN = 3;
const FRESH_COUNT = 6;

/** Issue Form de contribuição com a área já escolhida (o GitHub preenche campos pelo id). */
export function suggestHref(area: string): string {
  return `${GITHUB_URL}/issues/new?template=add-resource.yml&area=${encodeURIComponent(area)}`;
}

/**
 * Explorar por área: uma linha por área (nome, descrição, contagem e até 2 categorias).
 * Área sem recursos mostra "Em construção" + "Sugerir o primeiro"; volta ao normal
 * sozinha quando entra o primeiro recurso.
 */
export async function AreasSection() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('home.areas');

  return (
    <section aria-labelledby="home-areas" className={section}>
      <SectionHeader id="home-areas" title={t('title')} description={t('subtitle')} />
      <ul className="grid gap-4 min-[720px]:grid-cols-2">
        {listAreas().map((area) => {
          const resources = listResources({ area: area.slug });
          // No máximo 2 categorias por cartão (as com mais recursos), senão o cartão cresce
          // com a área. A lista completa está na página da área.
          const categories = listCategories(area.slug)
            .map((category) => ({ category, count: listResources({ category: category.slug }).length }))
            .filter(({ count }) => count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 2)
            .map(({ category }) => category);
          const empty = resources.length === 0;
          const descriptionIds = [
            `${area.slug}-description`,
            `${area.slug}-details`,
            ...(categories.length > 0 ? [`${area.slug}-categories`] : []),
          ].join(' ');
          return (
            <li
              key={area.slug}
              className="t-area-card min-h-65 p-7 min-[560px]:min-h-80"
              data-area={area.slug}
              data-empty={empty || undefined}
            >
              <AreaInk />
              <div className="flex h-full flex-col justify-between gap-8">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/${area.slug}`}
                      aria-labelledby={`${area.slug}-title`}
                      aria-describedby={descriptionIds}
                      className="rounded-sm text-area-sm leading-(--leading-area) font-medium tracking-(--tracking-area) text-primary after:absolute after:inset-0 after:content-[''] min-[720px]:text-area"
                    >
                      <span id={`${area.slug}-title`}>{area.name[locale]}</span>
                    </Link>
                    <span
                      id={`${area.slug}-details`}
                      className="t-area-card-count flex-none rounded-pill border border-border px-3 py-1 text-meta text-secondary"
                    >
                      {empty ? t('comingSoon') : t('count', { count: resources.length })}
                    </span>
                  </div>
                  <p
                    id={`${area.slug}-description`}
                    className="t-area-card-copy mt-3 max-w-[42ch] text-small leading-(--leading-body) text-secondary"
                  >
                    {area.description[locale]}
                  </p>
                </div>
                <div className="flex items-end justify-between gap-3">
                  {empty ? (
                    <p className="t-area-card-empty max-w-[24ch] text-meta text-muted">
                      {t('empty')}
                      <br />
                      <a
                        href={suggestHref(area.slug)}
                        rel="noopener"
                        data-umami-event="add_click"
                        aria-label={t('suggestLabel', { area: area.name[locale] })}
                        className="link-inline relative z-10 rounded-sm"
                      >
                        {t('suggest')}
                      </a>
                    </p>
                  ) : (
                    <ul
                      id={`${area.slug}-categories`}
                      className="t-area-card-cats m-0 list-none p-0 text-meta leading-[1.7] text-muted"
                    >
                      {categories.map((category) => (
                        <li key={category.slug}>{category.name[locale]}</li>
                      ))}
                    </ul>
                  )}
                  <span className="t-area-card-btn grid size-11 flex-none place-items-center rounded-pill bg-button-primary text-button-primary-text">
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {empty ? <path d="M12 5v14M5 12h14" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
                    </svg>
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function priceLabel(resource: Resource, t: (key: Pricing) => string) {
  return resource.pricing === 'TODO' ? null : t(resource.pricing);
}

function freshResources(): Resource[] {
  return listNew().slice(0, FRESH_COUNT);
}

/** Adicionados recentemente: os 6 recursos mais recentes, com o "por que está aqui" no idioma. */
export async function FreshSection() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('home.fresh');
  const pricing = await getTranslations('pricing');
  const fresh = freshResources();
  if (fresh.length === 0) return null;

  return (
    <section aria-labelledby="home-fresh" className={section}>
      <SectionHeader
        id="home-fresh"
        title={t('title')}
        action={
          <Link href="/new" className={ghostLink}>
            {t('all')}
          </Link>
        }
      />
      <ResourceList label={t('list')} plain>
        {fresh.map((resource) => (
          <ResourceRow
            key={resource.slug}
            href={`/${locale}/r/${resource.slug}`}
            id={resource.id}
            name={resource.name}
            description={resource.description[locale]}
            note={resource.why?.[locale]}
            arrow={false}
            prominentId
            aside={
              <span className="flex items-center gap-4">
                <TagChip>{getCategory(resource.category)?.name[locale]}</TagChip>
                <span className="w-20 text-small text-secondary">{priceLabel(resource, pricing)}</span>
              </span>
            }
          />
        ))}
      </ResourceList>
    </section>
  );
}

/**
 * Pouco conhecidos, muito úteis: destaques da curadoria (`featured: true`) que não
 * estão nos recentes. Com menos de 3, a secção inteira não aparece.
 */
export async function GemsSection() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('home.gems');
  const freshSlugs = new Set(freshResources().map((resource) => resource.slug));
  const gems = listResources().filter((resource) => resource.featured && !freshSlugs.has(resource.slug));
  if (gems.length < GEMS_MIN) return null;

  return (
    <section aria-labelledby="home-gems" className={section}>
      <SectionHeader id="home-gems" title={t('title')} />
      <ul className="grid border-t border-border md:grid-cols-3">
        {gems.slice(0, GEMS_MIN).map((resource) => (
          <li key={resource.slug} className="border-b border-border md:border-b-0 md:not-first:border-l">
            <Link
              href={`/r/${resource.slug}`}
              className="t-hover flex h-full flex-col gap-3 px-1 py-6 text-primary hover:bg-row-hover md:px-6 md:first:pl-0"
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="title-h3">{resource.name}</span>
                <IndexId id={resource.id} className="text-small text-secondary" />
              </span>
              <span className="text-small text-secondary">{resource.description[locale]}</span>
              {resource.why?.[locale] ? (
                <span className="mt-auto pt-2 text-small text-primary">
                  <span className="block text-muted">{t('why')}</span>
                  {resource.why[locale]}
                </span>
              ) : null}
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
        title={t('title')}
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
                  .join(', ')}
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
      <div className="grid items-center gap-12 border-t border-border pt-16 lg:grid-cols-2">
        <div>
          <h2 id="home-contribute" className="title-h2 text-primary">
            {t('title')}
            <br />
            <span className="text-title-muted">{t('titleMuted')}</span>
          </h2>
          <p className="mt-5 mb-7 max-w-md text-body text-secondary">{t('body')}</p>
          <ol className="mb-8 flex flex-col gap-3">
            {(['step1', 'step2', 'step3'] as const).map((step, index) => (
              <li key={step} className="flex gap-4 text-body text-primary">
                <span className="text-muted tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                {t(step)}
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/add"
              data-umami-event="add_click"
              className="t-hover inline-flex h-12 items-center rounded-pill bg-button-primary px-6 text-body font-medium text-button-primary-text hover:opacity-90"
            >
              {t('add')}
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
          <figure className="min-w-0 border border-border bg-list">
            <figcaption className="flex justify-between gap-4 border-b border-border px-5 py-3 text-small text-muted">
              <span className="truncate font-mono text-mono">data/resources/{example.slug}.yaml</span>
              <span className="shrink-0">{t('example')}</span>
            </figcaption>
            <pre
              tabIndex={0}
              role="region"
              aria-label={`data/resources/${example.slug}.yaml`}
              className="overflow-x-auto p-5 font-mono text-mono text-secondary"
            >
              <code>{resourceToYaml(example)}</code>
            </pre>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
