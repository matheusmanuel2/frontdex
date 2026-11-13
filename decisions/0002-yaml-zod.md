# 0002 — Conteúdo em YAML validado com Zod

Data: 2026-11-12 · Estado: aceite

**Decisão:** um ficheiro YAML por recurso em data/resources; schema Zod único em lib/content, usado pelo site, CI e bot; JSON Schema gerado para o editor.

**Porquê:** contribuições sem conflitos de merge, diffs claros, sem CMS.

**Rejeitado:** README gigante (conflitos); CMS headless (dependência e custo).
