# 000 — Constitution

Status: aprovada · Dono: Matheus Manuel

Estes princípios valem para todo o código, conteúdo e design da FrontDex. Quando uma spec, um PR ou um agente entra em conflito com eles, a constitution vence. Mudar a constitution exige um ADR.

## 1. Missão

Organizar a internet front-end para que developers encontrem o recurso certo depressa e saibam por que ele vale o tempo deles.

Promessa: **Menos busca. Mais construção.**

## 2. Princípios de produto

| # | Princípio | Na prática |
| --- | --- | --- |
| 01 | Útil antes de popular | Um recurso entra se faria falta ao desaparecer, não porque tem muitas estrelas |
| 02 | Curado, não lotado | Menos itens, cada um justificado |
| 03 | Rápido antes de vistoso | Site estático, JS mínimo, metas de performance no CI |
| 04 | Contexto antes de links | Cada recurso tem uma descrição concreta e, quando possível, o "por que está aqui" |
| 05 | Aberto por padrão | Código, dados e decisões no GitHub |

Pergunta de curadoria: **"se este recurso desaparecer, alguém perderia uma opção realmente útil?"**

O patrocínio nunca compra destaque, selo ou posição.

## 3. Princípios técnicos

- O repositório é a única fonte de verdade. Conteúdo = YAML em `data/`.
- Tudo é gerado no build. Nenhuma página depende de servidor em tempo real (exceção: o middleware de idioma em `/`).
- Um schema (Zod) valida o conteúdo no site, no CI e no bot.
- Acessibilidade WCAG 2.2 AA é requisito, não melhoria.
- Metas: Lighthouse ≥ 95 nas quatro categorias, LCP < 1,5 s, JS da home < 90 KB gzip.

## 4. Princípios de design

- Identidade: brand book v0.11 (`docs/brand/brand-book.md`).
- Tema dark por padrão, light disponível.
- A personalidade vem do sistema de índice (IDs numerados, listas densas, labels mono) e do movimento cuidado, não de efeitos.
- Proibido ter "cara de AI" (spec 006).
- Um único gradiente/imagem de destaque: o fundo do hero da home.

## 5. Princípios de conteúdo

- pt-BR é o idioma padrão; inglês é obrigatório desde o dia 1.
- Descrições dizem o que o recurso faz e o que o distingue, com um detalhe concreto. Sem adjetivos vazios.
- Nada é inventado: URL, preço, licença e autor vêm de fonte verificada. Na dúvida, o recurso fica em `status: draft`.

## 6. Como decidimos

- Specs com critérios de aceitação verificáveis. O Matheus aprova specs e faz todos os merges.
- Agentes param e perguntam quando a spec não responde.
- O Reviewer nunca revê o próprio trabalho.

## 7. Fora do âmbito do MVP

Vagas (jobs), contas, votos, comentários, newsletter, backend.
