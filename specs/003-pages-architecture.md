# 003 — Arquitetura de páginas

Status: aprovada · Depende de: 001, 004 · Agente: Front-end Builder

## Contexto

O MVP tem 11 tipos de página, gerados no build para `/pt` e `/en`. Os slugs são iguais nos dois idiomas. Mockups em `docs/design/mockups/` (um por página; ver `docs/design/README.md`).

## Rotas

| Rota | Página | Conteúdo |
| --- | --- | --- |
| `/[locale]` | Início | Hero (ver abaixo), 4 áreas, Recém-indexados, Joias escondidas, Coleções, Contribua |
| `/[locale]/discover` · `learn` · `build` · `grow` | Área | Categorias da área + destaques |
| `/[locale]/c/[category]` | Categoria | Lista densa com filtros na URL (`?pricing=free&oss=1&level=…&sort=…`) |
| `/[locale]/r/[slug]` | Recurso | ID, descrição, por que está aqui, detalhes, tags, alternativas |
| `/[locale]/collections` | Coleções | Lista |
| `/[locale]/collections/[slug]` | Coleção | Texto do curador + lista ordenada |
| `/[locale]/new` | Novos | Por data de entrada |
| `/[locale]/random` | Surpresa | Escolhe um recurso no browser e redireciona |
| `/[locale]/search` | Busca | Pagefind; fallback do ⌘K sem JS |
| `/[locale]/add` | Contribuir | Critérios + links para o Issue Form e o PR |
| `/[locale]/about` | Sobre | História, princípios, origem angolana |

Gerados no build: `sitemap.xml` (pt + en), `robots.txt`, `feed.xml` por idioma, imagens Open Graph por recurso e categoria.

## Hero da home (decidido)

Base: o bloco **hero-13 da Watermelon UI**, instalado pelo registry e adaptado:

```bash
npx shadcn@latest add https://registry.watermelon.sh/r/hero-13.json
```

- Fundo: `public/hero/hero-bg.webp` (o fundo original do hero-13, sem textos; master em PNG em `docs/design/`).
- Conteúdo pt-BR: badge "Curado pela comunidade"; título "Menos busca." / "Mais construção."; parágrafo de apresentação; botão branco = **gatilho da busca** ("Buscar no índice" + ⌘K, abre o CommandMenu); botão escuro "Como funciona" com ícone play (leva a `/add`).
- Navegação do hero: Descobrir ⌄, Aprender ⌄, Construir, Crescer, Coleções; à direita, ponto laranja + GitHub.
- Rodapé do hero: avatares dos últimos contribuidores + "Mais de [N] recursos curados pela comunidade" (número real, vindo dos dados).
- Mockup de referência: `docs/design/mockups/HeroV2.dc.html`.

## Estrutura de código

```
data/*.yaml  →  lib/content  →  app/ + components/
```

- Páginas = Server Components. Só 3 ilhas client-side: busca/⌘K, filtros da categoria, seletor de idioma.
- Filtros vivem na URL. Sem Redux/Zustand/React Query.
- Componentes por papel: primitivos (IndexId, TagChip, ícones) → compostos (ResourceRow, FilterBar) → páginas.

## Critérios de aceitação

- [ ] Todas as rotas geram HTML estático para `pt` e `en` (`generateStaticParams`).
- [ ] Os filtros da categoria funcionam com botão voltar e são partilháveis pela URL.
- [ ] Cada recurso `active` tem página, aparece na categoria, no sitemap e no feed se for novo.
- [ ] Páginas 404 traduzidas.
- [ ] O hero é baseado no bloco hero-13 do registry (código tirado do JSON, re-tematizado, sem `lucide-react` nem `motion`), com o aviso MIT no topo do ficheiro (D-12).
- [ ] Metas da constitution passam no Lighthouse CI para home, categoria e recurso.
