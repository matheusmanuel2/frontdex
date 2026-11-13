# 0001 — Next.js com geração estática

Data: 2026-11-12 · Estado: aceite

**Contexto:** conteúdo de leitura, milhares de páginas, sem escrita de utilizadores.

**Decisão:** Next.js App Router com SSG (generateStaticParams) em todas as rotas; Server Components por padrão; só o middleware de idioma corre em runtime.

**Alternativas rejeitadas:** Astro (proposto inicialmente; o Matheus preferiu Next.js); Next.js com backend já no MVP (custo e complexidade sem necessidade).
