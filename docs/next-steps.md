# Próximos passos (para continuar no Claude Code)

## 1. Colocar o kit no repositório

```bash
git clone https://github.com/matheusmanuel2/frontdex
cd frontdex
# copie o conteúdo do zip para aqui (substitui o README.md inicial)
git add -A && git commit -m "chore: fase 0 — specs, agentes, dados iniciais e design"
git push
```

## 2. Abrir no Claude Code

```bash
claude
```

O Claude Code lê o `CLAUDE.md`, os agentes em `.claude/agents/` e o MCP da Watermelon em `.mcp.json` (aceite o servidor quando perguntar). Confirme com `/mcp` e `/agents`.

Instale a skill de transições:

```bash
npx skills add Jakubantalik/transitions.dev
npx skills add Jakubantalik/transitions.dev -s transitions-polish
```

## 3. Aprovar as specs (tu)

Lê e aprova, por ordem: `000` → `001` → `004` → `006` → `002` → `003` → `005` → `007` → `008`. Muda o "Status" para `aprovada`.

## 4. Construir o projeto

O backlog completo está em `TASKS.md` (marcos M0 a M9). Para o Claude Code construir tudo, cola o prompt de `docs/prompt-master.md`. Ele faz um commit por task, abre um PR por marco (empilhados) e só para quando precisa de uma decisão, de um segredo ou de algo irreversível.

## 5. Tarefas tuas em paralelo

- [ ] Completar os recursos em `draft` (ver o campo `notes` em cada YAML): glass, abtest-design, appshots, 60fps-design, appllama, agent-memory, morphrig, appkittie.
- [ ] Chegar aos 30–50 recursos escritos por ti (exemplos de voz).
- [ ] Confirmar a licença do fundo do hero na página de copyright da Watermelon.
- [ ] Clearance do nome e domínio.
- [ ] Contas: Vercel e Umami Cloud.
- [ ] Logo final em SVG.
