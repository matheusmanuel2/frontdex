import { filterItems } from '@/components/category/CategoryView';
import { listCategories } from '@/lib/content';
import { routing, type AppLocale } from '@/lib/i18n/routing';

/** Lista completa da categoria para a ilha de filtros (spec 003). Gerada no build. */
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => listCategories().map((category) => ({ locale, category: category.slug })));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: AppLocale; category: string }> }) {
  const { locale, category } = await params;
  return Response.json(filterItems(category, locale));
}
