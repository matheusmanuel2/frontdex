/**
 * Recolhe provas para preencher pricing e open_source dos rascunhos do scout (ADR 0014).
 *
 * Para cada rascunho em <dir>: segue redirecionamentos (URL final), lê o texto visível da página,
 * tenta <origem>/pricing, encontra links para repositórios GitHub e lê a licença deles.
 * Grava <out>: { slug: Evidence }. Não decide nada sozinho além do que a licença prova.
 *
 * Uso: pnpm tsx scripts/scout/enrich.ts <dir-com-yaml> <out.json>
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { parseDocument } from 'yaml';

export type Evidence = {
  name: string;
  url: string;
  finalUrl?: string;
  redirected?: boolean;
  text?: string;
  pricingPage?: string;
  repos: { repo: string; license?: string; description?: string }[];
  error?: string;
};

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
const NOT_REPOS = /^(features|sponsors|login|join|about|pricing|marketplace|topics|explore|orgs|settings|site|apps|collections|trending|readme|enterprise|security|customer-stories)$/i;

export function visibleText(html: string, max: number): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#\d+;|&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function githubLinks(html: string): string[] {
  const out = new Set<string>();
  for (const m of html.matchAll(/https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)/g)) {
    const owner = m[1] ?? '';
    const repo = (m[2] ?? '').replace(/\.git$/, '');
    if (!owner || !repo || NOT_REPOS.test(owner)) continue;
    out.add(`${owner}/${repo}`.toLowerCase());
    if (out.size >= 3) break;
  }
  return [...out];
}

const sameHost = (a: string, b: string) => {
  try {
    return new URL(a).hostname.replace(/^www\./, '') === new URL(b).hostname.replace(/^www\./, '');
  } catch {
    return true;
  }
};

async function get(url: string, max = 600_000): Promise<{ status: number; url: string; html: string } | { error: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15_000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: 'follow', headers: { 'User-Agent': UA, Accept: 'text/html' } });
    const reader = res.body?.getReader();
    const dec = new TextDecoder();
    let html = '';
    while (reader && html.length < max) {
      const { done, value } = await reader.read();
      if (done) break;
      html += dec.decode(value, { stream: true });
    }
    await reader?.cancel().catch(() => {});
    return { status: res.status, url: res.url, html };
  } catch (e) {
    return { error: (e as Error).name === 'AbortError' ? 'timeout' : (e as Error).message };
  } finally {
    clearTimeout(timer);
  }
}

async function licenses(repos: string[], token: string) {
  const out = new Map<string, { license?: string; description?: string }>();
  for (let i = 0; i < repos.length; i += 50) {
    const batch = repos.slice(i, i + 50);
    const q = batch
      .map((r, j) => {
        const [o, n] = r.split('/');
        return `r${j}: repository(owner: ${JSON.stringify(o)}, name: ${JSON.stringify(n)}) { nameWithOwner description licenseInfo { spdxId } }`;
      })
      .join('\n');
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `{ ${q} }` }),
    });
    const json = (await res.json()) as { data?: Record<string, { description: string | null; licenseInfo: { spdxId: string } | null } | null> };
    batch.forEach((r, j) => {
      const d = json.data?.[`r${j}`];
      if (!d) return;
      const spdx = d.licenseInfo?.spdxId;
      out.set(r, { license: spdx && spdx !== 'NOASSERTION' ? spdx : undefined, description: d.description ?? undefined });
    });
  }
  return out;
}

async function main() {
  const [dir, outFile] = process.argv.slice(2);
  if (!dir || !outFile) throw new Error('uso: enrich.ts <dir> <out.json>');
  const files = readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.yaml'));
  const ev: Record<string, Evidence> = existsSync(outFile) ? JSON.parse(readFileSync(outFile, 'utf8')) : {};
  const todo = files.filter((f) => !ev[path.basename(f, '.yaml')]);
  console.log(`${files.length} rascunhos · ${todo.length} por ler`);

  for (let i = 0; i < todo.length; i += 25) {
    const batch = todo.slice(i, i + 25);
    await Promise.all(
      batch.map(async (f) => {
        const d = parseDocument(readFileSync(path.join(dir, f), 'utf8')).toJS() as { name: string; url: string; repo?: string };
        const e: Evidence = { name: d.name, url: d.url, repos: [] };
        const repoKeys = new Set<string>();
        if (d.repo) repoKeys.add(d.repo.replace(/^https:\/\/github\.com\//, '').toLowerCase());
        const page = await get(d.url);
        if ('error' in page) e.error = page.error;
        else {
          e.finalUrl = page.url;
          e.redirected = !sameHost(d.url, page.url);
          e.text = visibleText(page.html, 1800);
          if (page.status >= 400) e.error = `HTTP ${page.status}`;
          if (!d.url.includes('github.com/')) for (const r of githubLinks(page.html)) repoKeys.add(r);
          if (!/github\.com|npmjs\.com|chrome\.google\.com/.test(page.url)) {
            const origin = new URL(page.url).origin;
            const pr = await get(`${origin}/pricing`, 300_000);
            if (!('error' in pr) && pr.status === 200 && new URL(pr.url).pathname.includes('pricing')) e.pricingPage = visibleText(pr.html, 1200);
          }
        }
        e.repos = [...repoKeys].map((repo) => ({ repo }));
        ev[path.basename(f, '.yaml')] = e;
      }),
    );
    if ((i / 25) % 8 === 0) {
      writeFileSync(outFile, JSON.stringify(ev) + '\n');
      console.log(`  ${Math.min(i + 25, todo.length)}/${todo.length}`);
    }
  }

  const token = execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();
  const allRepos = [...new Set(Object.values(ev).flatMap((e) => e.repos.map((r) => r.repo)))];
  const lic = await licenses(allRepos, token);
  for (const e of Object.values(ev)) e.repos = e.repos.filter((r) => lic.has(r.repo)).map((r) => ({ repo: r.repo, ...lic.get(r.repo) }));
  writeFileSync(outFile, JSON.stringify(ev) + '\n');
  console.log(`feito · ${Object.keys(ev).length} com provas`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
