/**
 * Recolha de candidatos (spec 011, "Escala").
 *
 * Lê listas curadas no GitHub, extrai links, tira duplicados do índice e da fila,
 * junta sinais do GitHub (estrelas, último push, archived), confirma que cada URL responde
 * e grava scouting/candidates.json. Nunca escreve em data/.
 *
 * Uso: pnpm tsx scripts/scout/harvest.ts [--no-check]
 * Precisa do gh autenticado (usa `gh auth token`).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { parseDocument } from 'yaml';

import { checkResourceLinks } from '../check-resource-urls';
import { MANUAL, SOURCES, type Source } from './sources';

const ROOT = path.resolve(import.meta.dirname, '../..');
const OUT = path.join(ROOT, 'scouting/candidates.json');
const STALE_DAYS = 730;

export type Candidate = {
  key: string;
  name: string;
  url: string;
  sources: { list: string; section: string }[];
  category: string | null;
  github?: { repo: string; stars: number; pushed: string; archived: boolean };
  http?: 'ok' | string;
  alerts: string[];
  decision: 'in' | 'out' | 'maybe' | null;
};

/** Normaliza para comparar duplicados: sem protocolo, www, query, hash nem barra final. */
export function normalizeUrl(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const host = u.hostname.replace(/^www\./, '').toLowerCase();
  let p = u.pathname.replace(/\/+$/, '');
  if (host === 'github.com') p = p.split('/').slice(0, 3).join('/').toLowerCase();
  return host + p;
}

const SKIP_HOSTS = [
  'twitter.com', 'x.com', 'facebook.com', 'linkedin.com', 'instagram.com', 'youtube.com', 'youtu.be',
  'img.shields.io', 'badgen.net', 'awesome.re', 'creativecommons.org', 'travis-ci.org', 'opencollective.com',
  'patreon.com', 'buymeacoffee.com', 'ko-fi.com', 't.me', 'discord.gg', 'amzn.to', 'amazon.com',
];

/** Links que não são recursos: âncoras, badges, outras awesome lists, ficheiros do próprio repo. */
export function isNoise(url: string, name: string): boolean {
  if (!/^https?:\/\//.test(url)) return true;
  const n = normalizeUrl(url);
  if (!n) return true;
  const host = n.split('/')[0] ?? '';
  if (SKIP_HOSTS.some((h) => host === h || host.endsWith('.' + h))) return true;
  if (/\.(png|jpe?g|gif|svg|webp)$/i.test(url)) return true;
  if (host === 'github.com' && n.split('/').length < 3) return true;
  if (/github\.com\/[^/]+\/[^/]+\/(blob|tree|issues|pulls|wiki|graphs)/.test(url)) return true;
  if (/awesome/i.test(n) && host === 'github.com') return true;
  if (!name.trim() || /^!\[/.test(name) || name.length > 80) return true;
  return false;
}

/** Extrai [nome](url) de um README, guardando o título da secção onde aparece. */
export function extractLinks(markdown: string): { name: string; url: string; section: string }[] {
  const out: { name: string; url: string; section: string }[] = [];
  let section = '';
  for (const line of markdown.split('\n')) {
    const h = line.match(/^#{1,4}\s+(.+)/);
    if (h) {
      section = (h[1] ?? '').replace(/[[\]()*_`#]/g, '').replace(/https?:\/\/\S+/g, '').trim();
      continue;
    }
    const m = line.match(/^\s*[-*|]\s*\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/);
    if (m?.[1] && m[2]) out.push({ name: m[1].replace(/[*_`]/g, '').trim(), url: m[2], section });
  }
  return out;
}

/** Categoria sugerida a partir do título da secção (só sugestão; o Matheus decide). */
export function suggestCategory(section: string, source: Source): string | null {
  const s = section.toLowerCase();
  const rules: [RegExp, string][] = [
    [/icon/, 'icons'],
    [/font|typeface/, 'fonts'],
    [/typograph/, 'typography-tools'],
    [/colou?r|palette|gradient/, 'colors'],
    [/chart|dataviz|visuali[sz]/, 'charts'],
    [/accessib|a11y/, 'accessibility'],
    [/animat|motion/, 'animation'],
    [/illustrat|stock|photo|image|mockup|3d/, 'assets'],
    [/inspiration|gallery|showcase/, 'ui-inspiration'],
    [/component|ui kit|ui librar|framework/, 'ui-components'],
    [/course|learn|tutorial|guide/, 'guides'],
    [/book/, 'books'],
    [/podcast/, 'podcasts'],
    [/video|talk|screencast/, 'videos'],
    [/communit|forum/, 'communities'],
    [/design tool|prototyp|wireframe/, 'design-tools'],
    [/performance|devtool|developer tool|testing|lint|build/, 'dev-tools'],
    [/article|blog|newsletter/, 'articles'],
    [/reference|doc|cheat/, 'reference'],
    [/challenge|exercise|practice/, 'challenges'],
  ];
  for (const [re, cat] of rules) if (re.test(s)) return cat;
  return source.defaultCategory ?? null;
}

function indexKeys(): Set<string> {
  const keys = new Set<string>();
  const dir = path.join(ROOT, 'data/resources');
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.yaml'))) {
    const doc = parseDocument(readFileSync(path.join(dir, f), 'utf8')).toJS() as { url?: string; repo?: string };
    for (const u of [doc.url, doc.repo]) {
      const n = u && normalizeUrl(u);
      if (n) keys.add(n);
    }
  }
  return keys;
}

async function fetchReadme(repo: string, token: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${repo}/readme`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.raw' },
  });
  if (!res.ok) throw new Error(`${repo}: README ${res.status}`);
  return res.text();
}

/** Sinais do GitHub em lotes de 50 via GraphQL. */
async function githubSignals(repos: string[], token: string) {
  const result = new Map<string, NonNullable<Candidate['github']>>();
  for (let i = 0; i < repos.length; i += 50) {
    const batch = repos.slice(i, i + 50);
    const fields = batch
      .map((r, j) => {
        const [owner, name] = r.split('/');
        return `r${j}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { nameWithOwner stargazerCount pushedAt isArchived }`;
      })
      .join('\n');
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `{ ${fields} }` }),
    });
    const json = (await res.json()) as { data?: Record<string, { nameWithOwner: string; stargazerCount: number; pushedAt: string; isArchived: boolean } | null> };
    batch.forEach((r, j) => {
      const d = json.data?.[`r${j}`];
      if (d) result.set(r.toLowerCase(), { repo: d.nameWithOwner, stars: d.stargazerCount, pushed: d.pushedAt?.slice(0, 10) ?? '', archived: d.isArchived });
    });
  }
  return result;
}

async function main() {
  const check = !process.argv.includes('--no-check');
  const token = execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();
  const inIndex = indexKeys();
  const previous: Candidate[] = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : [];
  const byKey = new Map(previous.map((c) => [c.key, c]));

  let skippedIndex = 0;
  for (const source of SOURCES) {
    let md: string;
    try {
      md = await fetchReadme(source.repo, token);
    } catch (e) {
      console.warn(`! ${(e as Error).message}`);
      continue;
    }
    let added = 0;
    for (const link of extractLinks(md)) {
      if (isNoise(link.url, link.name)) continue;
      const key = normalizeUrl(link.url)!;
      if (inIndex.has(key)) {
        skippedIndex++;
        continue;
      }
      const ref = { list: source.repo, section: link.section };
      const existing = byKey.get(key);
      if (existing) {
        if (!existing.sources.some((s) => s.list === ref.list)) existing.sources.push(ref);
        continue;
      }
      byKey.set(key, { key, name: link.name, url: link.url.replace(/^http:/, 'https:'), sources: [ref], category: suggestCategory(link.section, source), alerts: [], decision: null });
      added++;
    }
    console.log(`${source.repo}: +${added}`);
  }

  for (const m of MANUAL) {
    const key = normalizeUrl(m.url)!;
    if (inIndex.has(key)) {
      skippedIndex++;
      continue;
    }
    const ref = { list: 'pedido do Matheus', section: 'galerias de UI' };
    const existing = byKey.get(key);
    if (existing) {
      if (!existing.sources.some((s) => s.list === ref.list)) existing.sources.push(ref);
    } else {
      byKey.set(key, { key, name: m.name, url: m.url, sources: [ref], category: m.category, alerts: [], decision: null });
    }
  }

  const all = [...byKey.values()];
  const ghRepos = [...new Set(all.filter((c) => c.key.startsWith('github.com/')).map((c) => c.key.split('/').slice(1, 3).join('/')))];
  const signals = await githubSignals(ghRepos, token);
  const now = Date.now();
  for (const c of all) {
    if (!c.key.startsWith('github.com/')) continue;
    const g = signals.get(c.key.split('/').slice(1, 3).join('/'));
    c.alerts = c.alerts.filter((a) => !a.startsWith('github:'));
    if (!g) {
      c.alerts.push('github: repositório não existe');
      continue;
    }
    c.github = g;
    if (g.archived) c.alerts.push('github: arquivado');
    else if (now - Date.parse(g.pushed) > STALE_DAYS * 864e5) c.alerts.push('github: sem push há 2+ anos');
  }

  if (check) {
    const toCheck = all.filter((c) => !c.http && !c.alerts.some((a) => a.startsWith('github:')));
    console.log(`a verificar ${toCheck.length} URLs…`);
    for (let i = 0; i < toCheck.length; i += 40) {
      const batch = toCheck.slice(i, i + 40);
      const errors = await checkResourceLinks(
        batch.map((c) => ({ file: c.key, field: 'url' as const, url: c.url })),
        { attempts: 1, timeoutMs: 10_000, onChallenge: () => {} },
      );
      const failed = new Map(errors.map((e) => [e.file, e.reason]));
      for (const c of batch) c.http = failed.get(c.key) ?? 'ok';
      console.log(`  ${Math.min(i + 40, toCheck.length)}/${toCheck.length}`);
    }
  }

  // Mais forte primeiro: citado em mais listas, depois estrelas; com alertas vai para o fim.
  all.sort((a, b) =>
    Number(a.alerts.length > 0) - Number(b.alerts.length > 0) ||
    Number(a.http !== 'ok') - Number(b.http !== 'ok') ||
    b.sources.length - a.sources.length ||
    (b.github?.stars ?? 0) - (a.github?.stars ?? 0),
  );
  writeFileSync(OUT, JSON.stringify(all, null, 2) + '\n');
  const ok = all.filter((c) => c.http === 'ok' && c.alerts.length === 0).length;
  console.log(`\n${all.length} candidatos (${ok} sem alertas e no ar) · ${skippedIndex} links já no índice · ${OUT}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
