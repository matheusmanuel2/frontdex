# 006 — Regras anti "cara de AI"

Status: aprovada · Depende de: 004, 005 · Agentes: Design System, Front-end, Reviewer

A FrontDex não pode parecer gerada por IA. Estas regras são verificáveis. As mecânicas correm no CI (`scripts/check-anti-ai.ts`); as de layout são verificadas pelo Reviewer.

## Código — o CI falha

- Gradientes fora do hero da home (`bg-gradient-*`, `linear-gradient`, `radial-gradient` fora de `components/hero/`).
- `backdrop-blur`, sombras coloridas, `drop-shadow` com cor, glow em texto.
- Classes de cor do Tailwind fora dos tokens (`bg-indigo-500`, `text-purple-600`, `from-violet-…`).
- Raio fora da escala de tokens.
- Durações e `@keyframes` escritos à mão (usar tokens/recipes do transitions.dev).
- Imports de `lucide-react`, `@heroicons/react`, `react-icons`, `@tabler/icons-react`.
- Emojis em títulos, botões e navegação.

## Texto — o CI falha (pt e en, sem diferenciar maiúsculas)

unlock, seamless, elevate, empower, supercharge, dive into, unleash, game-changer, cutting-edge, "whether you're a beginner or an expert", desbloquear, potencializar, eleve, mergulhe, revolucionário, de ponta, "seja você iniciante ou especialista".

Também: tríades vazias ("rápido, simples e poderoso") e mais de um travessão por parágrafo.

## Layout — o Reviewer rejeita

- Hero centrado com dois botões e três cards de ícone por baixo.
- Bento grid.
- Cards grandes onde uma lista densa serve.
- Ilustrações 3D genéricas, orbs, blobs, partículas.
- Componentes Watermelon/shadcn usados sem re-tematizar (cor, fonte e raio da FrontDex).

## O que dá identidade

IDs de índice em mono (#0422), listas densas, títulos em dois tons com Geist 400, pílulas, o fundo do hero e transições cuidadas.

## Critérios de aceitação

- [ ] `pnpm check:anti-ai` corre no CI e falha com a lista de violações (ficheiro:linha).
- [ ] O template de PR inclui a checklist de layout para o Reviewer.
