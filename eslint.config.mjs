import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import importPlugin from 'eslint-plugin-import';

// Bibliotecas de ícones genéricas estão proibidas (CLAUDE.md, spec 004).
// Os ícones são só os nossos, sobre components/icons/IconBase.
const forbiddenIconLibraries = ['lucide-react', '@heroicons/react', 'react-icons', '@tabler/icons-react'];
// Movimento só pelos recipes do transitions.dev (styles/motion.css), nunca por bibliotecas JS.
const forbiddenMotion = ['motion', 'motion/react', 'framer-motion'].map((name) => ({
  name,
  message: 'Movimento só com os recipes de styles/motion.css (transitions.dev).',
}));

const config = [
  {
    ignores: [
      '.next/**',
      '.vercel/**',
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
    plugins: { import: importPlugin },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            ...forbiddenIconLibraries.map((name) => ({
              name,
              message: 'Bibliotecas de ícones genéricas são proibidas. Usa os ícones de components/icons (IconBase).',
            })),
            ...forbiddenMotion,
          ],
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
    // O gerador de OG lê apenas as fontes e tokens locais usados na imagem.
    files: ['**/*.{ts,tsx,mts,mjs,js}'],
    ignores: [
      'lib/content/**',
      'lib/seo/open-graph.tsx',
      'scripts/**',
      '**/*.test.ts',
      'tests/**',
      '*.config.{ts,mts,mjs}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            ...forbiddenIconLibraries.map((name) => ({
              name,
              message: 'Bibliotecas de ícones genéricas são proibidas.',
            })),
            ...forbiddenMotion,
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
