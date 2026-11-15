/**
 * Ficheiros para agentes e assistentes de IA (spec 009 §6): /llms.txt, /llms-full.txt e
 * /api/resources.json. Gerados no build a partir dos YAML; só recursos `active`.
 * O llms.txt é uma proposta de padrão (llmstxt.org), não um fator de ranking.
 */
import { GITHUB_URL } from '@/components/site/nav';
import { getArea, getCategory, listAreas, listCategories, listResources, type Resource } from '@/lib/content';

import { absoluteUrl } from './metadata';

export const DATA_LICENSE = { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' };

const PRICING_EN: Record<string, string> = { free: 'Free', freemium: 'Freemium', paid: 'Paid' };

function facts(resource: Resource): string {
  const parts: string[] = [];
  if (resource.pricing !== 'TODO') parts.push(PRICING_EN[resource.pricing] ?? resource.pricing);
  if (resource.open_source === true) parts.push('open source');
  if (resource.license) parts.push(`license ${resource.license}`);
  if (resource.author) parts.push(`by ${resource.author}`);
  return parts.join(', ');
}

export function llmsTxt(): string {
  const areas = listAreas();
  const lines = [
    '# FrontDex',
    '',
    '> FrontDex is an open-source, curated index of front-end resources (tools, libraries, courses, inspiration and communities), in Portuguese (pt-BR) and English. Every resource has a short note written by a person that explains why it is in the index. Made in Angola.',
    '',
    `Resources are organized in ${areas.length} areas, each with categories. Every resource has its own page with a description written by FrontDex (not copied from the source), the facts (pricing, open source, license, author, date added) and, when available, the "why it is here" note. Data is open under ${DATA_LICENSE.name}.`,
    '',
    '## Areas',
    '',
    ...areas.map(
      (area) =>
        `- [${area.name.en}](${absoluteUrl(`/en/${area.slug}`)}): ${area.description.en} (pt: ${absoluteUrl(`/pt/${area.slug}`)})`,
    ),
    '',
    '## Categories',
    '',
    ...listCategories()
      .filter((category) => listResources({ category: category.slug }).length > 0)
      .map(
        (category) =>
          `- [${category.name.en}](${absoluteUrl(`/en/c/${category.slug}`)}): ${listResources({ category: category.slug }).length} resources in ${getArea(category.area)?.name.en ?? category.area}`,
      ),
    '',
    '## Data',
    '',
    `- [Full index in Markdown](${absoluteUrl('/llms-full.txt')}): every resource with URL, category, description and why`,
    `- [Full index as JSON](${absoluteUrl('/api/resources.json')}): machine-readable, license ${DATA_LICENSE.name}`,
    `- [Source and YAML data on GitHub](${GITHUB_URL})`,
    '',
    '## About',
    '',
    `- [How the index is curated](${absoluteUrl('/en/about')})`,
    `- [How to add a resource](${absoluteUrl('/en/add')})`,
    `- [Recently added](${absoluteUrl('/en/new')})`,
    '',
  ];
  return lines.join('\n');
}

export function llmsFullTxt(): string {
  const lines = [
    '# FrontDex — full index',
    '',
    `> Every active resource in FrontDex. Descriptions and "why" notes are written by FrontDex curators. Data license: ${DATA_LICENSE.name} (${DATA_LICENSE.url}).`,
    '',
  ];
  for (const area of listAreas()) {
    const categories = listCategories(area.slug).filter((c) => listResources({ category: c.slug }).length > 0);
    if (categories.length === 0) continue;
    lines.push(`## ${area.name.en} (${area.name.pt})`, '', area.description.en, '');
    for (const category of categories) {
      lines.push(`### ${category.name.en} (${category.name.pt})`, '');
      for (const resource of listResources({ category: category.slug })) {
        lines.push(`#### ${resource.name}`, '');
        lines.push(`- URL: ${resource.url}`);
        lines.push(
          `- FrontDex page: ${absoluteUrl(`/en/r/${resource.slug}`)} (pt: ${absoluteUrl(`/pt/r/${resource.slug}`)})`,
        );
        const resourceFacts = facts(resource);
        if (resourceFacts) lines.push(`- Facts: ${resourceFacts}`);
        lines.push(`- Added to the index: ${resource.added}; last checked: ${resource.last_checked}`);
        if (resource.tags.length > 0) lines.push(`- Tags: ${resource.tags.join(', ')}`);
        lines.push(`- Description: ${resource.description.en}`);
        if (resource.why?.en) lines.push(`- Why it is here: ${resource.why.en}`);
        lines.push('');
      }
    }
  }
  return lines.join('\n');
}

export function resourcesJson() {
  const resources = listResources();
  return {
    name: 'FrontDex',
    description: 'Open-source, curated index of front-end resources.',
    homepage: absoluteUrl('/'),
    source: GITHUB_URL,
    license: DATA_LICENSE,
    count: resources.length,
    resources: resources.map((resource) => ({
      id: resource.id ?? null,
      slug: resource.slug,
      name: resource.name,
      url: resource.url,
      repo: resource.repo ?? null,
      author: resource.author ?? null,
      area: resource.area,
      area_name: getArea(resource.area)?.name ?? null,
      category: resource.category,
      category_name: getCategory(resource.category)?.name ?? null,
      tags: resource.tags,
      pricing: resource.pricing === 'TODO' ? null : resource.pricing,
      open_source: resource.open_source === 'TODO' ? null : resource.open_source,
      license: resource.license ?? null,
      description: resource.description,
      why: resource.why ?? null,
      added: resource.added,
      last_checked: resource.last_checked,
      pages: { pt: absoluteUrl(`/pt/r/${resource.slug}`), en: absoluteUrl(`/en/r/${resource.slug}`) },
    })),
  };
}
