# Contribuir com a FrontDex

[English below](#contributing-to-frontdex)

## O que entra

Um recurso entra se responder **sim** a: *se ele desaparecer, alguém perderia uma opção realmente útil?*

Entra:
- Ferramentas, bibliotecas, cursos, livros, guias, galerias de inspiração e comunidades **de front-end**.
- Projetos pequenos e pouco conhecidos, se forem bons. Útil antes de popular.

Não entra:
- Links de afiliado, conteúdo gerado em massa, templates genéricos.
- Recursos abandonados (sem atualização relevante e com alternativas melhores).
- Autopromoção sem valor claro para quem constrói interfaces.

## Como escrever a descrição

- 40–160 caracteres, em pt-BR **e** inglês.
- Diga **o que é + o que o distingue**, com um detalhe concreto.
- Sem: "poderoso", "incrível", "revolucionário", "desbloqueie", "seamless", "unlock".

Bom: *Divide texto em linhas, palavras e letras exatamente onde o navegador quebrou, pronto para animar.*
Mau: *Uma biblioteca poderosa para animações incríveis.*

## Como enviar

1. **Sem Git:** issue → formulário "Adicionar recurso". Um bot abre o PR.
2. **Com Git:** crie `data/resources/<slug>.yaml` (veja `specs/001-data-schema.md` e os exemplos na pasta) e abra um PR. Não preencha o `id`: ele é atribuído no merge.

O CI confere schema, link, duplicados e os dois idiomas. Um curador revisa. Merge = publicado.

---

# Contributing to FrontDex

A resource gets in if the answer is **yes** to: *if it disappeared, would someone lose a genuinely useful option?*

- Front-end tools, libraries, courses, books, guides, inspiration galleries and communities. Small and lesser-known is fine if it's good.
- No affiliate links, mass-generated content, generic templates, abandoned projects or self-promotion without clear value.

Descriptions: 40–160 characters, in Portuguese (pt-BR) **and** English. Say **what it is + what sets it apart**, with one concrete detail. No "powerful", "amazing", "unlock", "seamless".

Submit through the "Add a resource" issue form (a bot opens the PR) or open a PR with `data/resources/<slug>.yaml`. Leave `id` empty; it's assigned on merge.
