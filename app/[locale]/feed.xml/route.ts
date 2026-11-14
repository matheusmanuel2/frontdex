import { getTranslations } from 'next-intl/server';

import { listNew } from '@/lib/content';
import { routing, type AppLocale } from '@/lib/i18n/routing';
import { SITE_URL } from '@/lib/seo/metadata';

export const dynamic = 'force-static';
export const dynamicParams = false;

type Props = { params: Promise<{ locale: AppLocale }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (character) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&apos;',
    };
    return entities[character] ?? character;
  });
}

export async function GET(_request: Request, { params }: Props): Promise<Response> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'new' });
  const meta = await getTranslations({ locale, namespace: 'meta' });
  const title = `${t('title').replace(/\.$/, '')} · ${meta('siteName')}`;
  const feedUrl = `${SITE_URL}/${locale}/feed.xml`;
  const pageUrl = `${SITE_URL}/${locale}/new`;
  const language = locale === 'pt' ? 'pt-BR' : 'en';
  const items = listNew()
    .map((resource) => {
      const url = `${SITE_URL}/${locale}/r/${resource.slug}`;
      const published = new Date(`${resource.added}T00:00:00.000Z`).toUTCString();

      return [
        '<item>',
        `<title>${escapeXml(resource.name)}</title>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `<pubDate>${published}</pubDate>`,
        `<description>${escapeXml(resource.description[locale])}</description>`,
        '</item>',
      ].join('');
    })
    .join('');
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    `<title>${escapeXml(title)}</title>`,
    `<link>${escapeXml(pageUrl)}</link>`,
    `<description>${escapeXml(t('intro'))}</description>`,
    `<atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>`,
    `<language>${language}</language>`,
    items,
    '</channel>',
    '</rss>',
  ].join('');

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
