# 003 — Arquitetura de páginas

Status: aprovada · Depende de: 001, 004 · Agente: Front-end Builder

## Contexto

O MVP tem 11 tipos de página, gerados no build para `/pt` e `/en`. Os slugs são iguais nos dois idiomas. Mockups em `docs/design/mockups/` (um por página; ver `docs/design/README.md`).

## Rotas

| Rota | Página | Conteúdo |
| --- | --- | --- |
| `/[locale]` | Início | Hero (ver abaixo), 4 áreas, Recém-indexados, Joias escondidas, Coleções, Contribua |
| `/[locale]/discover` · `learn` · `build` · `grow` | Área | Categorias da área + destaques |
| `/[locale]/c/[category]` | Categoria | Lista densa com filtros na URL (`?pricing=free&sort=…`) |
| `/[locale]/r/[slug]` | Recurso | ID, descrição, por que está aqui, detalhes, tags, alternativas |
| `/[locale]/collections` | Coleções | Lista |
| `/[locale]/collections/[slug]` | Coleção | Texto do curador + lista ordenada |
| `/[locale]/new` | Novos | Por data de entrada |
| `/[locale]/random` | Surpresa | Escolhe um recurso no browser e redireciona |
| `/[locale]/search` | Busca | Pagefind; fallback do ⌘K sem JS |
| `/[locale]/add` | Contribuir | Critérios + links para o Issue Form e o PR |
| `/[locale]/about` | Sobre | História, princípios, origem angolana |

Gerados no build: `sitemap.xml` (pt + en), `robots.txt`, `feed.xml` por idioma, imagens Open Graph por recurso e categoria.

## Hero da home (decidido — ver `decisions/0009`)

Layout do **hero-37 da Watermelon UI** (MIT), adaptado à FrontDex em `components/hero/`.

- Fundo: imagem `public/hero/hero-poster.webp` (= primeiro frame do vídeo, é o LCP) + loop de vídeo de 9 s (AV1 + H.264, versão 960 para telemóvel). Sem vídeo com movimento reduzido ou Save-Data; pausa fora do ecrã.
- Conteúdo pt-BR: título "Menos busca." / "Mais construção."; parágrafo; botão branco "Buscar no índice" + ⌘K (abre o CommandMenu); link "ou adicione um recurso"; em baixo, "[N] recursos · curados à mão", "[N] categorias · em [N] áreas" e "Feito em Angola. Aberto ao mundo.". Números vêm dos dados.
- Navegação: Descobrir, Aprender, Construir, Crescer, Coleções; à direita, idioma + ponto laranja + GitHub.
- Bloco de texto centrado na vertical.
- Mockup: `docs/design/mockups/HeroV3Video.dc.html`. O hero-13 (`HeroV2.dc.html`) fica arquivado.

## Estrutura de código

```
data/*.yaml  →  lib/content  →  app/ + components/
```

- Páginas = Server Components. Ilhas client-side: busca/⌘K, filtros da categoria, seletor de idioma e vídeo do hero. Exceção D-15: o canvas decorativo dos cards de área também é client-side; o conteúdo continua estático e gerado no servidor.
- Filtros vivem na URL. Sem Redux/Zustand/React Query.
- Links de saída para recursos (site, repo, aleatório, busca) passam por `outboundUrl` (`lib/outbound.ts`): acrescenta `ref=frontdex`, `utm_source=frontdex` e `utm_medium=referral` sem substituir parâmetros que o URL já tem.
- Componentes por papel: primitivos (IndexId, TagChip, ícones) → compostos (ResourceRow, FilterBar) → páginas.

## Cards de área na home (D-15)

- Os quatro cards seguem o visual de `section-2.html`; nomes, descrições, categorias, contagens e links continuam a vir do loader. Os estados vazios mantêm a sugestão de contribuição.
- A tinta WebGL é decorativa, usa as cores dos tokens da marca, fica oculta para tecnologias assistivas e tem fallback estático quando WebGL não está disponível.
- O canvas só anima quando visível. Com `prefers-reduced-motion`, desenha um frame estático e não mantém um loop de renderização.
- O hover/foco usa os recipes de movimento de `styles/motion.css`; o conteúdo e os links funcionam sem JavaScript.

## Critérios de aceitação

- [ ] Todas as rotas geram HTML estático para `pt` e `en` (`generateStaticParams`).
- [ ] Os filtros da categoria funcionam com botão voltar e são partilháveis pela URL.
- [ ] Cada recurso `active` tem página, aparece na categoria, no sitemap e no feed se for novo.
- [ ] Páginas 404 traduzidas.
- [ ] O hero usa `components/hero/` (layout do hero-37, sem `lucide-react` nem `motion`, aviso MIT no topo do ficheiro, D-12) e o LCP é a imagem poster.
- [ ] Os cards de área mantêm conteúdo renderizado no servidor, tinta decorativa acessível, fallback sem WebGL e frame estático com movimento reduzido (D-15).
- [ ] Metas da constitution passam no Lighthouse CI para home, categoria e recurso.
