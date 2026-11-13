# Progresso

Branch atual: m7-seo

| Data | Task | Commit | Notas |
| --- | --- | --- | --- |
| 2026-11-13 | T-001 | 4884b66 | Specs 000–008 aprovadas; kit commitado em `main` |
| 2026-11-13 | T-101 | 2b92f08 | Next 16.4.6, React 19.3 |
| 2026-11-13 | T-102 | 85f9d18 | TypeScript fixado em 6.x (typescript-eslint não suporta TS 7) |
| 2026-11-13 | T-103 | 5787683 | Vitest 5, Playwright 1.65 + axe |
| 2026-11-13 | T-104 | 040d0a9 | CI em PR e `main`; verde por confirmar (o token do gh não consegue abrir PRs) |
| 2026-11-13 | T-201 | 7c3b071 | Zod 4; mensagens de erro em pt |
| 2026-11-13 | T-202 | 6b89c56 | Seed já passava: nenhum YAML alterado. Aviso: `cmux` com licença `GPL` sem versão |
| 2026-11-13 | T-203 | 3e2182a | `lib/content` (read, validate, queries, index); lint proíbe `fs`/`yaml` fora dele |
| 2026-11-13 | T-204 | 3c040d5 | 12 fixtures, um por regra; passo no CI |
| 2026-11-13 | T-205 | bb0e3d6 | Enum de categorias/tags para autocomplete; `.vscode/settings.json`; `pnpm schema:check` no CI |
| 2026-11-13 | T-301 | 2216449 | Tema light proposto (D-07): title-muted #6B7280, text-muted #5F6673, primário Ink; `pnpm contrast:check` no CI |
| 2026-11-13 | T-302 | 38d8a1d | `@theme inline reference` sobre os tokens; paleta, raios e sombras padrão desligados |
| 2026-11-13 | T-303 | d7c51dd | Geist via `next/font/local` (pacote `geist`), só 400/500/600 + mono 400/500 |
| 2026-11-13 | T-304 | dcead8e | Set gratuito do transitions.dev; skill fora do Git (licença); `styles/motion.css` |
| 2026-11-13 | T-306 | c4426da | 19 ícones sobre IconBase, `data-motion` por ícone; feito antes do T-305 (este precisa dos ícones) |
| 2026-11-13 | T-305 | 4eb249b | Reescritos sobre `radix-ui`; sem `motion`/`lucide-react`; recipes com @keyframes para o Radix |
| 2026-11-13 | T-307 | c10d2a0 | Tokens novos: list, row-hover, brand-tint, link-hover, text-card |
| 2026-11-13 | T-308 | 7e3d235 | `app/%5Fdesign/page.dev.tsx` + `pageExtensions` só em dev; e2e contra `next dev` |
| 2026-11-13 | T-401 | a5eae84 | next-intl 4; só o namespace `locale` vai para o browser; `/_design` passou para `/[locale]/_design` |
| 2026-11-13 | T-402 | 4c183dd | `proxy.ts` (Next 16) com matcher só em `/`; 307 + `Vary` |
| 2026-11-13 | T-403 | 3632880 | Cabeçalho por página (prop `current`) para `aria-current` sem JS; menu mobile em `<details>` |
| 2026-11-13 | T-404 | 584236a | `<a>` simples; o teste exato em `/pt/c/icons` fica para a T-504 |
| 2026-11-13 | T-406 | 9b4935a | pt-BR feito; inglês bloqueado pela D-09 (o Next só gera uma 404 estática) |
| 2026-11-13 | T-407 | e42d3ff | Fixture com chave em falta; e2e entra no CI |
| 2026-11-13 | T-405 | — | Saltada: depende da decisão D-03 (seletor de tema como 4.ª ilha) |
| 2026-11-13 | M4 | — | Notas do reviewer: skip link na 404, query mantida em `/`, `next/link` no servidor (sem provider do next-intl no browser), D-10 (orçamento de JS) |
| 2026-11-13 | T-406 | 27b06f1 | 404 bilingue (D-09) |
| 2026-11-13 | T-501 | 0365c65 | hero-13 tirado do registry (o CLI falhou com ERR_PNPM_IGNORED_BUILDS); sem motion/lucide; avatares fora até haver dados |
| 2026-11-13 | T-502 | c8d9b06 | Joias = recursos com `why`; Coleções escondida sem `active`; YAML de exemplo real |
| 2026-11-13 | T-503 | b4b7c27 | "Recentes em …" em vez de "Em destaque" (sem dados de destaque) |
| 2026-11-13 | T-504 | 4651eb2 | FilterBar com estado na URL; fallback sem JS = lista completa |
| 2026-11-13 | T-505 | 7cbb341 | Sem screenshot/curador/páginas de tag (sem dados) |
| 2026-11-13 | T-506 | 3f9f8f2 | Copiar link como ilha mínima (D-11) |
| 2026-11-13 | T-507 | 8ecbe62 | Semanas a começar na segunda (UTC) |
| 2026-11-13 | T-508 | 606fec0 | Card + sorteio no browser (D-01) |
| 2026-11-13 | T-509 | e60871f | MDX; texto rascunho; licença CC BY 4.0 (D-02); `pnpm-workspace.yaml` com allowBuilds |
| 2026-11-13 | T-510 | 5ce3256 | Sem número de contribuidores (não existe nos dados) |
| 2026-11-13 | T-601 | ff41af4 | Índice em `.next/static/pagefind` (servido em /_next/static/pagefind/); 50 páginas, pt-br e en. Revisão: título e descrição explícitos nas categorias |
| 2026-11-13 | T-602 | 0736ad7 | Lançador leve + diálogo carregado on demand; clique capturado em `[data-search-trigger]`. Revisão: reutiliza o Dialog Watermelon e mostra metadados de categoria legíveis |
| 2026-11-13 | T-603 | 2e636c0 | Revisão: busca sem JS não aplica `q`; pendente da decisão D-13 |
| 2026-11-13 | T-701 | eaa62c3 | Metadados localizados nas rotas pt/en, canonical e hreflang; origem provisória `https://frontdex.dev` |
| 2026-11-13 | T-702 | 6eda44d | Sitemap estático pt/en e robots.txt apontando para ele |
| 2026-11-13 | T-703 | c937c9e | Feeds RSS 2.0 estáticos pt/en; ambos válidos no W3C Feed Validator (aviso esperado na entrada direta) |
| 2026-11-13 | T-704 | 8a65b8a | Imagens OG estáticas de home, categoria e recurso em 1200×630, renderizadas com tokens e Geist |
| 2026-11-13 | T-705 | — | Umami só em produção na Vercel; eventos `search_open`, `resource_outbound`, `random` e `add_click`; 104 e2e passaram |

## Passagem de sessão (2026-11-13)

Estado: M1–M6 feitos, revistos e publicados; M7 concluído na branch `m7-seo`. T-701–T-705 concluídas com `https://frontdex.dev` provisório (D-14). T-603 continua pendente da D-13. `UMAMI_WEBSITE_ID` precisa ser configurada no ambiente Production da Vercel quando a conta estiver ligada (T-006).

- Branches empilhadas no GitHub: `m1-fundacao` → `m2-conteudo` → `m3-design-system` → `m4-esqueleto` → `m5-paginas` → `m6-busca` → `m7-seo`.
- **PRs ainda não abertos**: o token do `gh` não tem *Pull requests: write*. O Matheus decidiu abrir no fim.
- Commits e PRs **sem** assinatura do Claude (`Co-Authored-By` / "Generated with").
- v1 só em **dark**; tema claro (T-405, D-03, D-07) depois do lançamento.
- Decisões ainda abertas: D-04 (plano Vercel), D-06 (licença do fundo do hero), D-11 (ilhas extra: Copiar link e Surpresa), D-12 (hero-13 tirado do JSON do registry), D-13 (busca sem JS). Ver tabela no fim do `TASKS.md`.
- Textos para o Matheus rever antes do merge: `content/pages/add.*.mdx`, `content/pages/about.*.mdx`, `messages/*.json › add.intro`, `about.p3d`, `about.analyticsValue`, `about.curationValue`.
- Verificação completa: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm validate && pnpm check:i18n && pnpm contrast:check && pnpm test:e2e` (portas 3100/3101 livres; o Playwright reutiliza servidores antigos se estiverem a correr).
- M7: build, lint, typecheck, 206 testes, validate, i18n, contraste e 104 e2e passaram; e2e executados numa worktree temporária para preservar o `next dev` ativo em `localhost:3000`.
- Notas técnicas: TypeScript fixado em 6.x (typescript-eslint); `pnpm-workspace.yaml` com `allowBuilds`; skill do transitions.dev fora do Git (`npx skills add Jakubantalik/transitions.dev --agent claude-code -y`); `/[locale]/_design` só em `next dev`.
