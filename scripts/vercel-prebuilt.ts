import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const production = process.argv.includes('--prod');
const buildEnvironment: NodeJS.ProcessEnv = { ...process.env };

if (production && !buildEnvironment.UMAMI_WEBSITE_ID) {
  const websiteId = /^UMAMI_WEBSITE_ID=(.+)$/m.exec(readFileSync('.env.example', 'utf8'))?.[1]?.trim();
  if (!websiteId) throw new Error('Defina UMAMI_WEBSITE_ID no ambiente ou em .env.example para a build de produção.');
  buildEnvironment.UMAMI_WEBSITE_ID = websiteId;
}

execFileSync('vercel', ['build', '--yes', ...(production ? ['--prod'] : ['--environment', 'preview'])], {
  env: buildEnvironment,
  stdio: 'inherit',
});
