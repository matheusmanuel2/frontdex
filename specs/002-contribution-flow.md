# 002 — Fluxo de contribuição e moderação

Status: aprovada · Depende de: 001 · Agente: Data & CI

## Contexto

Duas entradas, um destino: um PR com um ficheiro YAML. O CI rejeita o que é mecânico; o Matheus decide o que exige gosto.

```
Quem usa Git ──────────────► PR com o YAML ─┐
Quem não usa Git ─► Issue Form ─► bot abre PR ┤
                                              ▼
                                  CI passa? ── não ─► bot comenta os erros ─► contribuidor corrige
                                      │ sim
                                      ▼
                         Review do Matheus (preview Vercel + checklist)
                                      │ aprovado
                                      ▼
                         Merge em main ─► bot atribui o ID ─► site publica
```

## Peças

| Peça | Ficheiro | Função |
| --- | --- | --- |
| Issue Form | `.github/ISSUE_TEMPLATE/add-resource.yml` | Formulário "Adicionar recurso" |
| Bot issue → PR | `.github/workflows/issue-to-pr.yml` + `scripts/issue-to-yaml.ts` | Converte o issue em YAML e abre o PR |
| CI | `.github/workflows/ci.yml` | Schema, links, palavras proibidas, i18n, build, testes |
| IDs | `.github/workflows/assign-ids.yml` + `scripts/assign-ids.ts` | Depois do merge, atribui o próximo ID e faz commit |
| Link check | `.github/workflows/link-check.yml` | Semanal; abre um issue por link partido |
| Moderação | `CODEOWNERS`, branch protection, `PULL_REQUEST_TEMPLATE.md` | Nada entra em `main` sem aprovação |

Labels: `new-resource`, `needs-translation`, `needs-changes`, `broken-link`.

## Critérios de aceitação

- [ ] Um issue do formulário gera um PR com o YAML correto em menos de 2 minutos.
- [ ] Se faltar a descrição PT, o PR recebe `needs-translation` em vez de falhar.
- [ ] O CI comenta no PR uma lista legível de erros (ficheiro, campo, motivo).
- [ ] O CI verifica que a URL responde 2xx/3xx e usa https.
- [ ] Depois do merge, o recurso recebe o próximo ID livre sem conflitos, mesmo com dois merges seguidos.
- [ ] O link check semanal abre um issue por link partido; 14 dias sem correção → `status: archived` por PR automático.
- [ ] `main` está protegida: aprovação do CODEOWNER e CI verde obrigatórios.
- [ ] `CONTRIBUTING.md` existe em pt-BR e en.
