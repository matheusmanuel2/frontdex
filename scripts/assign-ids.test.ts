import { describe, expect, it } from 'vitest';

import { assignResourceIds } from './assign-ids';

describe('atribuição de IDs dos recursos', () => {
  it('atribui IDs em ordem estável e continua após o maior ID existente', () => {
    const assignments = assignResourceIds([
      { file: 'data/resources/zulu.yaml', source: 'name: Zulu\n' },
      { file: 'data/resources/existing.yaml', source: 'id: 7\nname: Existing\n' },
      { file: 'data/resources/alpha.yaml', source: 'name: Alpha\n' },
    ]);

    expect(assignments.map(({ file, id }) => [file, id])).toEqual([
      ['data/resources/alpha.yaml', 8],
      ['data/resources/zulu.yaml', 9],
    ]);
  });

  it('não altera recursos que já têm ID', () => {
    expect(assignResourceIds([{ file: 'data/resources/existing.yaml', source: 'id: 3\nname: Existing\n' }])).toEqual(
      [],
    );
  });

  it('atribui IDs sequenciais em merges consecutivos', () => {
    const firstMerge = assignResourceIds([{ file: 'data/resources/first.yaml', source: 'name: First\n' }]);
    const first = firstMerge.at(0);
    if (!first) throw new Error('O primeiro merge devia receber um ID.');
    const secondMerge = assignResourceIds([
      { file: 'data/resources/first.yaml', source: first.source },
      { file: 'data/resources/second.yaml', source: 'name: Second\n' },
    ]);

    expect(first.id).toBe(1);
    expect(secondMerge.map(({ id }) => id)).toEqual([2]);
  });

  it('falha antes de atribuir quando encontra IDs duplicados ou inválidos', () => {
    expect(() =>
      assignResourceIds([
        { file: 'one.yaml', source: 'id: 4\nname: One\n' },
        { file: 'two.yaml', source: 'id: 4\nname: Two\n' },
      ]),
    ).toThrow('ID 4 duplicado');
    expect(() => assignResourceIds([{ file: 'invalid.yaml', source: 'id: TODO\nname: Invalid\n' }])).toThrow(
      'esperado um inteiro positivo',
    );
  });
});
