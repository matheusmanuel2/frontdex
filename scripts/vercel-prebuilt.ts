import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';

const pagefindOutput = path.resolve('.next/static/pagefind');
const vercelStaticOutput = path.resolve('.vercel/output/static/_next/static/pagefind');
const production = process.argv.includes('--prod');
const buildEnvironment: NodeJS.ProcessEnv = { ...process.env, FRONTDEX_DEFER_PAGEFIND: '1' };

if (production && !buildEnvironment.UMAMI_WEBSITE_ID) {
  const websiteId = /^UMAMI_WEBSITE_ID=(.+)$/m.exec(readFileSync('.env.example', 'utf8'))?.[1]?.trim();
  if (!websiteId) throw new Error('Defina UMAMI_WEBSITE_ID no ambiente ou em .env.example para a build de produção.');
  buildEnvironment.UMAMI_WEBSITE_ID = websiteId;
}

execFileSync('vercel', ['build', '--yes', ...(production ? ['--prod'] : ['--environment', 'preview'])], {
  env: buildEnvironment,
  stdio: 'inherit',
});

execFileSync('pnpm', ['search:index'], {
  env: { ...process.env, VERCEL: '1' },
  stdio: 'inherit',
});

if (!existsSync(path.join(pagefindOutput, 'pagefind.js'))) {
  throw new Error('O build não gerou o arquivo pagefind.js.');
}

rmSync(vercelStaticOutput, { force: true, recursive: true });
mkdirSync(path.dirname(vercelStaticOutput), { recursive: true });
cpSync(pagefindOutput, vercelStaticOutput, { recursive: true });

console.log(`Índice Pagefind copiado para ${vercelStaticOutput}.`);
