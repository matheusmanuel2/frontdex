import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const pagefindOutput = path.resolve('.next/static/pagefind');
const vercelStaticOutput = path.resolve('.vercel/output/static/_next/static/pagefind');

execFileSync('vercel', ['build', '--yes', '--environment', 'preview'], {
  env: { ...process.env, FRONTDEX_DEFER_PAGEFIND: '1' },
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
