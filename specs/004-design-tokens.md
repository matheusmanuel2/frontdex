# 004 — Design tokens e componentes base

Status: aprovada · Depende de: 000 · Agente: Design System

## Contexto

Todos os valores visuais saem de `styles/tokens.css` (rascunho já no repositório). O Tailwind v4 lê estes tokens; classes de cor do Tailwind fora dos tokens são proibidas.

## Tokens

**Cor (tema dark, padrão)**

| Token | Valor | Uso |
| --- | --- | --- |
| `--color-ink` | #0A0B0D | Fundo da página |
| `--color-ink-hero` | #0D0D0F | Fundo do hero |
| `--color-carbon` | #111318 | Superfícies (cards, painéis) |
| `--color-graphite` | #1B1F27 | Superfícies elevadas, chips |
| `--color-paper` | #F7F8FA | Texto principal no dark; fundo no light |
| `--color-text-secondary` | #A3AAB6 | Texto secundário |
| `--color-text-muted` | #8B93A1 | Labels, metadados |
| `--color-title-muted` | #6B7280 | Segunda linha dos títulos em dois tons |
| `--color-index-blue` | #1463FF | Marca, CTA, foco |
| `--color-index-blue-light` | #5B97FF | Links e foco sobre fundo escuro |
| `--color-signal-orange` | #FB7A2E | Ponto de status no hero |

**Tipografia:** Geist (texto e UI) + Geist Mono (IDs, metadados, atalhos). Títulos em peso **400**, espaçamento −0,02em, entrelinha 1,05. Navegação e botões em 500/600.

| Token | Tamanho | Uso |
| --- | --- | --- |
| `--text-display` | 64–80px | Título do hero |
| `--text-h1` | 56px | Título de página |
| `--text-h2` | 44px | Títulos de secção |
| `--text-body` | 15–16px | Corpo |
| `--text-small` | 13–14px | Navegação, botões |
| `--text-mono` | 11–12px | IDs, labels |

**Raio:** `--radius-pill` 999px (botões, chips, busca, filtros) · `--radius-card` 24px · `--radius-panel` 16px (listas) · `--radius-sm` 12px (inputs).

**Espaço:** múltiplos de 4px.

**Movimento:** tokens da escala do transitions.dev (instalados pela skill). Nunca durações soltas.

## Componentes

- **Da Watermelon UI** (via MCP + CLI, re-tematizados): Button, Input, Select, Dialog, DropdownMenu, Tabs/Segmented, Tooltip, blocos de landing (hero-13).
- **Próprios:** IndexId, ResourceRow, CategoryHeader, TagChip, FilterBar, CommandMenu, LocaleSwitch, Footer.
- **Botões:** primário = pílula branca (#FBFBFB, texto Ink, 600); secundário = pílula escura (#202021, borda 10% branco) com ícone em círculo; CTA de marca = pílula Index Blue.
- **Ícones:** set próprio animado sobre `IconBase` (grelha 24, traço 1,5, `currentColor`), animam no hover/foco com recipes do transitions.dev, estáticos com `prefers-reduced-motion`.

## Critérios de aceitação

- [ ] `styles/tokens.css` define todos os tokens acima, com variante light em `[data-theme="light"]`.
- [ ] Nenhum componente usa cor, raio, fonte ou duração fora dos tokens (lint/grep no CI).
- [ ] Contraste AA verificado para todas as combinações texto/fundo usadas.
- [ ] Página `/[locale]/_design` (só em dev) mostra todos os componentes base nos dois temas.
