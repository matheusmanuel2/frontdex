# 011 — Agente caçador de recursos (scout)

Status: aprovada (Matheus, 2026-11-17) · Depende de: 000, 001, 002 · Alterada por: ADR 0014

## Contexto

Achar recursos bons é a parte mais lenta da curadoria. Queremos um agente que vasculhe a web e traga **candidatos** para o Matheus avaliar. A constitution continua a valer: agentes não escrevem descrições nem adicionam recursos ao índice.

## O que o agente faz

1. Recebe um foco opcional (categoria de `data/categories.yaml`, tag ou tema livre). Sem foco, varre as categorias com menos recursos.
2. Procura em:
   - pesquisa web geral (WebSearch);
   - agregadores de links front-end e newsletters (ex.: listas "awesome" no GitHub, Product Hunt, Hacker News, newsletters semanais de front-end);
   - dev.to, Medium, Reddit (r/webdev, r/Frontend, r/web_design), CSS-Tricks, Smashing;
   - X (x.com): posts indexados pela pesquisa web; quando corre localmente, pode abrir o X no navegador do Matheus (Brave, via extensão Claude in Chrome) para ler threads.
3. Para cada candidato, abre a URL (WebFetch) e confirma que existe e responde.
4. Descarta o que já está em `data/resources/` (compara domínio + caminho normalizados e nome).
5. Escreve a fila em `scouting/YYYY-MM-DD-<foco>.md`.

## Fontes de UI (galerias e redes)

Além das fontes acima, o scout procura em galerias e redes de design: Pinterest, Behance, Dribbble, Awwwards, Mobbin, Land-book, Godly, Lapa Ninja, One Page Love, Refero, Savee, Cosmos, Httpster, Minimal Gallery, SiteInspire. Servem de **fonte** (onde se descobrem estúdios, portfólios, fontes, ferramentas) e, se ainda não estiverem no índice, de **candidato**.

## Escala (meta: ~1.000 recursos)

1. **Recolha:** `scripts/scout/harvest.ts` lê listas "awesome" e outras listas curadas, extrai links, normaliza, remove duplicados do índice e da fila e grava `scouting/candidates.json`.
2. **Sinais:** para repositórios GitHub, grava estrelas, último push e `archived`. Repositórios arquivados ou sem push há mais de 2 anos ficam com alerta e vão para o fim.
3. **Triagem:** o Matheus marca cada candidato como `in`, `out` ou `maybe` (campo `decision` no JSON).
4. **Rascunho (ADR 0014):** para cada `in`, o agente abre a página e cria `data/resources/<slug>.yaml` com `status: draft` e descrição pt/en baseada só no que leu.
5. **Aprovação:** o Matheus edita e muda para `active`. O agente nunca o faz.

## O que o agente NÃO faz

- Não cria ficheiros em `data/` sem `decision: in` do Matheus, e só com `status: draft`.
- Não muda `status` para `active`.
- Não preenche preço, licença nem `open_source` sem os ver na página ou no repositório.
- Não inventa URLs: só entra na fila o que foi aberto com sucesso.
- Não faz login, não publica nem interage (likes, follows, comentários) em nenhum site.

## Formato da fila

Uma tabela por ficheiro:

| Campo | Regra |
| --- | --- |
| nome | como aparece no site |
| url | URL canónica aberta com sucesso |
| encontrado em | URL da página/post onde apareceu (prova) |
| categoria sugerida | slug de `data/categories.yaml` ou `?` |
| sinais | factos verificáveis: estrelas no GitHub, data do último commit, quem recomendou |
| alerta | paywall, sem atualização há 2+ anos, duplicado parcial, etc. |

No fim, uma linha com o que foi pesquisado (termos e sites) para a próxima ronda não repetir.

## Fluxo depois do agente

O Matheus lê a fila, escolhe e escreve os recursos pelo fluxo da spec 002. Ficheiros de `scouting/` podem ser apagados depois de revistos.

## Pronto quando

- `.claude/agents/scout.md` existe e segue esta spec.
- Uma ronda de teste gera um ficheiro em `scouting/` sem duplicados do índice e sem nenhum texto de descrição.
