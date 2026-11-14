import { routing, type AppLocale } from '@/lib/i18n/routing';
import { createOpenGraphImage, OPEN_GRAPH_SIZE } from '@/lib/seo/open-graph';
import enMessages from '@/messages/en.json';
import ptMessages from '@/messages/pt.json';

export const alt = 'FrontDex';
export const size = OPEN_GRAPH_SIZE;
export const contentType = 'image/png';

type Props = { params: Promise<{ locale: AppLocale }> };

const messages = { pt: ptMessages, en: enMessages };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image({ params }: Props) {
  const { locale } = await params;
  const t = messages[locale].hero;

  return createOpenGraphImage({
    locale,
    eyebrow: t.badge,
    title: `${t.title} ${t.titleMuted}`,
    description: t.description,
  });
}
