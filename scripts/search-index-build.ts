import { execFileSync } from 'node:child_process';

if (process.env.FRONTDEX_DEFER_PAGEFIND === '1') {
  console.log('Pagefind será gerado após o build local da Vercel.');
} else {
  execFileSync('pnpm', ['search:index'], { stdio: 'inherit' });
}
