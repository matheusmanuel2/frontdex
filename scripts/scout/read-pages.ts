/**
 * Lê o conteúdo de cada candidato elegível (spec 011, ADR 0014) para a triagem e os rascunhos.
 *
 * Elegível = no ar (http ok) ou repositório GitHub existente e não arquivado.
 * Grava scouting/pages.json: { key: { title, description, siteName, lang, github? } }.
 * Retoma de onde parou: chaves já lidas não são pedidas outra vez.
 *
 * Uso: pnpm tsx scripts/scout/read-pages.ts
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { Candidate } from './harvest';

const ROOT = path.resolve(import.meta.dirname, '../..');
const CANDIDATES = path.join(ROOT, 'scouting/candidates.json');
const OUT = path.join(ROOT, 'scouting/pages.json');

export type Page = {
  title?: string;
  description?: string;
  siteName?: string;
  lang?: string;
  error?: string;
  github?: { description?: string; license?: string; topics: string[]; homepage?: string; language?: string };
};

export function eligible(c: Candidate): boolean {
  if (c.alerts.some((a) => a.includes('arquivado') || a.includes('não existe'))) return false;
  if (c.github) return true;
  return c.http === 'ok';
}

const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();

export function parseHtml(html: string): Page {
  const meta = (attr: string, value: string) => {
    const re = new RegExp(`<meta[^>]+${attr}=["']${value}["'][^>]*>`, 'i');
    const tag = html.match(re)?.[0];
    const content = tag?.match(/content=["']([^"']*)["']/i)?.[1];
    return content ? decode(content) : undefined;
  };
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
  return {
    title: title ? decode(title) : meta('property', 'og:title'),
    description: meta('name', 'description') ?? meta('property', 'og:description'),
    siteName: meta('property', 'og:site_name'),
    lang: html.match(/<html[^>]+lang=["']([^"']+)["']/i)?.[1],
  };
}

async function readHtml(url: string): Promise<Page> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36',
        Accept: 'text/html',
      },
    });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const reader = res.body?.getReader();
    let html = '';
    const dec = new TextDecoder();
    while (reader && html.length < 300_000) {
      const { done, value } = await reader.read();
      if (done) break;
      html += dec.decode(value, { stream: true });
      if (/<\/head>/i.test(html)) break;
    }
    await reader?.cancel().catch(() => {});
    return parseHtml(html);
  } catch (e) {
    return { error: (e as Error).name === 'AbortError' ? 'timeout' : (e as Error).message };
  } finally {
    clearTimeout(timer);
  }
}

async function githubMeta(repos: string[], token: string): Promise<Map<string, NonNullable<Page['github']>>> {
  const out = new Map<string, NonNullable<Page['github']>>();
  for (let i = 0; i < repos.length; i += 50) {
    const batch = repos.slice(i, i + 50);
    const q = batch
      .map((r, j) => {
        const [o, n] = r.split('/');
        return `r${j}: repository(owner: ${JSON.stringify(o)}, name: ${JSON.stringify(n)}) { description homepageUrl licenseInfo { spdxId } primaryLanguage { name } repositoryTopics(first: 10) { nodes { topic { name } } } }`;
      })
      .join('\n');
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `{ ${q} }` }),
    });
    type R = {
      description: string | null;
      homepageUrl: string | null;
      licenseInfo: { spdxId: string } | null;
      primaryLanguage: { name: string } | null;
      repositoryTopics: { nodes: { topic: { name: string } }[] };
    };
    const json = (await res.json()) as { data?: Record<string, R | null> };
    batch.forEach((r, j) => {
      const d = json.data?.[`r${j}`];
      if (!d) return;
      const spdx = d.licenseInfo?.spdxId;
      out.set(r.toLowerCase(), {
        description: d.description ?? undefined,
        license: spdx && spdx !== 'NOASSERTION' ? spdx : undefined,
        topics: d.repositoryTopics.nodes.map((n) => n.topic.name),
        homepage: d.homepageUrl || undefined,
        language: d.primaryLanguage?.name,
      });
    });
    console.log(`  github ${Math.min(i + 50, repos.length)}/${repos.length}`);
  }
  return out;
}

async function main() {
  const candidates = (JSON.parse(readFileSync(CANDIDATES, 'utf8')) as Candidate[]).filter(eligible);
  const pages: Record<string, Page> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
  const todo = candidates.filter((c) => !pages[c.key]);
  console.log(`${candidates.length} elegíveis · ${todo.length} por ler`);

  const token = execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();
  const gh = todo.filter((c) => c.key.startsWith('github.com/'));
  const meta = await githubMeta(
    gh.map((c) => c.key.split('/').slice(1, 3).join('/')),
    token,
  );
  for (const c of gh)
    pages[c.key] = { title: c.name, github: meta.get(c.key.split('/').slice(1, 3).join('/')) ?? { topics: [] } };
  writeFileSync(OUT, JSON.stringify(pages) + '\n');

  const web = todo.filter((c) => !c.key.startsWith('github.com/'));
  const CONC = 30;
  let done = 0;
  for (let i = 0; i < web.length; i += CONC) {
    const batch = web.slice(i, i + CONC);
    const results = await Promise.all(batch.map((c) => readHtml(c.url)));
    batch.forEach((c, j) => (pages[c.key] = results[j] ?? { error: 'sem resposta' }));
    done += batch.length;
    if (done % 300 < CONC || done === web.length) {
      writeFileSync(OUT, JSON.stringify(pages) + '\n');
      console.log(`  páginas ${done}/${web.length}`);
    }
  }
  writeFileSync(OUT, JSON.stringify(pages) + '\n');
  const empty = Object.values(pages).filter((p) => !p.error && !p.description && !p.github?.description).length;
  console.log(`\nfeito · ${Object.keys(pages).length} lidas · ${empty} sem descrição na página`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
