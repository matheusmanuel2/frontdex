# Proteção de `main`

Estas definições devem ser ativadas pelo Matheus em **Settings → Branches** do repositório. Nenhum workflow ou agente altera as definições do GitHub.

1. Crie uma regra para a branch `main`.
2. Exija pull request antes do merge e pelo menos uma aprovação.
3. Exija revisão do Code Owner. [`.github/CODEOWNERS`](../.github/CODEOWNERS) encaminha as revisões ao dono do repositório.
4. Exija que os checks passem antes do merge. Selecione **Lint, typecheck, testes e build**, do workflow `CI`.
5. Bloqueie force pushes e a eliminação da branch.
6. Guarde a regra.

O template de PR inclui a checklist visual da spec 006; a revisão aprovada e o CI verde são necessários antes de integrar alterações em `main`.
