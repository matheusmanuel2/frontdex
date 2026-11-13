import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

import { convertIssueToYaml } from './issue-to-yaml';
import { resourceSchema } from '../lib/content/schema';

const issue = (body: string) => ({ number: 42, title: 'Resource suggestion', body });

const completeBody = `### Nome oficial

Example Tool

### URL principal

https://example.test/resource

### Área

build

### Categoria (slug)

animation

### Tags (slugs separados por vírgula)

react, motion

### Preço

free

### Código open source?

Sim

### Nível (opcional)

- [x] beginner
- [ ] intermediate
- [x] expert

### Descrição em português (40–160 caracteres)

Example resource description written only to exercise the issue form conversion test.

### Descrição em inglês (40–160 caracteres)

Example resource description written only to exercise the issue form conversion test.`;

describe('conversão do Issue Form para YAML', () => {
  it('converte respostas completas sem inventar campos e mantém o recurso ativo', () => {
    const result = convertIssueToYaml(issue(completeBody), '2026-11-13');
    const resource = resourceSchema.parse(parse(result.yaml));

    expect(result.slug).toBe('example-tool');
    expect(result.needsTranslation).toBe(false);
    expect(resource).toMatchObject({
      name: 'Example Tool',
      url: 'https://example.test/resource',
      tags: ['react', 'motion'],
      level: ['beginner', 'expert'],
      status: 'active',
      added: '2026-11-13',
      last_checked: '2026-11-13',
    });
    expect(resource).not.toHaveProperty('id');
  });

  it('marca como draft os campos por confirmar e pede tradução se faltar português', () => {
    const body = completeBody
      .replace(
        '### Descrição em português (40–160 caracteres)\n\nExample resource description written only to exercise the issue form conversion test.',
        '### Descrição em português (40–160 caracteres)\n\nNo response',
      )
      .replace('### Preço\n\nfree', '### Preço\n\nNo response')
      .replace('### Código open source?\n\nSim', '### Código open source?\n\nAinda não confirmado');
    const result = convertIssueToYaml(issue(body), '2026-11-13');
    const resource = resourceSchema.parse(parse(result.yaml));

    expect(result.needsTranslation).toBe(true);
    expect(resource.status).toBe('draft');
    expect(resource.description.pt).toBe('TODO');
    expect(resource.pricing).toBe('TODO');
    expect(resource.open_source).toBe('TODO');
  });

  it('falha claramente quando falta um campo obrigatório do formulário', () => {
    const body = completeBody.replace(
      '### URL principal\n\nhttps://example.test/resource',
      '### URL principal\n\nNo response',
    );
    expect(() => convertIssueToYaml(issue(body), '2026-11-13')).toThrow('URL principal');
  });
});
