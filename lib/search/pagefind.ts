/**
 * Cliente do Pagefind (spec 008). O índice é gerado a partir dos YAML antes do build,
 * em public/pagefind, e só é carregado quando a busca abre pela primeira vez.
 * O Pagefind escolhe o índice pelo <html lang>: em /pt só há resultados pt e vice-versa.
 */
export type SearchHit = {
  kind: 'resource' | 'category';
  url: string;
  title: string;
  slug: string;
  id?: number;
  description?: string;
  category?: string;
  area?: string;
  externalUrl?: string;
  count?: number;
  /** Excerto com <mark> à volta do termo (HTML do Pagefind). */
  excerpt: string;
};

type PagefindResult = {
  id: string;
  data: () => Promise<{ url: string; excerpt: string; meta: Record<string, string> }>;
};

type Pagefind = {
  options: (options: Record<string, unknown>) => Promise<void>;
  init: () => Promise<void>;
  search: (term: string) => Promise<{ results: PagefindResult[] }>;
};

export const PAGEFIND_URL = '/pagefind/pagefind.js';

let instance: Promise<Pagefind> | undefined;

/** Carrega o Pagefind uma vez (o ficheiro vem de public/, fora do bundle do Next). */
export function loadPagefind(): Promise<Pagefind> {
  instance ??= (async () => {
    const pagefind = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ PAGEFIND_URL)) as Pagefind;
    await pagefind.options({ excerptLength: 18, baseUrl: '/' });
    await pagefind.init();
    return pagefind;
  })();
  return instance;
}

/** URL da página a partir do caminho do HTML gerado (`/pt/r/kugiri.html` → `/pt/r/kugiri`). */
export function pageUrl(url: string): string {
  return (
    url
      .replace(/^\/_next\/static/, '')
      .replace(/\.html$/, '')
      .replace(/\/index$/, '') || '/'
  );
}

export async function search(term: string, limit = 12): Promise<SearchHit[]> {
  const query = term.trim();
  if (!query) return [];
  const pagefind = await loadPagefind();
  const { results } = await pagefind.search(query);
  const data = await Promise.all(results.slice(0, limit).map((result) => result.data()));
  return data.map(({ url, excerpt, meta }) => ({
    kind: meta.kind === 'category' ? 'category' : 'resource',
    url: pageUrl(url),
    title: meta.title ?? '',
    slug: meta.slug ?? '',
    id: meta.id ? Number(meta.id) : undefined,
    description: meta.description,
    category: meta.category,
    area: meta.area,
    externalUrl: meta.url,
    count: meta.count ? Number(meta.count) : undefined,
    excerpt,
  }));
}
