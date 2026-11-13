# 008 — Busca

Status: aprovada · Depende de: 003 · Agente: Front-end Builder

## Regras

- Pagefind indexa o HTML gerado no fim de cada build, com um índice por idioma.
- Indexa só páginas de recurso e de categoria (`data-pagefind-body`). Campos filtráveis: área, categoria, preço, open source.
- **⌘K / Ctrl+K / `/`** abrem o CommandMenu em qualquer página. O botão branco do hero também.
- Resultados mostram ID mono, nome, descrição curta e categoria. Enter abre o recurso; ⌘Enter abre o site do recurso.
- Sem JavaScript, `/[locale]/search?q=` funciona como página normal.
- Atalhos rápidos no menu vazio: "Preciso de ícones", "Quero aprender React", "Bibliotecas de animação", "Cursos gratuitos".

## Critérios de aceitação

- [ ] Resultados em < 100 ms depois do índice carregado (teste Playwright).
- [ ] O índice só carrega quando o menu abre pela primeira vez (não pesa na home).
- [ ] Navegação completa por teclado; foco preso dentro do diálogo; Esc fecha.
- [ ] Busca em pt não devolve páginas en e vice-versa.
