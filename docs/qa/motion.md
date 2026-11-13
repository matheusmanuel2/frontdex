# QA de movimento

Revisão T-903 contra a spec 004 e as regras da skill `transitions-polish`.

## Escopo

Revistos os recipes compartilhados em `styles/motion.css`, os componentes que os usam em `app/` e `components/`, e a escala de movimento documentada em `docs/design/motion.md`. A busca por valores arbitrários incluiu durações, easings, distâncias, escalas, blur, estilos inline, CSS e utilitários Tailwind.

## Ajustes aplicados

- Ícones no hover/foco: entrada de 150 ms e retorno de 250 ms. A versão anterior invertia a assimetria recomendada.
- Seta "ver mais": entrada reduzida de 350 ms para 250 ms; retorno permanece em 350 ms.
- Troca de ícones: escala inicial alterada de 0,25 para `--scale-small` (0,98), evitando um efeito de zoom acentuado.

## Verificações

- Modal e dropdown abrem em 250 ms e fecham em 150 ms.
- Tooltip tem abertura com atraso de intenção de 80 ms, entrada de 150 ms e saída curta.
- Tabs e troca de ícone mantêm transições reversíveis de 250 ms.
- Todos os recipes `t-*` continuam cobertos por `prefers-reduced-motion`.
- A busca não encontrou outros valores de duração, easing ou `@keyframes` fora de `styles/motion.css`; os valores nos fixtures são casos de teste.
- Distâncias e ângulos dos gestos de ícone não têm token correspondente por uso; a saída de tooltip também é intencionalmente mais curta que os tokens disponíveis. Foram mantidos, sem pendências de refinamento segundo a escala.

**Resultado: nenhum problema de movimento pendente.**
