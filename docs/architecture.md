# FrontDex — Arquitetura

Versão: 2026-11-12 · Documento vivo original: [Claude Doc "FrontDex — Arquitetura do projeto"](https://claude.ai/artifact/KvAnc1npXEiN4KpigzV3Gt)

A FrontDex é um site Next.js gerado de forma estática a partir de ficheiros YAML no repositório. Não tem base de dados nem servidor de aplicação no MVP. Contribuir é abrir um PR (ou preencher um formulário que abre o PR); o merge publica o site.

## Visão de sistema

```
┌─ Repositório GitHub ─┐   merge   ┌─ Build (Vercel) ──────────┐  deploy  ┌─ Site (CDN) ─────────┐
│ data/*.yaml          │ ────────► │ 1. Loader (YAML + Zod)    │ ───────► │ HTML /pt/… e /en/…   │ ──► Visitante
│ app/ + components/   │           │ 2. Next.js SSG (pt + en)  │          │ Busca no browser     │
│ messages/            │           │ 3. Pagefind (por idioma)  │          │ sitemap, feed, OG    │
└──────────▲───────────┘           └───────────────────────────┘          └──────────────────────┘
           │
   GitHub Actions: CI em cada PR · IDs após merge · link check semanal
```

## Decisões fechadas

| Tema | Decisão | Detalhe |
| --- | --- | --- |
| Framework | Next.js App Router, SSG, TypeScript strict | `decisions/0001` |
| Pacotes | pnpm | |
| Conteúdo | YAML + Zod em `lib/content` | spec 001 |
| Idiomas | pt-BR padrão (`/pt`) + inglês (`/en`), next-intl | spec 007 |
| Contribuição | Um YAML por recurso + Issue Form → bot → PR | spec 002 |
| Moderação | Só o Matheus faz merge (CODEOWNERS) | spec 002 |
| Estilos | Tailwind CSS v4 sobre `styles/tokens.css` | spec 004 |
| Componentes | Watermelon UI (registry shadcn, MIT), re-tematizado; MCP oficial | `decisions/0004` |
| Ícones | Set próprio animado (modelo Resend) | spec 004 |
| Movimento | Skill do transitions.dev | spec 004 |
| Fontes | Geist + Geist Mono, títulos em peso 400 | `decisions/0005` |
| Hero | Bloco hero-13 da Watermelon + fundo próprio | spec 003 |
| Busca | Pagefind + ⌘K | spec 008 |
| Hosting | Vercel (preview por PR); portável para Cloudflare Pages | `decisions/0006` |
| Analytics | Umami Cloud | `decisions/0007` |
| Testes | Vitest, Playwright + axe, Lighthouse CI | constitution |

## Código em 3 camadas

```
data/*.yaml  →  lib/content  →  app/ + components/
(conteúdo)      (schema, loader,   (renderiza; não sabe
                 consultas puras)   que existe YAML)
```

- `lib/content` é o único sítio que lê ficheiros. Se um dia os dados forem para uma base (fase 3), só esta pasta muda.
- Páginas = Server Components. Ilhas client-side: busca/⌘K, filtros, seletor de idioma.
- Estado na URL. Sem bibliotecas de estado.

## Estrutura do repositório

```
frontdex/
├─ app/[locale]/          # rotas (spec 003)
├─ components/            # ui/ (Watermelon re-tematizado) + componentes próprios
├─ lib/content/           # schema, loader
├─ lib/i18n/
├─ messages/              # pt.json, en.json
├─ styles/tokens.css
├─ public/hero/hero-bg.webp
├─ data/                  # resources/, collections/, areas, categories, tags
├─ scripts/               # validate, assign-ids, check-links, issue-to-yaml, check-anti-ai
├─ specs/ · decisions/ · docs/
├─ .github/               # ISSUE_TEMPLATE, PR template, CODEOWNERS, workflows
├─ .claude/agents/        # 5 agentes
├─ .mcp.json              # MCP da Watermelon UI
└─ CLAUDE.md
```

## Time de agentes

| Agente | Faz | Nunca faz |
| --- | --- | --- |
| spec-writer | Specs, plans, tasks, ADRs | Código |
| design-system | Tokens, componentes, ícones, movimento | Páginas |
| frontend-builder | Páginas, rotas, i18n, busca | Tokens, schema, workflows |
| data-ci | Schema, loader, scripts, Actions, deploy | Inventar recursos |
| reviewer | Revê PRs contra spec + regras | Rever o próprio trabalho, editar código |

## Roadmap

1. **Fase 0 — Fundação:** specs aprovadas, repo, CI, tokens, agentes. *Gate: specs aprovadas.*
2. **Fase 1 — MVP:** 100–150 recursos, páginas, busca, contribuição aberta. *Gate: nome livre + Lighthouse ≥ 95 → lançamento público.*
3. **Fase 2 — Comunidade:** coleções curadas, curadores por área.
4. **Fase 3 — Backend:** vagas, contas, votos, newsletter.

## Em aberto

- [ ] Clearance do nome FrontDex, domínio e organização no GitHub.
- [ ] Licenças: MIT (código) + CC BY 4.0 (dados) — proposto em `decisions/0008`.
- [ ] Plano Vercel (Hobby é só não comercial).
- [ ] Plano Pro do transitions.dev ou set gratuito.
- [ ] Confirmar na página de copyright da Watermelon que o fundo do hero está coberto pela MIT.
