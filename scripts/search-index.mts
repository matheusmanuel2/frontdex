/**
 * Índice Pagefind (spec 008) gerado a partir do conteúdo, antes do `next build`.
 *
 * Os registos saem dos YAML (via lib/content) e não do HTML gerado: na Vercel,
 * o build a partir do Git não deixa HTML legível nem publica ficheiros criados
 * depois do `next build`. Em `public/pagefind/` o índice entra em qualquer build.
 * Um índice por idioma (`pt-br`, `en`), igual ao `<html lang>` de cada rota.
 */
import { readFileSync, rmSync } from 'node:fs';
import path from 'node:path';

import { createTranslator } from 'next-intl';
import * as pagefind from 'pagefind';

import { getArea, getCategory, listCategories, listResources } from '../lib/content';
import { HTML_LANG, routing, type AppLocale } from '../lib/i18n/routing';

const OUTPUT = path.resolve('public/pagefind');

type PagefindRecord = Parameters<pagefind.PagefindIndex['addCustomRecord']>[0];

function translator(locale: AppLocale) {
  const messages = JSON.parse(readFileSync(path.resolve(`messages/${locale}.json`), 'utf8')) as Record<string, unknown>;
  return createTranslator({ locale, messages });
}

function compact(values: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(Object.entries(values).filter((entry): entry is [string, string] => Boolean(entry[1])));
}

function records(locale: AppLocale): PagefindRecord[] {
  const t = translator(locale);
  const language = HTML_LANG[locale].toLowerCase();

  const resources = listResources().map((resource): PagefindRecord => {
    const category = getCategory(resource.category)?.name[locale];
    const area = getArea(resource.area)?.name[locale];
    const why = resource.why?.[locale];
    const pricing = resource.pricing === 'TODO' ? undefined : t(`pricing.${resource.pricing}`);
    return {
      url: `/${locale}/r/${resource.slug}`,
      language,
      content: [resource.name, resource.description[locale], why ? `${t('resource.why')} ${why}` : '']
        .filter(Boolean)
        .join('\n'),
      meta: compact({
        kind: 'resource',
        title: resource.name,
        slug: resource.slug,
        id: resource.id === undefined ? undefined : String(resource.id),
        url: resource.url,
        category,
        description: resource.description[locale],
        area,
      }),
      filters: Object.fromEntries(
        Object.entries(
          compact({
            area,
            category,
            pricing,
            oss: resource.open_source === true ? t('resource.ossBadge') : undefined,
          }),
        ).map(([key, value]) => [key, [value]]),
      ),
    };
  });

  const categories = listCategories().map((category): PagefindRecord => {
    const count = listResources({ category: category.slug }).length;
    const area = getArea(category.area)?.name[locale];
    const description = category.description?.[locale];
    const muted = t('category.titleMuted', { count });
    return {
      url: `/${locale}/c/${category.slug}`,
      language,
      content: [`${category.name[locale]}.`, muted, description].filter(Boolean).join('\n'),
      meta: compact({
        kind: 'category',
        title: category.name[locale],
        slug: category.slug,
        description: description ?? muted,
        count: String(count),
        area,
      }),
      filters: area ? { area: [area] } : {},
    };
  });

  return [...resources, ...categories];
}

async function main() {
  const { index, errors } = await pagefind.createIndex({});
  if (!index) throw new Error(`Pagefind não iniciou: ${errors.join('; ')}`);

  let total = 0;
  for (const locale of routing.locales) {
    for (const record of records(locale)) {
      const response = await index.addCustomRecord(record);
      if (response.errors.length > 0) throw new Error(`${record.url}: ${response.errors.join('; ')}`);
      total += 1;
    }
  }

  rmSync(OUTPUT, { recursive: true, force: true });
  const written = await index.writeFiles({ outputPath: OUTPUT });
  if (written.errors.length > 0) throw new Error(written.errors.join('; '));
  await pagefind.close();
  console.log(`Índice Pagefind: ${total} páginas em ${path.relative(process.cwd(), OUTPUT)}.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
