# Movimento

Todo o movimento da FrontDex vem do [transitions.dev](https://transitions.dev) (skill gratuita `transitions-dev`, de Jakub Antalik). Os tokens e os recipes usados vivem em [`styles/motion.css`](../../styles/motion.css). Nenhum outro ficheiro escreve durações, easings ou `@keyframes`, e o teste `lib/design/motion.test.ts` falha se isso acontecer.

## Instalar a skill (para agentes)

```bash
npx skills add Jakubantalik/transitions.dev --agent claude-code -y
```

A skill fica em `.claude/skills/` e **não entra no Git**. A licença permite usar e modificar as transições no nosso site, mas não publicar a coleção. O `skills-lock.json` fixa a versão instalada.

Plano: o set gratuito cobre tudo o que o MVP usa. O plano Pro só seria preciso para as transições Pro (decisão D-05).

## Tokens

| Token | Valor | Uso na FrontDex |
| --- | --- | --- |
| `--duration-stagger` | 40ms | Atraso entre itens de uma lista que entra |
| `--duration-micro` | 80ms | Atraso de abertura do tooltip |
| `--duration-quick` | 150ms | Hover (cor, fundo, borda), fecho de modal e dropdown |
| `--duration-fast` | 250ms | Abertura de modal e dropdown, troca de ícone, tabs, saída dos ícones no hover e retorno da seta "ver mais" |
| `--duration-medium` | 350ms | Retorno da seta "ver mais" (learn more) |
| `--duration-slow` | 400ms | Abertura de painel |
| `--duration-very-slow` | 500ms | Momentos de ênfase (não usado ainda) |
| `--ease-smooth-out` | cubic-bezier(0.22, 1, 0.36, 1) | Superfícies (modal, dropdown, tabs), ícones |
| `--ease-in-out` | ease-in-out | Troca de ícone |
| `--ease-out` | ease-out | Hover, tooltip |

Também existem as escalas de distância (`--distance-*`), escala (`--scale-*`) e blur (`--blur-*`). O blur só se usa dentro de transições (troca de ícone) e nunca como `backdrop-filter` (spec 006).

## Recipes usados

| Classe | Recipe do transitions.dev | Onde |
| --- | --- | --- |
| `.t-hover` | (tokens de hover) | Botões, links, linhas de recurso, chips |
| `.t-dropdown` | 05 · Menu dropdown | DropdownMenu, LocaleSwitch |
| `.t-modal`, `.t-modal-overlay` | 06 · Modal | Dialog, CommandMenu (⌘K) |
| `.t-icon-swap` | 09 · Icon swap | Tema (sol ↔ lua), copiar (copy ↔ check) |
| `.t-tabs-pill`, `.t-tab` | 16 · Tabs sliding | Segmented/Tabs |
| `.t-tt` | 17 · Tooltip | Tooltip (com os estados `data-state` do Radix) |
| `.t-learn`, `.t-learn-chevron` | 24 · Learn more hover | Links "ver tudo" |
| `.t-icon-host` + `.t-icon-anim[data-motion]` | Tokens de hover de ícone | Ícones animados no hover/foco (modelo Resend) |

Ícones: o elemento interativo leva `.t-icon-host`. O ícone escolhe o movimento com `data-motion` (`nudge-right`, `nudge-diagonal`, `nudge-down`, `nudge-up`, `tilt`, `turn`, `spin`, `pop`, `shrink`). Entra em `--duration-quick` e sai em `--duration-fast`, para uma entrada direta e um retorno mais suave, conforme a skill `transitions-polish`. A seta "ver mais" segue a mesma assimetria: entra em 250 ms e retorna em 350 ms.

## Movimento reduzido

Cada recipe tem a guarda `@media (prefers-reduced-motion: reduce)`, que desliga as transições e deixa os ícones estáticos. O teste verifica que nenhuma classe `t-*` fica de fora.
