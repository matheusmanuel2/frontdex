# Progresso

Branch atual: m3-design-system

| Data | Task | Commit | Notas |
| --- | --- | --- | --- |
| 2026-11-13 | T-001 | 4884b66 | Specs 000–008 aprovadas; kit commitado em `main` |
| 2026-11-13 | T-101 | 2b92f08 | Next 16.4.6, React 19.3 |
| 2026-11-13 | T-102 | 85f9d18 | TypeScript fixado em 6.x (typescript-eslint não suporta TS 7) |
| 2026-11-13 | T-103 | 5787683 | Vitest 5, Playwright 1.65 + axe |
| 2026-11-13 | T-104 | 040d0a9 | CI em PR e `main`; verde por confirmar (o token do gh não consegue abrir PRs) |
| 2026-11-13 | T-201 | 7c3b071 | Zod 4; mensagens de erro em pt |
| 2026-11-13 | T-202 | 6b89c56 | Seed já passava: nenhum YAML alterado. Aviso: `cmux` com licença `GPL` sem versão |
| 2026-11-13 | T-203 | 3e2182a | `lib/content` (read, validate, queries, index); lint proíbe `fs`/`yaml` fora dele |
| 2026-11-13 | T-204 | 3c040d5 | 12 fixtures, um por regra; passo no CI |
| 2026-11-13 | T-205 | bb0e3d6 | Enum de categorias/tags para autocomplete; `.vscode/settings.json`; `pnpm schema:check` no CI |
| 2026-11-13 | T-301 | 2216449 | Tema light proposto (D-07): title-muted #6B7280, text-muted #5F6673, primário Ink; `pnpm contrast:check` no CI |
| 2026-11-13 | T-302 | 38d8a1d | `@theme inline reference` sobre os tokens; paleta, raios e sombras padrão desligados |
| 2026-11-13 | T-303 | d7c51dd | Geist via `next/font/local` (pacote `geist`), só 400/500/600 + mono 400/500 |
| 2026-11-13 | T-304 | dcead8e | Set gratuito do transitions.dev; skill fora do Git (licença); `styles/motion.css` |
| 2026-11-13 | T-306 | c4426da | 19 ícones sobre IconBase, `data-motion` por ícone; feito antes do T-305 (este precisa dos ícones) |
| 2026-11-13 | T-305 | 4eb249b | Reescritos sobre `radix-ui`; sem `motion`/`lucide-react`; recipes com @keyframes para o Radix |
| 2026-11-13 | T-307 | c10d2a0 | Tokens novos: list, row-hover, brand-tint, link-hover, text-card |
| 2026-11-13 | T-308 | 7e3d235 | `app/%5Fdesign/page.dev.tsx` + `pageExtensions` só em dev; e2e contra `next dev` |
