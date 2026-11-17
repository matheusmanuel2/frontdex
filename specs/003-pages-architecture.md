# 003 — Arquitetura de páginas

Status: aprovada · Depende de: 001, 004 · Agente: Front-end Builder

## Contexto

O MVP tem 11 tipos de página, gerados no build para `/pt` e `/en`. Os slugs são iguais nos dois idiomas. Mockups em `docs/design/mockups/` (um por página; ver `docs/design/README.md`).

## Rotas

| Rota | Página | Conteúdo |
| --- | --- | --- |
| `/[locale]` | Início | Hero (ver abaixo), 4 áreas, Recém-indexados, Joias escondidas, Coleções, Contribua |
| `/[locale]/discover` · `learn` · `build` · `grow` | Área | Categorias da área + destaques |
| `/[locale]/c/[category]` | Categoria | Lista densa com filtros na URL (`?pricing=free&sort=…`); 50 recursos por página |
| `/[locale]/c/[category]/p/[page]` | Categoria, página 2+ | Mesma lista, página seguinte |
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
- No máximo 2 categorias por card (as com mais recursos); a lista completa está na página da área.

## Entrada das páginas e links de saída (Matheus, 2026-11-17)

- Todas as páginas, exceto a home (que tem a entrada própria do hero), entram com o recipe **18 · Texts reveal** do transitions.dev: os blocos do conteúdo aparecem um de cada vez, de cima para baixo, a subir `--distance-medium` com blur e fade (`--duration-very-slow`, `--ease-smooth-out`).
- Atraso de `--duration-micro` entre blocos (`.t-reveal`) e de `--duration-stagger` entre itens de uma lista (`.t-reveal-list`: linhas de recursos, cards de categoria e de coleção, categorias da barra lateral). A partir do 12.º elemento entram juntos.
- Corre no primeiro carregamento e em cada navegação (área, categoria, recurso…), só com CSS. Com `prefers-reduced-motion`, o conteúdo aparece sem animação.
- Na categoria, a barra lateral só entra em sequência quando a tela de categoria abre. Trocar de categoria pela própria barra anima apenas o conteúdo; a barra fica parada.
- Os links de saída para o recurso (site, repositório, aleatório) abrem numa nova aba (`target="_blank"`, `rel="noopener"`) e avisam leitores de ecrã com "(abre em nova aba)". A busca ⌘K já abria resultados externos numa nova aba.

## Paginação da categoria

Uma categoria com centenas de recursos não pode mandar tudo no HTML (a ui-components chegou a 1,6 MB e baixou o Lighthouse para 0,90).

- 50 recursos por página, ordenados por "Mais recentes". A página 1 é `/c/[category]`; as seguintes, `/c/[category]/p/2`, `/p/3`… Tudo gerado no build.
- Navegação de páginas no fim da lista (`nav` "Paginação": anterior, números, seguinte), com links reais: funciona sem JS.
- Cada página tem canonical próprio e entra no sitemap. O JSON-LD lista só os recursos da página.
- A lista completa da categoria (os campos mínimos da ilha de filtros) é um JSON estático: `/[locale]/c/[category]/items.json`.
- Com filtro ou ordenação ativos, a ilha carrega esse JSON e mostra todos os resultados da categoria, sem paginação. Sem filtros, volta à página do servidor.
- Sem JS, filtros na URL são ignorados e aparece a página pedida.

## Critérios de aceitação

- [ ] Todas as rotas geram HTML estático para `pt` e `en` (`generateStaticParams`).
- [ ] Os filtros da categoria funcionam com botão voltar e são partilháveis pela URL.
- [ ] Categorias com mais de 50 recursos têm páginas `/p/N`, com navegação que funciona sem JS; os filtros cobrem a categoria inteira.
- [ ] Cada recurso `active` tem página, aparece na categoria, no sitemap e no feed se for novo.
- [ ] Páginas 404 traduzidas.
- [ ] O hero usa `components/hero/` (layout do hero-37, sem `lucide-react` nem `motion`, aviso MIT no topo do ficheiro, D-12) e o LCP é a imagem poster.
- [ ] Os cards de área mantêm conteúdo renderizado no servidor, tinta decorativa acessível, fallback sem WebGL e frame estático com movimento reduzido (D-15).
- [ ] Metas da constitution passam no Lighthouse CI para home, categoria e recurso.
- [ ] As páginas entram com o recipe 18 (blocos e listas em sequência) e respeitam `prefers-reduced-motion`.
- [ ] Os links de saída do recurso abrem numa nova aba e anunciam isso a leitores de ecrã.
