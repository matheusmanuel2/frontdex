# Design

Canvas original (Claude Design, privado): https://claude.ai/artifact/Xrk2jPcevXc12prkwt8bnn

## Mockups (`mockups/`)

Fonte HTML das artboards do canvas. Textos entre colchetes (`[N]`, `[nota do curador]`, `[linha do recurso]`) são marcadores: vêm dos dados, nunca são inventados. São referência visual para os agentes, não código de produção (usam o runtime do canvas, `support.js`, que não existe aqui). Para ver renderizado, abre o canvas.

| Ficheiro | Página | Estado |
| --- | --- | --- |
| `HeroV2.dc.html` | Hero da home (cópia do hero-13 da Watermelon) | **Aprovado** — usar este |
| `Main.dc.html` | Home completa (hero v1 com busca grande + secções) | Secções aprovadas; o hero v1 foi substituído pelo v2 |
| `Category.dc.html` | `/pt/c/icons` | Aprovado como direção |
| `Resource.dc.html` | `/pt/r/lucide` | Aprovado como direção |
| `Area.dc.html` | `/pt/build` (modelo das 4 áreas) | Proposta |
| `Collections.dc.html` | `/pt/collections` | Proposta |
| `Collection.dc.html` | `/pt/collections/inspiracao-mobile` | Proposta |
| `New.dc.html` | `/pt/new` (por semana + RSS) | Proposta |
| `Random.dc.html` | `/pt/random` | Proposta — mostra um card antes de abrir; a spec 003 diz "redireciona". Decidir |
| `Search.dc.html` | `/pt/search?q=animação` (fallback sem JS) | Proposta |
| `CommandK.dc.html` | Menu ⌘K aberto | Proposta |
| `Add.dc.html` | `/pt/add` | Proposta |
| `About.dc.html` | `/pt/about` | Proposta |
| `NotFound.dc.html` | 404 | Proposta |
| `Empty.dc.html` | Categoria sem resultados para os filtros | Proposta |

Valores medidos do hero-13 (em px CSS): margem lateral 56; badge 28 de altura a y=92; título 64/67 peso 400; divisória a y=319 (330 de largura, fade); parágrafo 14/21,7 #949494 a y=346; botões 40 de altura a y=453, espaço 23; rodapé a y=607.

## Imagens (`images/`)

| Ficheiro | O quê |
| --- | --- |
| `hero-bg-4k-master.png` | Fundo do hero-13 sem textos, 3840×1598 (master) |
| `ref-watermelon-hero-13.png` | Screenshot de referência do hero-13 original |

A versão para o site está em `public/hero/hero-bg.webp` (166 KB).
