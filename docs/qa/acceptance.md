# Revisão final — critérios de aceitação (T-905)

Data: 2026-11-14 · Branch: `m8-contribuicao` · Âmbito: specs 001–008, v1 só em dark (D-03, D-07).

Legenda: ✅ cumprido · ❌ por resolver · ⏳ depende de uma ação fora do código (Matheus ou merge em `main`) · ➖ fora do âmbito da v1.

## 001 — Schema de dados

| Critério | Estado | Evidência |
| --- | --- | --- |
| `pnpm validate` valida todos os YAML com erros legíveis (ficheiro, campo, motivo) | ✅ | `formatError` em `lib/content/validate.ts`; `validate.test.ts` |
| URLs duplicadas, categorias inexistentes, tags fora da lista e `alternatives` quebradas falham | ✅ | `validateContent` (URL normalizada, categoria/área, tags, alternatives); testes |
| Descrições fora de 40–160 caracteres falham | ✅ | `DESCRIPTION_MIN`/`DESCRIPTION_MAX` em `lib/content/schema.ts`; `schema.test.ts` |
| `active` com `TODO` falha; `draft` passa mas não é publicado | ✅ | `findTodoPaths` (regra estrita, D-08); `listResources` filtra `active` por omissão |
| JSON Schema em `data/schema.json`, referenciado no topo de cada YAML | ✅ | Todos os YAML de recursos têm a linha `yaml-language-server`. O schema descreve recursos, por isso áreas, categorias, tags e coleções não o referenciam |
| Loader com funções puras (`getResource`, `listResources({area, category, tag, status})`, `getCategory`, `listCollections`, `getAlternatives`) | ✅ | `lib/content/queries.ts` + `lib/content/index.ts` |
| Testes Vitest cobrem o schema e o loader | ✅ | `schema.test.ts`, `queries.test.ts`, `index.test.ts`, `seed.test.ts` |

## 002 — Fluxo de contribuição

| Critério | Estado | Evidência |
| --- | --- | --- |
| Issue do formulário gera PR com o YAML correto em < 2 min | ⏳ | `.github/workflows/issue-to-pr.yml` + conversor testado (T-801). Os workflows de issue só correm a partir de `main`: teste real depois do merge |
| Sem descrição PT, o PR recebe `needs-translation` em vez de falhar | ✅ | `issue-to-pr.yml`; label criada |
| CI comenta no PR uma lista legível de erros | ✅ | `validation-comment.yml` + `scripts/report-validation-errors.ts`; testes com API simulada (T-802) |
| CI verifica que a URL responde 2xx/3xx e usa https | ✅ | `scripts/check-resource-urls.ts` no `ci.yml` (T-803) |
| Depois do merge, próximo ID livre sem conflitos, mesmo com dois merges seguidos | ✅ | `assign-ids.yml` com `concurrency` serializada; testes (T-804) |
| Link check semanal abre issue por link partido; 14 dias → `archived` por PR | ✅ | `link-check.yml`; testes com API simulada (T-805). Dispatch real depois do merge |
| `main` protegida: aprovação do CODEOWNER e CI verde | ⏳ | `CODEOWNERS` e passos em `docs/branch-protection.md`. Ativar é uma definição do repositório, feita pelo Matheus |
| `CONTRIBUTING.md` em pt-BR e en | ✅ | `CONTRIBUTING.md` (pt-BR, depois secção em inglês) |

## 003 — Arquitetura de páginas

| Critério | Estado | Evidência |
| --- | --- | --- |
| Todas as rotas geram HTML estático para `pt` e `en` | ✅ | `generateStaticParams` no layout `[locale]` e nas rotas dinâmicas; `pnpm build` |
| Filtros da categoria funcionam com voltar e são partilháveis pela URL | ✅ | T-504; `tests/e2e/category.spec.ts` |
| Cada recurso `active` tem página, aparece na categoria, no sitemap e no feed se for novo | ✅ | `resource.spec.ts`, `category.spec.ts`, `sitemap.spec.ts`, `feed.spec.ts` |
| Páginas 404 traduzidas | ✅ | 404 bilingue (D-09); `not-found.spec.ts` |
| Hero baseado no hero-13 do registry, sem `lucide-react` nem `motion`, com aviso MIT | ✅ | `components/hero/Hero.tsx` (D-12) |
| Metas da constitution no Lighthouse CI (home, categoria, recurso) | ✅ | T-902: scores ≥ 96, LCP máx. 723 ms, JS próprio da home 15,7 KB gzip |

## 004 — Tokens de design

| Critério | Estado | Evidência |
| --- | --- | --- |
| `styles/tokens.css` define todos os tokens, com variante light em `[data-theme="light"]` | ✅ | Variante light presente. Aprovação das cores claras adiada (D-07) |
| Nenhum componente usa cor, raio, fonte ou duração fora dos tokens (lint/grep no CI) | ✅ | `pnpm check:anti-ai` (cor, raio, sombra) + `lib/design/motion.ts` (duração, easing). Fontes: nenhum `font-family` solto no código (grep da revisão) |
| Contraste AA em todas as combinações texto/fundo | ✅ | `pnpm contrast:check` no CI; axe sem violações (T-901) |
| `/[locale]/_design` (só em dev) mostra os componentes nos dois temas | ✅ | `app/[locale]/%5Fdesign/page.dev.tsx` |

## 005 — Voz e texto

| Critério | Estado | Evidência |
| --- | --- | --- |
| Todas as chaves de UI em `messages/pt.json` e `messages/en.json` | ✅ | `pnpm check:i18n` |
| Nenhum texto usa as palavras proibidas da spec 006 | ✅ | `pnpm check:anti-ai` |
| Os 30–50 primeiros recursos (escritos pelo Matheus) servem de exemplo | ⏳ | Hoje há 8 recursos `active` e 9 `draft`. Depende do conteúdo do Matheus (T-907) |

## 006 — Anti-AI

| Critério | Estado | Evidência |
| --- | --- | --- |
| `pnpm check:anti-ai` corre no CI e falha com a lista de violações (ficheiro:linha) | ✅ | `ci.yml`; fixtures em `tests/` (T-806) |
| O template de PR inclui a checklist de layout | ✅ | `PULL_REQUEST_TEMPLATE.md` na raiz, que o GitHub também lê (T-807) |

## 007 — i18n

| Critério | Estado | Evidência |
| --- | --- | --- |
| O CI falha se uma chave existir num `messages/*.json` e não no outro | ✅ | `pnpm check:i18n` no `ci.yml` |
| Testes Playwright cobrem os 4 casos do middleware | ✅ | `tests/e2e/locale-redirect.spec.ts` (casos 1–4) |
| Trocar de idioma mantém a mesma rota | ✅ | `tests/e2e/locale-switch.spec.ts` |

## 008 — Busca

| Critério | Estado | Evidência |
| --- | --- | --- |
| Resultados em < 100 ms depois do índice carregado | ✅ | `tests/e2e/search.spec.ts` |
| O índice só carrega na primeira abertura do menu | ✅ | `search.spec.ts` |
| Teclado completo; foco preso; Esc fecha | ✅ | `search.spec.ts` |
| Busca em pt não devolve páginas en e vice-versa | ✅ | `search.spec.ts` |
| `/search?q=` como página normal (D-13) | ✅ | Com JS filtra; sem JS mostra o índice completo com dica ⌘F/Ctrl+F |

## Resumo

- Nenhum ❌ no código.
- ⏳ por resolver fora do código:
  1. Proteção de `main` (Matheus, `docs/branch-protection.md`).
  2. Teste real do Issue Form → PR e do link check, depois do merge em `main`.
  3. Conteúdo: 30–50 recursos de exemplo e 100–150 `active` (T-907).
- ➖ Tema claro (T-405, T-904) fica para depois da v1.
