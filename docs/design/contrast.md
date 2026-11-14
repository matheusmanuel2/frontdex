# Contraste AA dos tokens

Gerado por `pnpm contrast` a partir de `styles/tokens.css`. Não editar à mão.

Critério: WCAG 2.2 AA. Texto normal precisa de 4,5:1. Texto grande (≥ 24px, ou ≥ 18,66px em 600) e elementos que não são texto (foco, contornos, pontos de estado) precisam de 3:1.

## Tema dark (padrão)

| Texto | Fundo | Razão | Mínimo | Resultado | Uso |
| --- | --- | --- | --- | --- | --- |
| `--color-text-primary` | `--color-ink` | 18.53:1 | 4.5:1 | passa | Texto principal na página |
| `--color-text-primary` | `--color-carbon` | 17.49:1 | 4.5:1 | passa | Texto principal em cards e painéis |
| `--color-text-primary` | `--color-graphite` | 15.54:1 | 4.5:1 | passa | Texto em chips e superfícies elevadas |
| `--color-text-secondary` | `--color-ink` | 8.42:1 | 4.5:1 | passa | Descrições na página |
| `--color-text-secondary` | `--color-carbon` | 7.95:1 | 4.5:1 | passa | Descrições em listas |
| `--color-text-secondary` | `--color-graphite` | 7.06:1 | 4.5:1 | passa | Descrições em superfícies elevadas |
| `--color-text-muted` | `--color-ink` | 6.36:1 | 4.5:1 | passa | Labels e metadados na página |
| `--color-text-muted` | `--color-carbon` | 6.00:1 | 4.5:1 | passa | IDs e metadados em listas |
| `--color-text-muted` | `--color-graphite` | 5.34:1 | 4.5:1 | passa | Metadados em chips |
| `--color-title-muted` | `--color-ink` | 4.07:1 | 3:1 | passa | Segunda linha dos títulos (texto grande ≥ 24px) |
| `--color-link` | `--color-ink` | 6.86:1 | 4.5:1 | passa | Links na página |
| `--color-link` | `--color-carbon` | 6.47:1 | 4.5:1 | passa | Links em cards |
| `--color-focus` | `--color-ink` | 6.86:1 | 3:1 | passa | Anel de foco na página |
| `--color-focus` | `--color-carbon` | 6.47:1 | 3:1 | passa | Anel de foco em cards |
| `--color-button-primary-text` | `--color-button-primary-bg` | 18.76:1 | 4.5:1 | passa | Botão primário |
| `--color-button-secondary-text` | `--color-button-secondary-bg` | 15.32:1 | 4.5:1 | passa | Botão secundário |
| `--color-button-brand-text` | `--color-index-blue` | 4.93:1 | 4.5:1 | passa | Botão de marca (Index Blue) |
| `--color-button-brand-text` | `--color-index-blue-hover` | 6.75:1 | 4.5:1 | passa | Botão de marca em hover |
| `--color-button-primary-bg` | `--color-ink` | 19.03:1 | 3:1 | passa | Contorno do botão primário na página |
| `--color-signal-orange` | `--color-ink-hero` | 7.33:1 | 3:1 | passa | Ponto de status no hero (não-texto) |
| `--color-paper` | `--color-ink-hero` | 18.27:1 | 4.5:1 | passa | Texto do hero (o hero é sempre escuro) |
| `--color-text-primary` | `--color-list` | 18.06:1 | 4.5:1 | passa | Nome do recurso nas listas |
| `--color-text-secondary` | `--color-list` | 8.21:1 | 4.5:1 | passa | Descrição nas listas |
| `--color-text-muted` | `--color-list` | 6.20:1 | 4.5:1 | passa | ID e tags nas listas |
| `--color-text-secondary` | `--color-row-hover` | 7.60:1 | 4.5:1 | passa | Descrição numa linha em hover |
| `--color-text-muted` | `--color-row-hover` | 5.74:1 | 4.5:1 | passa | ID numa linha em hover |
| `--color-link-hover` | `--color-ink` | 9.70:1 | 4.5:1 | passa | Link em hover |
| `--color-brand-tint-text` | `--color-brand-tint` sobre `--color-list` | 8.46:1 | 4.5:1 | passa | Chip de marca (OSS) nas listas |
| `--color-brand-tint-text` | `--color-brand-tint` sobre `--color-carbon` | 8.17:1 | 4.5:1 | passa | Chip de marca (OSS) em cards |

## Tema light (proposta, decisão D-07)

| Texto | Fundo | Razão | Mínimo | Resultado | Uso |
| --- | --- | --- | --- | --- | --- |
| `--color-text-primary` | `--color-ink` | 18.53:1 | 4.5:1 | passa | Texto principal na página |
| `--color-text-primary` | `--color-carbon` | 19.69:1 | 4.5:1 | passa | Texto principal em cards e painéis |
| `--color-text-primary` | `--color-graphite` | 17.25:1 | 4.5:1 | passa | Texto em chips e superfícies elevadas |
| `--color-text-secondary` | `--color-ink` | 7.11:1 | 4.5:1 | passa | Descrições na página |
| `--color-text-secondary` | `--color-carbon` | 7.56:1 | 4.5:1 | passa | Descrições em listas |
| `--color-text-secondary` | `--color-graphite` | 6.62:1 | 4.5:1 | passa | Descrições em superfícies elevadas |
| `--color-text-muted` | `--color-ink` | 5.44:1 | 4.5:1 | passa | Labels e metadados na página |
| `--color-text-muted` | `--color-carbon` | 5.78:1 | 4.5:1 | passa | IDs e metadados em listas |
| `--color-text-muted` | `--color-graphite` | 5.06:1 | 4.5:1 | passa | Metadados em chips |
| `--color-title-muted` | `--color-ink` | 4.55:1 | 3:1 | passa | Segunda linha dos títulos (texto grande ≥ 24px) |
| `--color-link` | `--color-ink` | 4.64:1 | 4.5:1 | passa | Links na página |
| `--color-link` | `--color-carbon` | 4.93:1 | 4.5:1 | passa | Links em cards |
| `--color-focus` | `--color-ink` | 4.64:1 | 3:1 | passa | Anel de foco na página |
| `--color-focus` | `--color-carbon` | 4.93:1 | 3:1 | passa | Anel de foco em cards |
| `--color-button-primary-text` | `--color-button-primary-bg` | 18.53:1 | 4.5:1 | passa | Botão primário |
| `--color-button-secondary-text` | `--color-button-secondary-bg` | 19.69:1 | 4.5:1 | passa | Botão secundário |
| `--color-button-brand-text` | `--color-index-blue` | 4.93:1 | 4.5:1 | passa | Botão de marca (Index Blue) |
| `--color-button-brand-text` | `--color-index-blue-hover` | 6.75:1 | 4.5:1 | passa | Botão de marca em hover |
| `--color-button-primary-bg` | `--color-ink` | 18.53:1 | 3:1 | passa | Contorno do botão primário na página |
| `--color-signal-orange` | `--color-ink-hero` | 7.33:1 | 3:1 | passa | Ponto de status no hero (não-texto) |
| `--color-paper` | `--color-ink-hero` | 18.27:1 | 4.5:1 | passa | Texto do hero (o hero é sempre escuro) |
| `--color-text-primary` | `--color-list` | 19.69:1 | 4.5:1 | passa | Nome do recurso nas listas |
| `--color-text-secondary` | `--color-list` | 7.56:1 | 4.5:1 | passa | Descrição nas listas |
| `--color-text-muted` | `--color-list` | 5.78:1 | 4.5:1 | passa | ID e tags nas listas |
| `--color-text-secondary` | `--color-row-hover` | 6.92:1 | 4.5:1 | passa | Descrição numa linha em hover |
| `--color-text-muted` | `--color-row-hover` | 5.29:1 | 4.5:1 | passa | ID numa linha em hover |
| `--color-link-hover` | `--color-ink` | 6.35:1 | 4.5:1 | passa | Link em hover |
| `--color-brand-tint-text` | `--color-brand-tint` sobre `--color-list` | 5.86:1 | 4.5:1 | passa | Chip de marca (OSS) nas listas |
| `--color-brand-tint-text` | `--color-brand-tint` sobre `--color-carbon` | 5.86:1 | 4.5:1 | passa | Chip de marca (OSS) em cards |

### O que mudou face ao rascunho do kit

- `--color-title-muted`: #8B93A1 → **#6B7280**. O valor do rascunho dava 2,91:1 sobre Paper, abaixo dos 3:1 para texto grande.
- `--color-text-muted`: #666E7C → **#5F6673**. O rascunho ficava exatamente em 4,50:1 sobre Graphite, sem margem.
- Botão primário: no dark é a pílula branca da spec. No light a pílula branca some no fundo Paper, por isso proponho pílula Ink (#0A0B0D) com texto Paper.
- Links e foco no light: Index Blue (#1463FF), como já dizia o rascunho.
