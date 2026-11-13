import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

// Bibliotecas de ícones genéricas estão proibidas (CLAUDE.md, spec 004).
// Os ícones são só os nossos, sobre components/icons/IconBase.
const forbiddenIconLibraries = ['lucide-react', '@heroicons/react', 'react-icons', '@tabler/icons-react'];

const config = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
      'docs/**',
    ],
  },
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: forbiddenIconLibraries.map((name) => ({
            name,
            message: 'Bibliotecas de ícones genéricas são proibidas. Usa os ícones de components/icons (IconBase).',
          })),
          patterns: forbiddenIconLibraries.map((name) => ({
            group: [`${name}/*`],
            message: 'Bibliotecas de ícones genéricas são proibidas. Usa os ícones de components/icons (IconBase).',
          })),
        },
      ],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'type'],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    // lib/content é o único sítio que lê ficheiros de data/ (spec 001, T-203).
    files: ['app/**', 'components/**', 'lib/**'],
    ignores: ['lib/content/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            ...forbiddenIconLibraries.map((name) => ({
              name,
              message: 'Bibliotecas de ícones genéricas são proibidas.',
            })),
            ...['fs', 'node:fs', 'fs/promises', 'node:fs/promises', 'yaml'].map((name) => ({
              name,
              message: 'Só lib/content lê ficheiros de data/. Importa as consultas de @/lib/content.',
            })),
          ],
          patterns: forbiddenIconLibraries.map((name) => ({
            group: [`${name}/*`],
            message: 'Bibliotecas de ícones genéricas são proibidas.',
          })),
        },
      ],
    },
  },
  prettier,
];

export default config;
