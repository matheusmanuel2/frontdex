# FrontDex — contexto para agentes

FrontDex é um índice open-source e curado de recursos front-end (ferramentas, bibliotecas, cursos, inspiração, comunidades). Cada recurso tem uma linha que explica por que vale o tempo de quem lê. Feito em Angola, aberto ao mundo.

Promessa: **Menos busca. Mais construção.**

## Como trabalhamos (SDD)

1. Nada é implementado sem uma spec aprovada em `specs/`. Ordem: constitution → spec → plan → tasks → PR → review.
2. Lê sempre `specs/000-constitution.md` antes de qualquer tarefa. Em caso de conflito, a constitution vence.
3. Se a spec não responde a uma dúvida, **para e pergunta ao Matheus**. Não decidas sozinho.
4. Um commit por task (`T-XXX: …`) e um PR por marco, ligado às specs que o justificam. Nenhum agente faz merge.
5. Decisões técnicas novas viram um ADR em `decisions/`.

## Mapa do repositório

| Pasta | O que é |
| --- | --- |
| `TASKS.md` | Backlog do MVP por marcos (M0–M9), com agente, spec e "Pronto quando" de cada task |
| `docs/prompt-master.md` | Prompt para construir o projeto inteiro e para retomar sessões |
| `docs/progress.md` | Registo de progresso, uma linha por task |
| `specs/` | Specs numeradas (fonte de verdade do que construir) |
| `decisions/` | ADRs (porquê de cada escolha) |
| `docs/architecture.md` | Visão geral da arquitetura |
| `docs/brand/` | Brand book (v0.11 é a versão em vigor) |
| `docs/design/` | Mockups aprovados (HTML) e imagens de referência |
| `data/` | Conteúdo do índice em YAML (um ficheiro por recurso) |
| `styles/tokens.css` | Tokens de design (cor, tipo, raio, espaço, movimento) |
| `public/hero/` | Imagem de fundo do hero |
| `.claude/agents/` | Os 5 agentes de construção |

## Stack (resumo — detalhe em `docs/architecture.md`)

Next.js (App Router, SSG) · TypeScript strict · pnpm · Tailwind CSS v4 sobre `styles/tokens.css` · next-intl (`/pt` padrão, `/en`) · YAML + Zod em `lib/content` · Pagefind · Watermelon UI (registry shadcn) · Geist + Geist Mono · Vercel · Umami Cloud · Vitest + Playwright + axe · Lighthouse CI.

## Ferramentas instaladas

- **MCP da Watermelon UI** (em `.mcp.json`): procura componentes e blocos e devolve o comando de instalação. Usa-o antes de criar qualquer componente de UI.
- **CLI do shadcn**: `npx shadcn@latest add <url do registry>`. Exemplo do hero escolhido: `npx shadcn@latest add https://registry.watermelon.sh/r/hero-13.json`.
- **Skill do transitions.dev**: `npx skills add Jakubantalik/transitions.dev` (+ `-s transitions-polish`). Toda a transição vem de um recipe.

## Regras que não se negociam

- Nada de "cara de AI": ver `specs/006-anti-ai-guidelines.md`. O CI bloqueia as violações mecânicas.
- Agentes **nunca** escrevem descrições de recursos nem inventam URLs, preços ou licenças. Recursos vêm do Matheus ou de contribuidores.
- Português do site = pt-BR. Todo o texto de UI existe em `messages/pt.json` e `messages/en.json`.
- Cores, raios, fontes e durações só através dos tokens. Nada de valores soltos.
- Sem bibliotecas de ícones genéricas (`lucide-react`, `@heroicons/react`, `react-icons`, `@tabler/icons-react`).
- Componentes vindos da Watermelon mantêm o aviso de licença MIT no topo do ficheiro.
