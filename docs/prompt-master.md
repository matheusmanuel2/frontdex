# Prompt master — construir a FrontDex com o Claude Code

Este é o prompt para colar no Claude Code, na raiz do repositório, para ele construir o MVP inteiro seguindo o `TASKS.md`.

## Antes de colar (5 minutos)

1. O kit está no repositório e no GitHub (`docs/next-steps.md`, passo 1).
2. Aprovaste as specs: `Status: aprovada` em `specs/000` a `008`. Se não quiseres ler todas agora, aprova pelo menos a 000, a 001 e a 004. O Claude para nas tasks cujas specs ainda não estão aprovadas.
3. `gh auth status` mostra que estás autenticado.
4. Abre o Claude Code com `claude`, aceita o MCP da Watermelon (`/mcp`) e confirma os agentes (`/agents`).
5. Respondeste às decisões **D-01 a D-07** no fim do `TASKS.md`, ou aceitas que as tasks que dependem delas fiquem para depois.

## O prompt

Copia tudo o que está dentro do bloco:

```text
Vais construir o MVP da FrontDex do início ao fim, seguindo o TASKS.md. Tu és o orquestrador: planeias, delegas nos agentes de .claude/agents/, verificas e fazes os commits. Não implementas tu mesmo o que tem um agente dono.

## 1. Lê primeiro, por esta ordem
CLAUDE.md, specs/000-constitution.md, TASKS.md, docs/architecture.md, specs/001 a 008, decisions/, docs/design/README.md. Lê os mockups de docs/design/mockups/ só quando uma task os referir.

## 2. Verificações iniciais (para se alguma falhar)
- `git status` limpo e na branch main atualizada.
- `gh auth status` ok.
- O MCP "watermelon" responde (pede-lhe um componente qualquer, por exemplo "button").
- A skill do transitions.dev está instalada. Se não estiver, corre `npx skills add Jakubantalik/transitions.dev` e `npx skills add Jakubantalik/transitions.dev -s transitions-polish`.
- Lista as specs com `Status: aprovada`. Uma task só avança se todas as specs que ela cita estiverem aprovadas.
Depois mostra-me um resumo de uma linha por verificação e começa logo, sem esperar pela minha resposta.

## 3. Como trabalhas cada marco (M1 a M9)
- Cria a branch `mN-nome-curto` (ex.: `m1-fundacao`). M1 sai de main; cada marco seguinte sai da branch do marco anterior, para não esperares pelo meu merge (PRs empilhados).
- Faz as tasks do marco pela ordem do TASKS.md, respeitando "Depende de".
- Para cada task:
  1. Confirma que as dependências estão marcadas [x] e que as specs estão aprovadas. Se não, salta-a e regista porquê.
  2. Delega no agente indicado na task (Task tool com subagent_type = nome do agente). Passa-lhe: o bloco completo da task copiado do TASKS.md, os caminhos das specs e mockups citados, e esta frase: "Implementa só esta task. Corre lint, typecheck e testes antes de terminar. Se a spec não responder a uma dúvida, para e devolve a pergunta em vez de decidir."
  3. Quando o agente terminar, verifica tu cada item de "Pronto quando" (corre os comandos, abre os ficheiros, para UI tira screenshots com o Playwright a 1440 e 390 px e compara com o mockup).
  4. Se falhar, devolve ao mesmo agente com a lista do que falta. No máximo 3 voltas; depois regista o bloqueio e segue.
  5. Marca [x] no TASKS.md e faz um commit só com essa task: `T-XXX: descrição curta`.
- No fim do marco:
  1. Corre tudo: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` e, a partir de M4, `pnpm test:e2e`. A partir de M8, também `pnpm validate` e `pnpm check:anti-ai`.
  2. Delega no agente reviewer com contexto limpo: só o diff do marco (`git diff <base>...HEAD`) e as specs ligadas. Nunca lhe passes o teu raciocínio.
  3. Se o reviewer pedir mudanças, manda cada ponto ao agente dono, corrige e volta a pedir revisão. Bloqueios do reviewer param o marco até eu decidir.
  4. `git push -u origin <branch>` e abre o PR com `gh pr create` com base na branch do marco anterior (ou main para M1). Corpo do PR: tasks cobertas, specs ligadas, veredito do reviewer, o que verificaste, screenshots (se houver UI) e o que ficou por fazer.
  5. Escreve-me um resumo curto (5 linhas no máximo) e passa ao marco seguinte sem esperar.

## 4. Quando paras e me perguntas
Só nestes casos. Junta todas as perguntas numa mensagem e continua com as tasks que não dependem delas:
- Uma decisão que nenhuma spec responde (regista-a como D-NN na tabela "Decisões em aberto" do TASKS.md).
- Uma decisão aberta (D-01 a D-07) que bloqueia a task seguinte.
- Precisas de uma conta, de um segredo ou de uma variável de ambiente (Vercel, Umami, tokens).
- Algo irreversível ou fora do repositório: mudar definições do GitHub, apagar branches, publicar em produção, comprar domínio.
Se tudo o que falta estiver bloqueado, para e diz-me exatamente o que precisas de mim.

## 5. Regras que não negoceias
- Constitution e spec 006 acima de tudo. Na dúvida, a regra mais restritiva vence.
- Nunca escreves nem alteras descrições, URLs, preços, licenças ou autores de recursos. Recurso com dados em falta fica em draft com TODO.
- Textos longos de interface (Contribuir, Sobre) que vierem dos mockups são rascunho: assinala-os no PR para eu rever.
- Nunca fazes merge, force push, nem mudas definições do repositório. Nunca desligas uma verificação do CI para passar.
- Componentes: procura sempre primeiro no MCP da Watermelon e instala com `npx shadcn@latest add <url>`, mantendo o aviso MIT. Ícones só os nossos, sobre IconBase. Movimento só com recipes do transitions.dev.
- Nada de valores soltos: cor, raio, fonte e duração vêm dos tokens.
- pt-BR primeiro em toda a UI; todas as chaves existem em messages/pt.json e messages/en.json.

## 6. Memória entre sessões
O TASKS.md é o teu estado. Mantém também docs/progress.md com uma linha por task (data, ID, commit, notas) e a branch atual. Se a sessão recomeçar ou o contexto ficar cheio, relê CLAUDE.md, TASKS.md e docs/progress.md e continua da primeira task por marcar.

Começa agora pelas verificações iniciais e depois pelo M1.
```

## Para retomar numa sessão nova

```text
Retoma a construção da FrontDex. Lê CLAUDE.md, docs/prompt-master.md (secções 3 a 6), TASKS.md e docs/progress.md. Faz checkout da branch indicada em docs/progress.md, confirma com git log que o último commit corresponde à última task marcada e continua da primeira task por marcar. Antes de continuar, verifica se respondi a alguma decisão em aberto.
```

## Para um marco só

```text
Faz só o marco M3 do TASKS.md, seguindo as regras do docs/prompt-master.md. No fim abre o PR e para.
```

## O que esperar

| Marco | Tamanho | O que vais rever no PR |
| --- | --- | --- |
| M1 | pequeno | Estrutura do projeto, CI verde |
| M2 | médio | Schema e erros do `pnpm validate` |
| M3 | grande | `/_design` nos dois temas, ícones animados |
| M4 | médio | Cabeçalho, idiomas, 404 |
| M5 | grande | Todas as páginas contra os mockups |
| M6 | médio | ⌘K e `/search` |
| M7 | pequeno | Metadados, sitemap, feed, OG |
| M8 | médio | Issue Form → PR a funcionar de verdade |
| M9 | médio | Relatórios de QA e deploy |

Faz o merge pela ordem M1 → M9. Como os PRs estão empilhados, depois de fazeres merge de um, o GitHub muda automaticamente a base do seguinte para `main` se apagares a branch já integrada.
