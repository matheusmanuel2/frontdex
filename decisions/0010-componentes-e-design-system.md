# 0010 — Como o design system aplica a Watermelon, as fontes e o /_design

Data: 2026-11-13 · Estado: proposta (para o Matheus aceitar) · Complementa: 0004, 0005

## 1. Componentes Watermelon reescritos sobre `radix-ui`

**Contexto:** os componentes do registry da Watermelon (Button, Input, Dialog, DropdownMenu, Tooltip, Tabs) instalam-se com `npx shadcn@latest add`, como diz o ADR 0004. Mas trazem `lucide-react` (proibido no CLAUDE.md e na spec 006) e `motion`, com durações escritas em JavaScript (proibidas pela spec 006). O Dropdown e as Tabs têm mais de mil linhas de código de animação.

**Decisão:** instalar pelo CLI e depois reescrever cada ficheiro sobre as primitivas `radix-ui`, mantendo os nomes públicos da Watermelon. Ícones vêm de `components/icons`, movimento dos recipes de `styles/motion.css`, cores/raios/fontes dos tokens. Cada ficheiro mantém o aviso MIT completo ("Copyright (c) 2025-present Watermelon Contributors", igual ao LICENSE de `WatermelonCorp/watermellon-registry`). O ESLint proíbe `motion`, `motion/react` e `framer-motion`.

**Consequência:** atualizar um componente a partir do registry não é automático; é preciso refazer a adaptação.

## 2. Fontes por `next/font/local`

**Decisão:** Geist e Geist Mono carregadas com `next/font/local` a partir dos ficheiros estáticos do pacote `geist` (só 400/500/600 e mono 400/500), em vez do `GeistSans` variável do pacote. Assim só se descarregam os pesos usados e o Tailwind só gera `font-normal`, `font-medium` e `font-semibold`.

## 3. `/[locale]/_design` só em desenvolvimento

**Decisão:** a página vive em `app/%5Fdesign/page.dev.tsx` (passa para `app/[locale]/%5Fdesign/` no M4, com o next-intl) (na App Router, pastas com `_` são privadas; `%5F` é o `_` codificado). O `next.config.ts` só aceita a extensão `dev.tsx` quando `NODE_ENV=development`, por isso a rota não existe no build de produção. Os testes desta página correm contra `next dev` (projeto `dev` do Playwright).

## 4. Recipes do transitions.dev com o Radix

**Decisão:** o Radix só adia a desmontagem à espera de `animation` CSS (não de `transition`). Os recipes 05 (dropdown), 06 (modal) e 17 (tooltip) passam a `@keyframes` com os mesmos valores do recipe, dentro de `styles/motion.css`. A skill fica fora do Git, porque a licença não permite publicar a coleção.
