import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { stringify } from 'yaml';

import { findTodoPaths, TODO } from '../lib/content/schema';

type Issue = { number: number; title: string; body: string | null };
type ConvertedResource = { slug: string; needsTranslation: boolean; yaml: string };

const FIELD = {
  name: 'Nome oficial',
  url: 'URL principal',
  repo: 'Repositório (opcional)',
  author: 'Autor ou organização (opcional)',
  area: 'Área',
  category: 'Categoria (slug)',
  tags: 'Tags (slugs separados por vírgula)',
  pricing: 'Preço',
  openSource: 'Código open source?',
  license: 'Licença (opcional)',
  level: 'Nível (opcional)',
  descriptionPt: 'Descrição em português (40–160 caracteres)',
  descriptionEn: 'Descrição em inglês (40–160 caracteres)',
  whyPt: 'Por que vale a pena? (português, opcional)',
  whyEn: 'Why it belongs (English, optional)',
} as const;

function answerFor(body: string, label: string): string {
  const sections = body.split(/^### /m).slice(1);
  const section = sections.find((part) => part.slice(0, part.indexOf('\n')).trim() === label);
  if (!section) return '';

  const answer = section.slice(section.indexOf('\n') + 1).trim();
  if (!answer || answer === 'No response') return '';

  const lines = answer
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.every((line) => /^- \[[ x]\]\s+.+$/i.test(line))) {
    return lines
      .filter((line) => /^- \[x\]/i.test(line))
      .map((line) => line.replace(/^- \[x\]\s+/i, '').trim())
      .join(', ');
  }
  return answer;
}

function requiredAnswer(body: string, label: string): string {
  const answer = answerFor(body, label);
  if (!answer) throw new Error(`O campo "${label}" é obrigatório no Issue Form.`);
  return answer;
}

function slugify(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

function parsePricing(value: string): string {
  return ['free', 'freemium', 'paid'].includes(value) ? value : TODO;
}

function parseOpenSource(value: string): boolean | string {
  if (value === 'Sim') return true;
  if (value === 'Não') return false;
  return TODO;
}

function parseList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function optionalField(resource: Record<string, unknown>, key: string, value: string) {
  if (value) resource[key] = value;
}

export function convertIssueToYaml(issue: Issue, date = new Date().toISOString().slice(0, 10)): ConvertedResource {
  if (!Number.isInteger(issue.number) || issue.number < 1) throw new Error('O número do issue é inválido.');
  const body = issue.body ?? '';
  const name = requiredAnswer(body, FIELD.name);
  const url = requiredAnswer(body, FIELD.url);
  const area = requiredAnswer(body, FIELD.area);
  const category = requiredAnswer(body, FIELD.category);
  const tags = parseList(requiredAnswer(body, FIELD.tags));
  if (tags.length === 0) throw new Error(`O campo "${FIELD.tags}" precisa de pelo menos uma tag.`);

  const descriptionPt = answerFor(body, FIELD.descriptionPt) || TODO;
  const descriptionEn = answerFor(body, FIELD.descriptionEn) || TODO;
  const resource: Record<string, unknown> = {
    name,
    url,
    area,
    category,
    tags,
    pricing: parsePricing(answerFor(body, FIELD.pricing)),
    open_source: parseOpenSource(answerFor(body, FIELD.openSource)),
    description: { pt: descriptionPt, en: descriptionEn },
    added: date,
    last_checked: date,
  };

  optionalField(resource, 'repo', answerFor(body, FIELD.repo));
  optionalField(resource, 'author', answerFor(body, FIELD.author));
  optionalField(resource, 'license', answerFor(body, FIELD.license));
  const level = parseList(answerFor(body, FIELD.level));
  if (level.length > 0) resource.level = level;

  const whyPt = answerFor(body, FIELD.whyPt);
  const whyEn = answerFor(body, FIELD.whyEn);
  if (whyPt || whyEn) {
    resource.why = {
      ...(whyPt ? { pt: whyPt } : {}),
      ...(whyEn ? { en: whyEn } : {}),
    };
  }

  resource.status = findTodoPaths(resource).length > 0 ? 'draft' : 'active';
  return {
    slug: slugify(name) || `resource-${issue.number}`,
    needsTranslation: descriptionPt === TODO,
    yaml: stringify(resource, { lineWidth: 0 }).trimEnd(),
  };
}

function readIssueEvent(eventPath: string): Issue {
  const event: unknown = JSON.parse(readFileSync(eventPath, 'utf8'));
  if (
    !event ||
    typeof event !== 'object' ||
    !('issue' in event) ||
    !event.issue ||
    typeof event.issue !== 'object' ||
    !('number' in event.issue) ||
    typeof event.issue.number !== 'number' ||
    !('title' in event.issue) ||
    typeof event.issue.title !== 'string' ||
    !('body' in event.issue) ||
    (typeof event.issue.body !== 'string' && event.issue.body !== null)
  ) {
    throw new Error('O payload do evento não contém um issue válido.');
  }
  return {
    number: event.issue.number,
    title: event.issue.title,
    body: event.issue.body,
  };
}

function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH ?? process.argv[2];
  if (!eventPath) throw new Error('Define GITHUB_EVENT_PATH ou informa o caminho do evento.');
  const issue = readIssueEvent(eventPath);
  const converted = convertIssueToYaml(issue);
  const outputDir = path.resolve(process.argv[3] ?? 'data/resources');
  const filePath = path.join(outputDir, `${converted.slug}.yaml`);
  if (existsSync(filePath)) throw new Error(`Já existe um recurso com o slug "${converted.slug}".`);
  writeFileSync(filePath, converted.yaml + '\n', { flag: 'wx' });

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `slug=${converted.slug}\nneeds_translation=${converted.needsTranslation}\n`,
    );
  }
  console.log(`Criado data/resources/${converted.slug}.yaml`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (isMain) main();
