# FrontDex — Tasks do MVP

Backlog completo para construir a FrontDex do zero até ao lançamento. É a fonte de verdade do que falta fazer.

- Cada task tem o **agente** que a executa, a **spec** que a justifica, as **dependências** e um **"Pronto quando"** verificável.
- **Um commit por task**, com a mensagem a começar pelo ID: `T-203: loader de conteúdo`.
- **Um PR por marco** (M1, M2…). O PR lista as tasks que cobre e liga às specs. O Matheus faz o merge.
- Ao terminar uma task, marca `[x]` aqui no mesmo commit.
- Se uma task exigir uma decisão que a spec não cobre, **para e pergunta**. Regista a pergunta em "Decisões em aberto" no fim deste ficheiro.
- Mockups de referência: `docs/design/mockups/*.dc.html` (HTML de referência visual, não é código de produção).

## Mapa dos marcos

| Marco | O quê | Agente principal | Depende de |
| --- | --- | --- | --- |
| M0 | Preparação (tu, Matheus) | — | — |
| M1 | Fundação do repositório | data-ci | M0 |
| M2 | Conteúdo: schema, loader, validação | data-ci | M1 |
| M3 | Design system: tokens, componentes, ícones, movimento | design-system | M1 |
| M4 | Esqueleto: i18n, layout, cabeçalho, rodapé, 404 | frontend-builder | M2, M3 |
| M5 | Páginas | frontend-builder | M4 |
| M6 | Busca e ⌘K | frontend-builder | M5 |
| M7 | SEO, feed, OG, analytics | frontend-builder + data-ci | M5 |
| M8 | Fluxo de contribuição e CI completo | data-ci | M2 |
| M9 | Qualidade e lançamento | reviewer + todos | M5–M8 |

M2 e M3 podem correr em paralelo. M8 pode começar logo depois de M2.

---

## M0 · Preparação (Matheus)

- [x] **T-001** Ler e aprovar as specs 000–008 (mudar `Status:` para `aprovada`). Ordem: 000 → 001 → 004 → 006 → 002 → 003 → 005 → 007 → 008.
- [x] **T-002** `gh auth login` na máquina onde corre o Claude Code, com acesso a `matheusmanuel2/frontdex`.
- [x] **T-003** Colocar o conteúdo do kit no repositório e fazer o primeiro push (ver `docs/next-steps.md`).
- [ ] **T-004** Aceitar o MCP da Watermelon no Claude Code (`/mcp`) e instalar a skill do transitions.dev.
- [ ] **T-005** Responder às "Decisões em aberto" marcadas como **bloqueante** no fim deste ficheiro.
- [ ] **T-006** Contas: Vercel (ligar o repo) e Umami Cloud (criar o website e guardar o ID). Só são precisas em M7/M9.

---

## M1 · Fundação do repositório

### T-101 · Scaffold Next.js
- Agente: data-ci · Spec: 000, `decisions/0001` · Depende de: M0
- Faz: Next.js (App Router) com TypeScript strict, pnpm, `src/` **não** usado (pastas na raiz como em `docs/architecture.md`). Remove o boilerplate. Mantém os ficheiros do kit intactos.
- Ficheiros: `package.json`, `tsconfig.json`, `next.config.ts`, `app/`, `.nvmrc` (Node LTS), `.npmrc`.
- Pronto quando:
  - [x] `pnpm install && pnpm build` passa; existe `pnpm typecheck` (`tsc --noEmit`).
  - [x] `tsconfig` com `strict`, `noUncheckedIndexedAccess`, aliases `@/lib`, `@/components`.
  - [x] Nenhum ficheiro do kit (specs, data, docs, .claude) foi alterado ou apagado.

### T-102 · Lint e formatação
- Agente: data-ci · Spec: 000 · Depende de: T-101
- Faz: ESLint (config do Next + regras de import), Prettier, `pnpm lint`, `pnpm format`. Regra `no-restricted-imports` para `lucide-react`, `@heroicons/react`, `react-icons`, `@tabler/icons-react`.
- Pronto quando:
  - [x] `pnpm lint` passa limpo.
  - [x] Importar `lucide-react` faz o lint falhar.

### T-103 · Testes base
- Agente: data-ci · Spec: 000 · Depende de: T-101
- Faz: Vitest (unitários), Playwright + `@axe-core/playwright` (e2e e acessibilidade). Scripts `pnpm test`, `pnpm test:e2e`.
- Pronto quando:
  - [x] Um teste de exemplo passa em cada ferramenta.
  - [x] Playwright corre contra `pnpm build && pnpm start`.

### T-104 · CI mínimo
- Agente: data-ci · Spec: 002 · Depende de: T-102, T-103
- Faz: `.github/workflows/ci.yml` com install (cache do pnpm), lint, typecheck, test, build. Os passos de conteúdo e anti-AI entram em M2 e M8.
- Pronto quando:
  - [x] O CI corre em cada PR e em `main` e fica verde.

---

## M2 · Conteúdo

### T-201 · Schema Zod
- Agente: data-ci · Spec: 001 · Depende de: T-101
- Faz: `lib/content/schema.ts` com Resource, Area, Category, Tag, Collection, exatamente como a tabela da spec 001 (incluindo a regra de `TODO` só em `draft`).
- Pronto quando:
  - [x] Testes Vitest cobrem cada regra da spec 001 (casos válidos e inválidos).

### T-202 · Ajustar os YAML do seed ao schema
- Agente: data-ci · Spec: 001 · Depende de: T-201
- Faz: corrige só **forma** (nomes de campos, datas, ordem) nos YAML de `data/`. Nunca inventa valores: o que faltar fica `TODO` e o recurso fica `draft`.
- Pronto quando:
  - [x] Os 8 recursos `active` passam o schema.
  - [x] Os `draft` passam como `draft`.
  - [x] O diff não muda nenhuma descrição, URL, preço ou licença.

### T-203 · Loader de conteúdo
- Agente: data-ci · Spec: 001 · Depende de: T-201
- Faz: `lib/content/index.ts` com `getResource`, `listResources({area, category, tag, status})`, `getCategory`, `listCategories(area)`, `getArea`, `listCollections`, `getCollection`, `getAlternatives`, `listNew({since})`. Só devolve `active` por omissão. Cache em memória durante o build.
- Pronto quando:
  - [x] Funções puras, tipadas, cobertas por testes.
  - [x] `lib/content` é o único sítio do código que lê ficheiros de `data/`.

### T-204 · `pnpm validate`
- Agente: data-ci · Spec: 001 · Depende de: T-203
- Faz: `scripts/validate.ts`. Valida todos os YAML, URLs duplicadas, categorias e tags existentes, `alternatives` válidas, descrições 40–160, `TODO` em `active`. Erros legíveis: `ficheiro › campo › motivo`.
- Pronto quando:
  - [x] Cada regra tem um fixture que falha.
  - [x] Entra no `ci.yml`.

### T-205 · JSON Schema para o editor
- Agente: data-ci · Spec: 001 · Depende de: T-201
- Faz: gera `data/schema.json` a partir do Zod (`pnpm schema`) e adiciona `# yaml-language-server: $schema=../schema.json` no topo de cada YAML de recurso.
- Pronto quando:
  - [x] O VS Code dá autocomplete e erros num YAML novo.
  - [x] O CI falha se o `schema.json` estiver desatualizado.

---

## M3 · Design system

### T-301 · Tokens completos
- Agente: design-system · Spec: 004 · Depende de: T-101
- Faz: completa `styles/tokens.css` com todos os tokens da spec 004 + variante `[data-theme="light"]`. Cores do light: deriva do brand book e propõe; **não** inventa sem mostrar.
- Pronto quando:
  - [x] Todos os tokens da spec existem nos dois temas.
  - [x] Tabela de contraste AA (texto × fundo) em `docs/design/contrast.md`, todas as combinações usadas a passar.

### T-302 · Tailwind v4 sobre os tokens
- Agente: design-system · Spec: 004 · Depende de: T-301
- Faz: Tailwind v4 com `@theme` a apontar para os tokens. Desliga a paleta de cores padrão do Tailwind.
- Pronto quando:
  - [x] `bg-indigo-500` não gera CSS; `bg-carbon`, `text-secondary`, `rounded-pill` funcionam.

### T-303 · Fontes
- Agente: design-system · Spec: 004, `decisions/0005` · Depende de: T-302
- Faz: Geist e Geist Mono pelo pacote `geist` (next/font), `display: swap`, só os pesos usados (400, 500, 600). Títulos 400, −0,02em, entrelinha 1,05.
- Pronto quando:
  - [x] Nenhum pedido a Google Fonts em produção.
  - [x] Classes utilitárias `font-mono`, `title-display`, `title-h1`, `title-h2`.

### T-304 · Movimento
- Agente: design-system · Spec: 004 · Depende de: T-302
- Faz: instala a skill do transitions.dev, gera os tokens de duração/easing e documenta os recipes usados em `docs/design/motion.md`. Respeita `prefers-reduced-motion`.
- Pronto quando:
  - [x] Zero durações ou `@keyframes` escritos à mão fora dos recipes.

### T-305 · Componentes Watermelon re-tematizados
- Agente: design-system · Spec: 004 · Depende de: T-302, T-303
- Faz: pelo MCP da Watermelon, instala Button, Input, Dialog, DropdownMenu, Tooltip, Segmented/Tabs em `components/ui/`. Re-tematiza (cor, fonte, raio via tokens). Mantém o aviso MIT no topo de cada ficheiro.
- Variantes de Button: `primary` (pílula branca), `secondary` (pílula escura com borda 10%), `brand` (Index Blue), `ghost`.
- Pronto quando:
  - [x] Nenhum componente com cores ou raios padrão do shadcn.
  - [x] Foco visível (#5B97FF, 2px) em todos os interativos.

### T-306 · IconBase e set de ícones animados
- Agente: design-system · Spec: 004 · Depende de: T-304
- Faz: `components/icons/IconBase.tsx` (grelha 24, traço 1,5, `currentColor`) e o set mínimo, animado no hover/foco ao estilo Resend: search, arrow-up-right, chevron-down, close, link, copy, shuffle, rss, github, star, play, check, x, sun, moon, globe, filter.
- Pronto quando:
  - [x] Cada ícone anima com um recipe e fica estático com `prefers-reduced-motion`.
  - [x] Ícones decorativos com `aria-hidden`; ícones sozinhos em botões com `aria-label` no botão.

### T-307 · Componentes próprios
- Agente: design-system · Spec: 004 · Depende de: T-305, T-306
- Faz: IndexId (`#0002` em mono), TagChip, ResourceRow (lista densa, seta no hover), CategoryCard, CollectionCard, SectionTitle (dois tons), Eyebrow, Breadcrumb, EmptyState. Referência visual: mockups de Categoria, Área e Coleções.
- Pronto quando:
  - [x] Cada componente tem estados (hover, foco, disabled quando aplicável) e funciona nos dois temas.

### T-308 · Página `/_design`
- Agente: design-system · Spec: 004 · Depende de: T-307
- Faz: rota só em dev com todos os componentes, ícones e tokens nos dois temas.
- Pronto quando:
  - [x] Não é gerada no build de produção.
  - [x] axe sem violações nesta página.

---

## M4 · Esqueleto e idiomas

### T-401 · next-intl
- Agente: frontend-builder · Spec: 007 · Depende de: T-101
- Faz: `app/[locale]/`, `lib/i18n/`, `messages/pt.json` e `messages/en.json`. `generateStaticParams` para `pt` e `en`. `<html lang>` correto.
- Pronto quando:
  - [ ] `/pt` e `/en` geram HTML estático.

### T-402 · Middleware de idioma em `/`
- Agente: frontend-builder · Spec: 007 · Depende de: T-401
- Faz: só em `/`. Ordem: cookie `NEXT_LOCALE` → `Accept-Language` → `x-vercel-ip-country` (AO, BR, PT, MZ, CV, GW, ST, TL → pt) → `/pt`.
- Pronto quando:
  - [ ] 4 testes Playwright, um por caso.
  - [ ] Nenhuma outra rota redireciona por idioma ou IP.

### T-403 · Layout, cabeçalho e rodapé
- Agente: frontend-builder · Spec: 003 · Depende de: T-307, T-401
- Faz: cabeçalho (logo, nav das 4 áreas + Coleções com estado ativo, botão Buscar ⌘K, LocaleSwitch, "Adicionar recurso") e rodapé ("Feito em Angola. Aberto ao mundo.", links Novos, Surpresa, Contribuir, Sobre, GitHub, tema). Referência: cabeçalho do mockup `Area.dc.html`.
- Pronto quando:
  - [ ] Link "Saltar para o conteúdo" como primeiro elemento focável.
  - [ ] Nav com `aria-current="page"`.
  - [ ] Funciona de 360px a 1440px sem scroll horizontal (menu compacto no mobile).

### T-404 · LocaleSwitch
- Agente: frontend-builder · Spec: 007 · Depende de: T-403
- Faz: ilha client-side que troca para a mesma rota no outro idioma e grava o cookie.
- Pronto quando:
  - [ ] Em `/pt/c/icons`, trocar leva a `/en/c/icons`.

### T-405 · Tema claro/escuro
- Agente: frontend-builder · Spec: 004 · Depende de: T-403 · **Ver decisão D-03**
- Faz: alternar `data-theme` com script inline mínimo (sem flash), guardado em `localStorage`, dark por padrão.
- Pronto quando:
  - [ ] Sem flash de tema errado ao carregar.

### T-406 · 404 traduzida
- Agente: frontend-builder · Spec: 003 · Depende de: T-403
- Faz: `not-found.tsx` por idioma. Referência: `NotFound.dc.html`.
- Pronto quando:
  - [ ] `/pt/qualquer-coisa` mostra a 404 em pt-BR e `/en/anything` em inglês, com status 404.

### T-407 · Check de chaves i18n
- Agente: data-ci · Spec: 007 · Depende de: T-401
- Faz: `scripts/check-i18n.ts`; falha se uma chave existir num `messages/*.json` e não no outro. Entra no CI.
- Pronto quando:
  - [ ] Fixture com chave em falta faz o CI falhar.

---

## M5 · Páginas

Todas as páginas: Server Components, `generateStaticParams` para pt/en, textos em `messages/`, metadados (`title`, `description`) por página, sem texto inventado sobre recursos.

### T-501 · Hero da home (hero-13)
- Agente: frontend-builder · Spec: 003, `decisions/0009` · Depende de: T-403
- Faz: `npx shadcn@latest add https://registry.watermelon.sh/r/hero-13.json` para `components/hero/`, adapta ao conteúdo da spec 003 e ao fundo `public/hero/hero-bg.webp`. Botão branco = abre o CommandMenu (até M6, leva a `/search`). Referência pixel a pixel: `HeroV2.dc.html` + valores medidos em `docs/design/README.md`.
- Pronto quando:
  - [ ] Aviso MIT no topo do ficheiro.
  - [ ] Contagem "[N] recursos" vem do loader.
  - [ ] Imagem do hero com `priority` e tamanhos responsivos; LCP < 1,5 s.

### T-502 · Home: secções
- Agente: frontend-builder · Spec: 003 · Depende de: T-501
- Faz: 4 áreas, Recém-indexados, Joias escondidas, Coleções, Contribua. Referência: `Main.dc.html` (secções aprovadas, ignora o hero v1).
- Pronto quando:
  - [ ] Todas as listas vêm do loader; nada escrito à mão no JSX.

### T-503 · Página de Área
- Agente: frontend-builder · Spec: 003 · Depende de: T-403
- Faz: `/[locale]/(discover|learn|build|grow)`. Categorias da área com contagem e exemplos, "Em destaque", pílulas das outras áreas. Referência: `Area.dc.html`.
- Pronto quando:
  - [ ] As 4 áreas geram nos 2 idiomas; categorias vazias não aparecem.

### T-504 · Página de Categoria + filtros
- Agente: frontend-builder · Spec: 003 · Depende de: T-503
- Faz: `/[locale]/c/[category]`, lista densa de ResourceRow. FilterBar como ilha client-side com estado na URL (`pricing`, `oss`, `level`, `sort`). Estado vazio com "Limpar filtros" e "Sugerir recurso". Referências: `Category.dc.html`, `Empty.dc.html`.
- Pronto quando:
  - [ ] Filtros funcionam com voltar/avançar do browser e são partilháveis.
  - [ ] Sem JS, a lista completa aparece.

### T-505 · Página de Recurso
- Agente: frontend-builder · Spec: 003 · Depende de: T-504
- Faz: `/[locale]/r/[slug]`. ID, nome, link, descrição, "por que está aqui", detalhes (preço, open source, licença, nível), tags, alternativas, "Sugerir edição" (link para o YAML no GitHub). Referência: `Resource.dc.html`.
- Pronto quando:
  - [ ] Links externos com `rel="noopener"`.
  - [ ] Recurso sem `why` não mostra a secção vazia.

### T-506 · Coleções e Coleção
- Agente: frontend-builder · Spec: 003 · Depende de: T-503
- Faz: `/[locale]/collections` e `/[locale]/collections/[slug]`. Nota do curador, lista ordenada numerada, "Copiar link". Referências: `Collections.dc.html`, `Collection.dc.html`.
- Pronto quando:
  - [ ] Coleções em `draft` não são publicadas.

### T-507 · Novos
- Agente: frontend-builder · Spec: 003 · Depende de: T-503
- Faz: `/[locale]/new`, agrupado por semana de `added`, link para o RSS. Referência: `New.dc.html`.
- Pronto quando:
  - [ ] Ordem do mais recente para o mais antigo; semanas sem recursos não aparecem.

### T-508 · Surpresa
- Agente: frontend-builder · Spec: 003 · Depende de: T-505 · **Ver decisão D-01**
- Faz: `/[locale]/random`. Comportamento conforme D-01 (redirecionar ou mostrar o card do `Random.dc.html`).
- Pronto quando:
  - [ ] Funciona sem servidor (lista de slugs no build, escolha no browser).

### T-509 · Contribuir
- Agente: frontend-builder · Spec: 003, 002 · Depende de: T-403
- Faz: `/[locale]/add` em MDX por idioma. Pergunta de curadoria, dois caminhos (Issue Form e YAML), o que entra / não entra, exemplos Bom/Mau, passos depois de enviar. Referência: `Add.dc.html`. **O texto do mockup é rascunho: o Matheus revê antes do merge.**
- Pronto quando:
  - [ ] Links certos para o Issue Form e para o `CONTRIBUTING.md`.

### T-510 · Sobre
- Agente: frontend-builder · Spec: 003 · Depende de: T-403
- Faz: `/[locale]/about` em MDX por idioma. História, princípios, números reais do loader, "Apoie". Referência: `About.dc.html`. **Texto do mockup é rascunho: o Matheus revê.**
- Pronto quando:
  - [ ] Números (recursos, categorias, contribuidores) vêm dos dados, não estão escritos à mão.

---

## M6 · Busca

### T-601 · Pagefind
- Agente: frontend-builder · Spec: 008 · Depende de: T-505
- Faz: Pagefind no fim do build, índice por idioma, `data-pagefind-body` só em recurso e categoria, filtros área/categoria/preço/open source.
- Pronto quando:
  - [ ] Busca em pt não devolve páginas en e vice-versa.

### T-602 · CommandMenu (⌘K)
- Agente: design-system (componente) + frontend-builder (integração) · Spec: 008 · Depende de: T-601
- Faz: Dialog da Watermelon re-tematizado. Abre com ⌘K, Ctrl+K, `/` e pelo botão do hero e do cabeçalho. Índice só carrega na primeira abertura. Grupos Recursos, Categorias, Atalhos. Enter abre o recurso; ⌘Enter abre o site. Referência: `CommandK.dc.html` (sem blur, spec 006).
- Pronto quando:
  - [ ] Resultados em < 100 ms depois do índice carregado (Playwright).
  - [ ] Foco preso no diálogo, Esc fecha e devolve o foco.
  - [ ] O JS da home continua < 90 KB gzip.

### T-603 · `/search` sem JS
- Agente: frontend-builder · Spec: 008 · Depende de: T-601
- Faz: `/[locale]/search?q=` funciona como página normal e serve de fallback do ⌘K. Chips por área, termo realçado. Referência: `Search.dc.html`.
- Pronto quando:
  - [ ] Com JS desligado, o formulário do cabeçalho leva a esta página e mostra resultados.

---

## M7 · SEO, distribuição e analytics

### T-701 · Metadados e hreflang
- Agente: frontend-builder · Spec: 007 · Depende de: T-505
- Faz: `generateMetadata` em todas as rotas, `alternates` com pt, en e `x-default` → `/pt`, canonical.
- Pronto quando:
  - [ ] Cada página tem title e description únicos nos dois idiomas.

### T-702 · Sitemap e robots
- Agente: frontend-builder · Spec: 003 · Depende de: T-701
- Pronto quando:
  - [ ] `sitemap.xml` com todas as rotas pt + en; `robots.txt` aponta para ele.

### T-703 · Feed RSS
- Agente: frontend-builder · Spec: 003 · Depende de: T-507
- Faz: `/pt/feed.xml` e `/en/feed.xml` com os recursos mais recentes.
- Pronto quando:
  - [ ] Valida no W3C Feed Validator.

### T-704 · Imagens Open Graph
- Agente: frontend-builder · Spec: 003 · Depende de: T-505
- Faz: OG estáticas por recurso, categoria e home, com Geist, ID mono e as cores dos tokens. Sem gradientes.
- Pronto quando:
  - [ ] Geradas no build; pré-visualização correta no X/LinkedIn.

### T-705 · Umami Cloud
- Agente: data-ci · Spec: 000, `decisions/0007` · Depende de: T-006
- Faz: script do Umami com o website ID em variável de ambiente, só em produção. Eventos: `search_open`, `resource_outbound`, `random`, `add_click`.
- Pronto quando:
  - [ ] Sem cookies; nada carrega em dev nem em previews.

---

## M8 · Contribuição e CI completo

### T-801 · Issue Form → PR
- Agente: data-ci · Spec: 002 · Depende de: T-204
- Faz: `scripts/issue-to-yaml.ts` + `.github/workflows/issue-to-pr.yml`. Converte o issue em YAML (`status: draft` se faltar algo), abre o PR, liga o issue. Sem descrição PT → label `needs-translation`.
- Pronto quando:
  - [ ] Teste com um issue real cria o PR em < 2 minutos.

### T-802 · Comentário de erros no PR
- Agente: data-ci · Spec: 002 · Depende de: T-204
- Faz: quando o `validate` falha num PR, o bot comenta a lista `ficheiro › campo › motivo` e põe `needs-changes`.
- Pronto quando:
  - [ ] Um comentário por PR, atualizado em vez de duplicado.

### T-803 · Verificação de URL no PR
- Agente: data-ci · Spec: 002 · Depende de: T-204
- Faz: só para YAML alterados: https obrigatório, resposta 2xx/3xx (com retry e timeout).
- Pronto quando:
  - [ ] URL partida faz o CI falhar com mensagem clara.

### T-804 · assign-ids
- Agente: data-ci · Spec: 002 · Depende de: T-204
- Faz: `scripts/assign-ids.ts` + workflow em `main`. Próximo ID livre, commit automático, `concurrency` para evitar conflitos.
- Pronto quando:
  - [ ] Dois merges seguidos geram IDs diferentes e sequenciais.

### T-805 · Link check semanal
- Agente: data-ci · Spec: 002 · Depende de: T-204
- Faz: `scripts/check-links.ts` + workflow semanal. Um issue por link partido (`broken-link`); 14 dias sem correção → PR que muda para `archived`. Atualiza `last_checked`.
- Pronto quando:
  - [ ] Corre com `workflow_dispatch` e abre o issue certo para um link partido de teste.

### T-806 · Anti-AI no CI
- Agente: data-ci · Spec: 006 · Depende de: T-104
- Faz: `scripts/check-anti-ai.ts` (`pnpm check:anti-ai`) com todas as regras de código e texto da spec 006. Saída `ficheiro:linha › regra`.
- Pronto quando:
  - [ ] Cada regra tem um fixture que falha.
  - [ ] Gradiente em `components/hero/` passa; fora dele falha.

### T-807 · Labels, template de PR e proteção de `main`
- Agente: data-ci · Spec: 002 · Depende de: T-104
- Faz: cria as labels (`new-resource`, `needs-translation`, `needs-changes`, `broken-link`) com `gh`. Atualiza o `PULL_REQUEST_TEMPLATE.md` com a checklist de layout da spec 006. Escreve em `docs/branch-protection.md` os passos para o Matheus ativar a proteção (o agente não muda definições do repositório).
- Pronto quando:
  - [ ] Labels existem; o template tem a checklist.

---

## M9 · Qualidade e lançamento

### T-901 · Acessibilidade
- Agente: frontend-builder · Spec: 000 · Depende de: M5, M6
- Faz: axe em todas as rotas, nos dois temas e idiomas. Navegação só por teclado em cada página.
- Pronto quando:
  - [ ] Zero violações axe; relatório em `docs/qa/a11y.md`.

### T-902 · Lighthouse CI
- Agente: data-ci · Spec: 000 · Depende de: M5
- Faz: Lighthouse CI no workflow para home, categoria e recurso (pt e en).
- Pronto quando:
  - [ ] ≥ 95 nas quatro categorias, LCP < 1,5 s, JS da home < 90 KB gzip, e o CI falha abaixo disso.

### T-903 · Polimento de movimento
- Agente: design-system · Spec: 004 · Depende de: M5, M6
- Faz: `review`, `refine` e `polish` da skill do transitions.dev em todos os componentes com movimento.
- Pronto quando:
  - [ ] Relatório em `docs/qa/motion.md`; zero problemas pendentes.

### T-904 · QA do tema claro
- Agente: design-system · Spec: 004 · Depende de: T-405, M5
- Pronto quando:
  - [ ] Screenshots de todas as páginas nos dois temas em `docs/qa/screens/`; contraste AA confirmado.

### T-905 · Revisão final
- Agente: reviewer · Spec: todas · Depende de: T-901–T-904
- Faz: passa por todos os critérios de aceitação das specs 001–008 e marca ✅/❌/➖ em `docs/qa/acceptance.md`.
- Pronto quando:
  - [ ] Nenhum ❌ por resolver.

### T-906 · Deploy
- Agente: data-ci · Spec: `decisions/0006` · Depende de: T-905, T-006
- Faz: projeto na Vercel, previews por PR, variáveis de ambiente, domínio (quando o Matheus confirmar). README com como correr localmente.
- Pronto quando:
  - [ ] Preview de cada PR comentado no PR; produção a servir `main`.

### T-907 · Conteúdo para lançar (Matheus)
- [ ] Completar os recursos `draft` e chegar a 100–150 recursos `active`.
- [ ] Rever os textos de Contribuir e Sobre.
- [ ] Clearance do nome e domínio.

---

## Decisões em aberto

| ID | Pergunta | Bloqueia | Estado |
| --- | --- | --- | --- |
| D-01 | `/random` redireciona logo (spec 003) ou mostra o card do mockup antes de abrir? | T-508 | aberta |
| D-02 | Licença dos dados: CC BY 4.0 (proposta em `decisions/0008`)? | T-509, T-906 | aberta |
| D-03 | O seletor de tema é uma 4.ª ilha client-side (a spec 003 fala em 3)? Proposta: script inline mínimo, sem React | T-405 | aberta |
| D-04 | Plano Vercel: Hobby é só para uso não comercial | T-906 | aberta |
| D-05 | transitions.dev: plano Pro ou só o set gratuito? | T-304 | aberta — T-304 feita com o set gratuito, que cobre o MVP |
| D-06 | O fundo do hero está coberto pela MIT da Watermelon? | T-501 (lançamento) | aberta |
| D-07 | Cores do tema claro: aprovar a proposta da T-301 | T-904 | aberta |
| D-08 | O schema recusa `TODO` em **qualquer** campo (não só nos marcados com \*) e também em `archived` (a spec 001 só fala de `active`). Manter esta regra mais estrita? | T-201 (já implementado assim) | aberta |
