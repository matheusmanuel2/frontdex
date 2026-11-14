// Lighthouse CI loads this configuration as CommonJS.
/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('@playwright/test');

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3102/pt',
        'http://localhost:3102/pt/c/ui-components',
        'http://localhost:3102/pt/r/cmux',
        'http://localhost:3102/en',
        'http://localhost:3102/en/c/ui-components',
        'http://localhost:3102/en/r/cmux',
      ],
      startServerCommand: 'pnpm start --port 3102',
      startServerReadyPattern: 'Ready in',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      chromePath: chromium.executablePath(),
      settings: {
        preset: 'desktop',
        // Os runners Ubuntu do GitHub bloqueiam o sandbox do Chrome (AppArmor).
        chromeFlags: process.env.CI ? '--no-sandbox' : '',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 1499, aggregationMethod: 'median' }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
