/**
 * Converte as decisões da triagem (scouting/drafts/*.out.json) em data/resources/<slug>.yaml
 * com status: draft (ADR 0014). Só o Matheus muda para active.
 *
 * Cada linha de saída: { key, decision: "in"|"out", reason?, name, category, tags[], pricing?,
 * open_source?, license?, description?: { pt, en } }.
 *
 * Valida tudo: categoria e tags das listas fechadas, descrição 40–160 sem frases proibidas.
 * O que falha vira TODO (permitido em draft) em vez de ser inventado.
 *
 * Uso: pnpm tsx scripts/scout/write-drafts.ts
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { parseDocument, stringify } from 'yaml';

import { normalizeUrl, type Candidate } from './harvest';

import type { Page } from './read-pages';

const ROOT = path.resolve(import.meta.dirname, '../..');
const RES = path.join(ROOT, 'data/resources');
const DRAFTS = path.join(ROOT, 'scouting/drafts');
const TODAY = new Date().toISOString().slice(0, 10);

const PROHIBITED = [
  'unlock', 'seamless', 'elevate', 'empower', 'supercharge', 'dive into', 'unleash', 'game-changer',
  'cutting-edge', "whether you're a beginner or an expert", 'desbloquear', 'potencializar', 'eleve',
  'mergulhe', 'revolucionário', 'de ponta', 'seja você iniciante ou especialista',
];
const PRICING = ['free', 'freemium', 'paid', 'pay-what-you-want'];

type Out = {
  key: string;
  decision: 'in' | 'out';
  reason?: string;
  name?: string;
  category?: string;
  tags?: string[];
  pricing?: string;
  open_source?: boolean;
  license?: string;
  description?: { pt?: string; en?: string };
};

export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\.(com|io|dev|app|design|co|so|net|org)$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'recurso';
}

export function validDescription(s: string | undefined): s is string {
  if (!s) return false;
  const t = s.trim();
  if (t.length < 40 || t.length > 160) return false;
  const low = t.toLowerCase();
  if (PROHIBITED.some((p) => low.includes(p))) return false;
  if ((t.match(/—/g) ?? []).length > 1) return false;
  return true;
}

function readList(file: string): string[] {
  return (parseDocument(readFileSync(path.join(ROOT, 'data', file), 'utf8')).toJS() as (string | { slug: string })[]).map((x) =>
    typeof x === 'string' ? x : x.slug,
  );
}

function main() {
  const cats = parseDocument(readFileSync(path.join(ROOT, 'data/categories.yaml'), 'utf8')).toJS() as { slug: string; area: string }[];
  const areaOf = new Map(cats.map((c) => [c.slug, c.area]));
  const tags = new Set(readList('tags.yaml'));
  const candidates = new Map((JSON.parse(readFileSync(path.join(ROOT, 'scouting/candidates.json'), 'utf8')) as Candidate[]).map((c) => [c.key, c]));
  const pages = JSON.parse(readFileSync(path.join(ROOT, 'scouting/pages.json'), 'utf8')) as Record<string, Page>;

  const used = new Set(readdirSync(RES).map((f) => f.replace(/\.yaml$/, '')));
  const existingUrls = new Set(
    readdirSync(RES).map((f) => normalizeUrl((parseDocument(readFileSync(path.join(RES, f), 'utf8')).toJS() as { url: string }).url) ?? f),
  );

  const stats = { written: 0, out: 0, todoDesc: 0, skipped: 0 };
  const outs: Out[] = [];
  for (const f of readdirSync(DRAFTS).filter((f) => f.endsWith('.out.json')).sort()) {
    outs.push(...(JSON.parse(readFileSync(path.join(DRAFTS, f), 'utf8')) as Out[]));
  }
  const rejected: Out[] = [];

  for (const o of outs) {
    const c = candidates.get(o.key);
    if (!c) {
      stats.skipped++;
      continue;
    }
    if (o.decision !== 'in') {
      stats.out++;
      rejected.push(o);
      continue;
    }
    const isRepo = c.key.startsWith('github.com/');
    const page = pages[c.key];
    const url = (isRepo && page?.github?.homepage?.startsWith('https://') ? page.github.homepage : c.url).replace(/^http:/, 'https:');
    if (existingUrls.has(normalizeUrl(url) ?? url)) {
      stats.skipped++;
      continue;
    }
    const category = o.category && areaOf.has(o.category) ? o.category : c.category && areaOf.has(c.category) ? c.category : 'reference';
    const resTags = (o.tags ?? []).filter((t) => tags.has(t)).slice(0, 6);
    if (resTags.length === 0) resTags.push('web');

    const pt = o.description?.pt?.trim();
    const en = o.description?.en?.trim();
    const okDesc = validDescription(pt) && validDescription(en);
    if (!okDesc) stats.todoDesc++;

    const name = (o.name ?? c.name).trim();
    let slug = slugify(name);
    for (let n = 2; used.has(slug); n++) slug = `${slugify(name)}-${n}`;
    used.add(slug);
    existingUrls.add(normalizeUrl(url) ?? url);

    const license = o.license ?? page?.github?.license;
    const doc: Record<string, unknown> = {
      name,
      url,
      ...(isRepo ? { repo: `https://github.com/${c.github?.repo ?? c.key.split('/').slice(1, 3).join('/')}` } : {}),
      area: areaOf.get(category),
      category,
      tags: resTags,
      pricing: o.pricing && PRICING.includes(o.pricing) ? o.pricing : 'TODO',
      open_source: typeof o.open_source === 'boolean' ? o.open_source : 'TODO',
      ...(license ? { license } : {}),
      description: okDesc ? { pt, en } : { pt: 'TODO', en: 'TODO' },
      added: TODAY,
      last_checked: TODAY,
      status: 'draft',
      notes: `Rascunho do scout (ADR 0014). Fonte: ${c.sources.map((s) => s.list).join(', ')}. Lida: ${url}`,
    };
    writeFileSync(path.join(RES, `${slug}.yaml`), `# yaml-language-server: $schema=../schema.json\n${stringify(doc, { lineWidth: 0 })}`);
    stats.written++;
  }
  writeFileSync(path.join(ROOT, 'scouting/rejected.json'), JSON.stringify(rejected, null, 2) + '\n');
  console.log(stats);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
