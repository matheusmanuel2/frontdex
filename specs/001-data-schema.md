# 001 — Modelo de dados

Status: aprovada · Depende de: 000 · Agente: Data & CI

## Contexto

O conteúdo do índice vive em YAML no repositório. Um schema Zod único (`lib/content/schema.ts`) é usado pelo site, pelo CI e pelo bot do Issue Form, e gera um JSON Schema para autocomplete no editor.

## Recurso — `data/resources/<slug>.yaml`

O nome do ficheiro é o slug e a URL (`calligraph.yaml` → `/pt/r/calligraph`).

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `id` | inteiro | só após merge | Atribuído pelo bot `assign-ids`; contribuidores não preenchem |
| `name` | string | sim | Nome oficial do recurso |
| `url` | URL https | sim | Única em todo o repositório |
| `repo` | URL | não | Repositório público, se existir |
| `author` | string | não | Pessoa ou organização |
| `area` | enum | sim | `discover` · `learn` · `build` · `grow` |
| `category` | slug | sim | Tem de existir em `data/categories.yaml` e pertencer à `area` |
| `tags` | slug[] | sim (1–6) | Cada uma tem de existir em `data/tags.yaml` |
| `pricing` | enum | sim* | `free` · `freemium` · `paid` |
| `open_source` | boolean | sim* | Código público com licença open source |
| `license` | string | não | SPDX (`MIT`, `GPL-3.0`, `MPL-2.0`…) |
| `level` | enum[] | não | `beginner` · `intermediate` · `expert` |
| `description.pt` / `description.en` | string | sim* | 40–160 caracteres cada |
| `why.pt` / `why.en` | string | não | A frase de curadoria, ≤ 160 caracteres |
| `alternatives` | slug[] | não | Slugs de outros recursos existentes |
| `added` | data | sim | ISO `YYYY-MM-DD` |
| `last_checked` | data | sim | Atualizada pelo link checker |
| `status` | enum | sim | `active` · `draft` · `archived` |
| `notes` | string | não | Notas internas de curadoria, nunca exibidas |

\* Em `status: draft` estes campos podem ficar com o valor `TODO`. O site **só publica `active`**, e o CI falha se um recurso `active` tiver `TODO`.

## Ficheiros de apoio

- `data/areas.yaml` — as 4 áreas com nome e descrição em pt/en.
- `data/categories.yaml` — categorias com `area`, nome e descrição em pt/en.
- `data/tags.yaml` — lista fechada de tags.
- `data/collections/<slug>.yaml` — título, texto do curador (pt/en) e lista ordenada de slugs.

## Critérios de aceitação

- [ ] `pnpm validate` valida todos os YAML e devolve erros legíveis (ficheiro, campo, motivo).
- [ ] URLs duplicadas, categorias inexistentes, tags fora da lista e `alternatives` quebradas falham.
- [ ] Descrições fora de 40–160 caracteres falham.
- [ ] Recursos `active` com `TODO` falham; recursos `draft` passam mas não são publicados.
- [ ] O JSON Schema é gerado em `data/schema.json` e referenciado no topo de cada YAML.
- [ ] O loader expõe funções puras: `getResource(slug)`, `listResources({area, category, tag, status})`, `getCategory(slug)`, `listCollections()`, `getAlternatives(slug)`.
- [ ] Testes Vitest cobrem o schema e o loader.

## Em aberto

- Licença dos dados: proposta CC BY 4.0 (ver `decisions/0008-licencas.md`).
