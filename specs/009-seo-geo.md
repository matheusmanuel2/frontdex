# 009 — SEO técnico e otimização para assistentes de IA (GEO)

Status: aprovada (Matheus, 2026-11-15) · Depende de: 001, 003, 007 · Decisão: [ADR 0012](../decisions/0012-seo-geo.md)

Objetivo: o Google entende, indexa e posiciona a FrontDex; os assistentes de IA conseguem ler e citar a FrontDex como fonte; o índice evita os riscos de agregador (conteúdo fraco, duplicado das fontes, páginas sem valor próprio).

## 1. Favicon e ícones

- Ícone próprio para tamanhos pequenos (`public/icon.svg`): símbolo da marca num quadrado Ink arredondado, traço reforçado para ler a 16 px. Não precisa de variante para modo escuro (tem fundo próprio).
- Ficheiros em `public/`, com URLs estáveis e sem hash: `/favicon.ico` (16, 32, 48), `/icon.svg`, `/apple-touch-icon.png` (180), `/icon-192.png`, `/icon-512.png`, `/icon-maskable-512.png`, `/site.webmanifest`.
- Declarados em `app/layout.tsx` (metadados da raiz), por isso chegam a todas as páginas, incluindo a 404.
- O Google pode levar dias ou semanas a mostrar o favicon nos resultados depois do primeiro rastreio.

## 2. Base técnica

- Todo o conteúdo (nome, descrição, why, factos, categorias, links) está no HTML estático. Nada essencial depende de JavaScript.
- URLs mantêm-se: `/{locale}/r/{slug}`, `/{locale}/c/{categoria}`, `/{locale}/{área}`. São curtas, estáveis e já indexadas; mudar para slugs traduzidos obrigaria a redirecionamentos sem ganho de ranking e quebraria a regra de slugs iguais da spec 007.
- `<html lang>` (`pt-BR`/`en`), canonical absoluto e hreflang pt/en/x-default em todas as páginas.
- `sitemap.xml` gerado dos YAML, com `lastmod` real (o `last_checked` mais recente dos recursos que a página mostra; páginas sem data nos dados vão sem `lastmod`). Sem páginas `noindex`: fora `/search`, `/random` e recursos arquivados.
- `robots.txt` com o sitemap e os blocos de crawlers (§6).
- Recurso `archived`: a página continua a existir (não quebra links externos), com aviso visível, selo "Arquivado", `noindex, follow`, fora do sitemap, da busca, do llms.txt e dos dados abertos. `draft` nunca tem página.
- 404: busca, links para as quatro áreas, novos, surpresa e coleções; `noindex`.
- Core Web Vitals: o poster do hero é o LCP e o vídeo carrega depois (T-501); fontes via `next/font` (`font-display: swap`); o índice da busca só carrega na primeira abertura do ⌘K (spec 008).

## 3. Conteúdo de agregador

- Página de recurso: descrição nossa, "Por que está aqui" em destaque quando existe, factos em texto (categoria, área, preço, open source, licença, nível, autor, datas com `<time datetime>`), alternativas e "Mais em {categoria}" (até 4 da mesma categoria). Link externo com `rel="noopener"`, sem `nofollow` (a recomendação é editorial) e com `ref`/UTM (spec 003).
- O campo `why` é **opcional** (decisão do Matheus): nem toda a contribuição o terá. Quando existe, tem de estar em pt e en.
- Categorias e áreas são hubs: título, introdução (descrição dos dados), lista de recursos e links para as vizinhas (sidebar da categoria, "Outras áreas").
- Indexação: todas as categorias e áreas são indexáveis, mesmo com poucos recursos (decisão do Matheus). `noindex` só em `/search`, `/random`, arquivados e 404.
- Links internos: breadcrumbs em todas as páginas internas; rodapé com as quatro áreas e o link para os dados abertos.

## 4. Metadados

| Página | `<title>` (pt) | `<title>` (en) |
| --- | --- | --- |
| Home | FrontDex — a internet front-end, indexada | (igual, do `meta.title`) |
| Área | {Área}: recursos front-end curados · FrontDex | {Area}: curated front-end resources · FrontDex |
| Categoria | {Categoria}: recursos front-end selecionados · FrontDex | {Category}: hand-picked front-end resources · FrontDex |
| Recurso | {nome}: {Categoria} · FrontDex | {name}: {Category} · FrontDex |

- Descrição: a descrição dos dados (recurso, área, categoria); sem descrição de categoria, um modelo com o número de recursos.
- Open Graph e Twitter em todas as páginas: `og:url`, `og:type` (`article` no recurso, `website` no resto), `og:locale` + `og:locale:alternate`, `og:site_name`, imagem 1200×630 gerada no build. A imagem do recurso mostra nome, categoria e o why (ou a descrição).

## 5. Dados estruturados (JSON-LD)

- Home: `Organization` (nome, logo, `sameAs` GitHub) e `WebSite`.
- Área, categoria, coleção, coleções, novos: `CollectionPage` com `ItemList` (url e nome de cada item) + `BreadcrumbList`.
- Recurso: `WebPage` (`datePublished` = `added`, `dateModified` = `last_checked`) com `mainEntity` pelo tipo da categoria: `SoftwareApplication` (ui-components, animation, charts, dev-tools, ai-tools, icons), `Course` (courses), `Book` (books), `CreativeWork` (restantes). Inclui só o que existe nos dados: `author`, `license`, `isAccessibleForFree` (free → true, paid → false, freemium omitido), `sameAs` (repo), `keywords` (tags).
- Sobre: `AboutPage` sobre a `Organization`. Contribuir: `WebPage`.
- Proibido: `SearchAction`, FAQ ou qualquer marcação que não reflita o conteúdo visível.

## 6. Crawlers e assistentes de IA

- `robots.txt` permite: busca (Googlebot, Bingbot, Applebot, DuckDuckBot), assistentes e busca de IA (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User) e, por defeito, treino (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot). O bloco de treino está comentado em `app/robots.ts` para ser trocado por `disallow`.
- Referências dos user-agents: OpenAI (platform.openai.com/docs/bots), Anthropic (support.anthropic.com, "Does Anthropic crawl data from the web"), Perplexity (docs.perplexity.ai/guides/bots), Google (developers.google.com/search/docs/crawling-indexing/overview-google-crawlers), Apple (support.apple.com/119829), Common Crawl (commoncrawl.org/ccbot).
- CDN/WAF: a FrontDex está na Vercel (sem Cloudflare). Confirmar em Vercel → Firewall que nenhuma regra de "Bot Protection"/"AI Bots" está a bloquear ou a desafiar estes user-agents.
- `/llms.txt` (resumo, áreas, categorias com recursos, links para os dados) e `/llms-full.txt` (índice completo em Markdown: nome, URL, página FrontDex, factos, datas, tags, descrição, why). Gerados no build. Proposta de padrão, não fator de ranking.
- `/api/resources.json`: dados abertos (CC BY 4.0) com todos os recursos publicados, ligado no llms.txt, no rodapé e no README.
- Conteúdo fácil de citar: um `<h1>` por página, `<article>` no recurso, `<nav>` nos breadcrumbs, `<time datetime>` nas datas, factos em texto e sempre o nome "FrontDex".

## 7. Indexação e monitorização

- Verificação: `GOOGLE_SITE_VERIFICATION` e `BING_SITE_VERIFICATION` (variáveis da Vercel) viram `<meta>` em todas as páginas.
- IndexNow: chave em `INDEXNOW_KEY` (Vercel e secret do GitHub), servida em `/indexnow.txt`. O workflow `indexnow.yml` corre depois de cada deploy de Production com sucesso e envia as páginas afetadas pelos YAML mudados.
- CI: `pnpm check:seo` depois do build falha se um recurso publicado não tiver descrição pt/en, se o why existir só num idioma, se algum JSON-LD for inválido, se uma página indexável não tiver exatamente um `<h1>`, canonical e hreflang, ou se o sitemap tiver URLs sem página ou com `noindex`.

## Critérios de aceitação

- [x] `/favicon.ico`, `/icon.svg`, `/apple-touch-icon.png`, `/icon-192.png`, `/icon-512.png` e `/site.webmanifest` respondem 200 com o Content-Type certo, e todas as páginas os declaram (e2e `seo-geo.spec.ts`).
- [x] JSON-LD válido em todas as páginas geradas e sitemap sem URLs partidos (`pnpm check:seo`).
- [x] `/random` e recursos arquivados são `noindex` e ficam fora do sitemap.
- [x] `llms.txt`, `llms-full.txt` e `/api/resources.json` gerados dos dados.
- [ ] Rich Results Test e Schema Markup Validator sem erros nas páginas de exemplo (depois do deploy).
- [ ] Search Console e Bing Webmaster Tools verificados; sitemap submetido.
