# FrontDex

**A internet front-end, indexada.** Menos busca. Mais construção.

Índice open-source e curado de recursos front-end: ferramentas, bibliotecas, cursos, inspiração e comunidades. Cada recurso tem uma linha que explica por que vale o seu tempo.

Feito em Angola. Aberto ao mundo.

> Estado: fase 0 (fundação). As specs em `specs/` estão aprovadas. O site está em construção.

## Contribuir

Cada recurso é um ficheiro YAML em `data/resources/`. Duas formas:

1. **Sem Git:** abra um issue com o formulário "Adicionar recurso". Um bot cria o PR por você.
2. **Com Git:** crie `data/resources/<slug>.yaml` seguindo `specs/001-data-schema.md` e abra um PR.

Leia o [CONTRIBUTING.md](CONTRIBUTING.md) antes.

## Desenvolvimento local

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## Preview na Vercel

O índice Pagefind precisa dos HTMLs gerados no Build Output da Vercel. Para criar e publicar um preview:

```sh
pnpm vercel:build
vercel deploy --prebuilt --yes
```

O projeto precisa estar ligado à Vercel CLI. Builds feitos diretamente pelo comando remoto ainda não geram o índice.

Para publicar a build aprovada em produção:

```sh
pnpm vercel:build:prod
vercel deploy --prebuilt --prod --yes
```

## Para quem vai construir

- Comece por [`CLAUDE.md`](CLAUDE.md), [`specs/000-constitution.md`](specs/000-constitution.md) e [`docs/architecture.md`](docs/architecture.md).
- Próximos passos: [`docs/next-steps.md`](docs/next-steps.md).
- A origem canônica é configurada em `SITE_URL`; por enquanto, o valor padrão é `https://frontdex.dev`.
- O Umami só carrega em produção na Vercel; configure `UMAMI_WEBSITE_ID` como variável do ambiente Production.

---

**FrontDex** is an open-source, curated index of front-end resources, each with one line on why it's worth your time. Portuguese (pt-BR) and English. Built in Angola, open to the world.

Código: MIT · Dados: CC BY 4.0
