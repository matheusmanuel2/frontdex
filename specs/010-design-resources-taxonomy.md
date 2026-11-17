# 010 — Taxonomia para recursos de design (import "Design Holy Grail")

Status: aprovada (Matheus, 2026-11-17) · Depende de: 000, 001 · Altera: 001

## Contexto

Vamos importar ~130 recursos de design (inspiração, tipografia, assets, carreira). O schema da spec 001 foi pensado para recursos de dev front-end e não cobre parte do que o import pede. Esta spec lista o que falta e propõe a alteração mínima. Nada é importado antes de ser aprovada.

## O que já existe (sem mudança)

| Pedido no import | Campo atual |
| --- | --- |
| direction | `area` (`discover` · `learn` · `build` · `grow`) |
| category | `category` (lista fechada em `data/categories.yaml`) |
| tags de intenção | `tags` (lista fechada em `data/tags.yaml`, 1–6) |
| "Hidden gems" | `featured: true` |
| "Studios to follow" | `data/collections/studios-to-follow.yaml` |

## O que falta

### 1. Pricing `pay-what-you-want`

O enum é `free · freemium · paid`. Atipo Scilla (e várias fontes de foundries independentes) são "pague quanto quiser".

**Decisão:** acrescentar `pay-what-you-want` a `PRICING` (schema, JSON Schema, labels pt/en em `messages/*.json`, filtros).

### 2. Persona

Não há campo de persona (ex.: "My Life in Design → design-engineer").

**Decisão:** não criar campo novo. Usar uma tag `design-engineering`. Um campo `persona` só se justificar quando houver mais de uma persona com filtro próprio no site.

### 3. Categorias novas

| slug | area | pt | en | Itens do import |
| --- | --- | --- | --- | --- |
| `brand-inspiration` | discover | Identidade e tipografia | Brand and type inspiration | Fonts In Use, Brand New, Typehunting… |
| `portfolios` | discover | Portfólios | Portfolios | Cofolios, Bestfolios… |
| `moodboards` | discover | Moodboards | Moodboards | Savee, Cosmos, Muzli |
| `studios` | discover | Estúdios | Studios | ++hellohello, Zajno, fatfish, Pentagram |
| `podcasts` | learn | Podcasts | Podcasts | A Change of Brand, The Typecast… |
| `videos` | learn | Vídeos | Videos | Texturelabs, rahpstudio, Jesse Nyberg |
| `reference` | learn | Referência e docs | Reference and docs | principles.design, Checklist.design, W3C WAI… |
| `challenges` | learn | Desafios | Challenges | Method of Action, Type Method, Shape Method |
| `articles` | learn | Artigos e cases | Articles and case studies | Paul Rand, Saul Bass, Good Brief… |
| `typography-tools` | build | Ferramentas de tipografia | Typography tools | Typescale, Fontjoy, Hyperglot, FontBase |
| `accessibility` | build | Acessibilidade | Accessibility | Accessible Color Matrix, WebAIM |
| `assets` | build | Imagens e ilustrações | Images and illustrations | Unsplash, Humaaans, mockups… |
| `brand-apis` | build | APIs de logos | Logo APIs | Logo.dev, Brandfetch |
| `design-tools` | build | Ferramentas de design | Design tools | Frame0, GoFullPage, Space Type Generator… |
| `freelance` | grow | Freelance e preços | Freelance and pricing | AIGA contrato, salários, Wave |

Já existentes e reutilizadas: `ui-inspiration`, `icons`, `fonts`, `colors`, `communities`, `careers`.

### 4. Tags novas

`career`, `portfolio`, `typography`, `branding`, `accessibility`, `illustration`, `photos`, `mockups`, `textures`, `logos`, `gradients`, `podcast`, `video`, `figma`, `design-systems`, `freelance`, `pricing-guide`, `design-engineering`, `history`, `api`.

### 5. Conflito com a constitution: vagas

A constitution (§7) põe **Vagas (jobs)** fora do âmbito do MVP. Os itens de GROW › Jobs (Welcome to the Jungle, If You Could, The Dots, Malt, Creative Access) não podem entrar como `category: jobs` sem um ADR que altere a constitution.

Opções:
- a) ADR a alterar §7: "Vagas" significa um quadro de vagas próprio; links para quadros externos são permitidos. Cria-se `jobs`.
- b) Entram em `careers` com tag `career`, sem categoria de vagas.
- c) Ficam fora até depois do MVP.

**Decisão (Matheus, 2026-11-17): c).** Vagas não entram ainda; não se cria a categoria `jobs`.

## Fora desta spec (notas do import)

- Duplicados já detetados: **Mobbin** (`mobbin.yaml`, active) e **abtest.design** (`abtest-design.yaml`, draft com TODOs). O import completa o draft do abtest.design em vez de criar outro ficheiro.
- Pentagram é estúdio de design, não agência de publicidade: entra na coleção salvo indicação contrária.
- O schema não tem campo de licença de conteúdo (ex.: GFX Database): fica `status: draft` com `notes`.

## Critérios de aceitação

- [x] Decisões 1, 2 e 5 tomadas pelo Matheus.
- [ ] `categories.yaml` e `tags.yaml` atualizados; `pnpm schema` regenera `data/schema.json`.
- [ ] Labels novas em `messages/pt.json` e `messages/en.json`.
- [ ] `pnpm validate` e `pnpm test` passam.
